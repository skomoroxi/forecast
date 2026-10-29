import json
from datetime import date

import numpy as np
import pandas as pd
import pytest

from pipeline.forecast import backtest, build, montecarlo, reversion
from pipeline.forecast.common import MethodForecast, future_dates, sanity_check
from pipeline.run import load_assets
from pipeline.schemas import Bar, PriceHistory
from pipeline.ta import build as ta_build
from pipeline.ta import indicators as ind
from pipeline.ta import rules


def synthetic_history(n: int = 1600, seed: int = 7, drift: float = 0.0003, vol: float = 0.015) -> PriceHistory:
    rng = np.random.default_rng(seed)
    close = 50 * np.exp(np.cumsum(drift + vol * rng.standard_normal(n)))
    dates = pd.bdate_range("2020-01-01", periods=n)
    bars = []
    for d, c in zip(dates, close):
        o = c * (1 + 0.003 * rng.standard_normal())
        bars.append(Bar(date=d.date(), open=o, high=max(o, c) * 1.006, low=min(o, c) * 0.994, close=c))
    return PriceHistory(asset="silver", symbol="XAG/USD", currency="USD", source="test",
                        updated_at="2026-01-01T00:00:00Z", bars=bars)


@pytest.fixture(scope="module")
def silver():
    return next(a for a in load_assets() if a.id == "silver")


@pytest.fixture(scope="module")
def built(silver, tmp_path_factory):
    h = synthetic_history()
    run_date = h.bars[-1].date + pd.Timedelta(days=1)
    return h, run_date, build.build(silver, h, run_date, tmp_path_factory.mktemp("history"))


def test_future_dates_skip_weekends_for_fx():
    d = future_dates(date(2026, 10, 28), date(2026, 11, 6), "fx")
    assert all(x.weekday() < 5 for x in d) and len(d) == 7
    assert len(future_dates(date(2026, 10, 28), date(2026, 11, 6), "crypto")) == 9


def test_reversion_moves_deviation_back_to_trend():
    t = np.arange(2000)
    y = np.log(40) + 0.0002 * t + 0.3 * np.exp(-((t - 1999) ** 2) / 1e5)  # ends 35% above trend
    p = reversion.fit(y)
    mid, low, high = reversion.predict_log(p, 3000)
    trend_end = p["a"] + p["b"] * (p["n"] - 1 + 3000)
    assert abs(mid[-1] - trend_end) < abs(mid[0] - (p["a"] + p["b"] * p["n"]))
    assert np.all(low < mid) and np.all(mid < high)


def test_montecarlo_is_reproducible_and_ordered():
    h = synthetic_history()
    close = pd.Series([b.close for b in h.bars])
    dates = future_dates(h.bars[-1].date, date(2027, 6, 30), "fx")
    a = montecarlo.forecast(close, dates, 1000, 300, seed=42, paths=2000)
    b = montecarlo.forecast(close, dates, 1000, 300, seed=42, paths=2000)
    assert np.array_equal(a.mid, b.mid)
    assert np.all(a.low <= a.mid) and np.all(a.mid <= a.high)


def test_sanity_check_rejects_explosive_path():
    dates = pd.bdate_range("2026-11-02", periods=300)
    mid = np.linspace(50, 900, 300)
    fc = sanity_check(MethodForecast("x", dates, mid, mid * 0.9, mid * 1.1), 50, date(2026, 10, 30))
    assert fc.status == "failed"


def test_forecast_shape(built):
    h, run_date, fc = built
    assert all(m.status == "ok" for m in fc.methods.values())
    assert fc.last_close.price == round(h.bars[-1].close, 4)
    # daily: business days within 30 calendar days of the run date
    assert 19 <= len(fc.daily) <= 23
    assert all(r.low <= r.consensus <= r.high for r in fc.daily)
    assert fc.monthly[0].month == run_date.strftime("%Y-%m") and fc.monthly[-1].month == "2030-12"
    assert [y.year for y in fc.yearly] == [2031, 2032, 2033, 2034, 2035]
    assert all(y.p10 <= y.consensus <= y.p90 for y in fc.yearly)
    assert set(fc.accuracy) == {"arima", "reversion", "montecarlo", "consensus"}
    assert fc.accuracy["consensus"].basis == "walk-forward"


def test_consensus_is_mean_of_methods(built):
    _, _, fc = built
    r = fc.daily[0]
    assert r.consensus == pytest.approx(np.mean([r.arima, r.reversion, r.montecarlo]), abs=1e-3)


def test_live_accuracy_needs_enough_archives(tmp_path):
    h = synthetic_history(200)
    close = pd.Series([b.close for b in h.bars], index=pd.DatetimeIndex([b.date for b in h.bars]))
    for i in range(10):
        rows = [{"date": str(h.bars[i + k].date), "arima": h.bars[i + k].close, "consensus": h.bars[i + k].close}
                for k in range(1, 22)]
        (tmp_path / f"forecast-{i:03d}.json").write_text(json.dumps({"daily": rows}))
    assert backtest.live(tmp_path, close) is None  # 10 < MIN_LIVE_SAMPLES


def test_indicators_on_known_series():
    up = pd.DataFrame({"close": np.arange(1.0, 61.0)})
    up["open"], up["high"], up["low"] = up["close"] - 0.5, up["close"] + 0.5, up["close"] - 1
    assert ind.rsi(up) == pytest.approx(100.0)
    assert ind.roc(up, 12) == pytest.approx(100 * (60 / 48 - 1))
    assert ind.williams_r(up) > -20
    assert ind.macd(up)[0] > 0


def test_classic_pivots():
    p = ind.pivots(pd.Series({"open": 10.0, "high": 12.0, "low": 8.0, "close": 11.0}))["classic"]
    assert p["p"] == pytest.approx(31 / 3, abs=1e-4)
    assert p["r1"] == pytest.approx(2 * 31 / 3 - 8, abs=1e-4)
    assert p["s1"] == pytest.approx(2 * 31 / 3 - 12, abs=1e-4)


def test_rules_and_verdict():
    assert rules.zone(75, 50, 30, 70) == "overbought"
    assert rules.zone(55, 50, 30, 70) == "buy"
    assert rules.zone(45, 50, 30, 70) == "sell"
    assert rules.adx_action(20, 30, 10) == "neutral" and rules.adx_action(30, 30, 10) == "buy"
    assert rules.verdict(10, 0, 2) == "strong_buy"
    assert rules.verdict(3, 3, 6) == "neutral"
    assert rules.verdict(1, 6, 5) == "sell"


def test_ta_build_has_all_timeframes(silver):
    ta = ta_build.build(silver, synthetic_history(), date(2026, 1, 2))
    assert set(ta.timeframes) == {"daily", "weekly", "monthly"}
    daily = ta.timeframes["daily"]
    assert len(daily.oscillators) == 12 and len(daily.moving_averages) == 6
    s = daily.summary.overall
    assert s.buy + s.sell + s.neutral == 11 + 12
    assert set(daily.pivots) == {"classic", "fibonacci", "camarilla", "woodie", "demark"}
