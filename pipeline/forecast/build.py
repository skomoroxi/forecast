"""Run all methods for one asset and build forecast.json (TECHNICAL-TASK §5.3, §5.7)."""

from __future__ import annotations

from datetime import date, datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from pipeline.forecast import arima, backtest, montecarlo, reversion
from pipeline.forecast.common import MethodForecast, bars_per_year, close_series, daily_drift_cap, failed, future_dates, sanity_check
from pipeline.schemas import AssetConfig, Forecast, PriceHistory

METHODS = ("arima", "reversion", "montecarlo")
LONG_TERM_METHODS = ("reversion", "montecarlo")  # ARIMA adds nothing beyond 2030 (flat or pure drift)
MONTHLY_UNTIL = 2030
YEARLY = range(2031, 2036)
DAILY_CALENDAR_DAYS = 30


def settings(calendar: str) -> dict:
    y = bars_per_year(calendar)
    return {
        "arima_bars": 5 * y,         # ARIMA: last 5 years
        "reversion_bars": 20 * y,    # trend + reversion: up to 20 years (all history we have)
        "mc_drift_bars": 10 * y,     # Monte Carlo drift: 10 years
        "mc_vol_bars": 3 * y,        # Monte Carlo volatility: 3 years
    }


def run_methods(asset: AssetConfig, close: pd.Series, dates: pd.DatetimeIndex, seed: int) -> dict[str, MethodForecast]:
    s = settings(asset.calendar)
    cap = daily_drift_cap(asset.max_annual_drift, asset.calendar)
    runners = {
        "arima": lambda: arima.forecast(close, dates, s["arima_bars"], cap),
        "reversion": lambda: reversion.forecast(close, dates, s["reversion_bars"], bars_per_year(asset.calendar), cap),
        "montecarlo": lambda: montecarlo.forecast(close, dates, s["mc_drift_bars"], s["mc_vol_bars"], seed, max_drift=cap),
    }
    out = {}
    last_date = close.index[-1].date()
    for name, run in runners.items():
        try:
            out[name] = sanity_check(run(), float(close.iloc[-1]), last_date)
        except Exception as exc:  # noqa: BLE001 - one failing method must not stop the others
            out[name] = failed(name, dates, f"{type(exc).__name__}: {exc}")
    return out


def consensus(methods: dict[str, MethodForecast], names: tuple[str, ...]) -> tuple[np.ndarray, np.ndarray, np.ndarray] | None:
    ok = [methods[n] for n in names if methods[n].status == "ok"]
    if not ok:
        return None
    return (np.mean([m.mid for m in ok], axis=0), np.min([m.low for m in ok], axis=0), np.max([m.high for m in ok], axis=0))


def _r(x: float) -> float:
    return round(float(x), 4)


def build(asset: AssetConfig, history: PriceHistory, run_date: date, history_dir: Path,
          previous_accuracy: dict | None = None) -> Forecast:
    """previous_accuracy: reuse it instead of re-running the walk-forward backtest (--no-backtest)."""
    close = close_series(history.bars)
    last = history.bars[-1]
    dates = future_dates(last.date, date(YEARLY[-1], 12, 31), asset.calendar)
    seed = int(run_date.strftime("%Y%m%d"))
    methods = run_methods(asset, close, dates, seed)
    accuracy = previous_accuracy if previous_accuracy is not None else compute_accuracy(asset, close, history_dir, methods["arima"])
    cons = consensus(methods, METHODS)
    cons_long = consensus(methods, LONG_TERM_METHODS)
    ok = [n for n in METHODS if methods[n].status == "ok"]

    frame = pd.DataFrame(index=dates)
    for n in ok:
        m = methods[n]
        frame[f"{n}"], frame[f"{n}_low"], frame[f"{n}_high"] = m.mid, m.low, m.high
    if cons:
        frame["consensus"], frame["consensus_low"], frame["consensus_high"] = cons
    if cons_long:
        frame["long"], frame["long_low"], frame["long_high"] = cons_long

    # Daily: next 30 calendar days from the run date.
    daily_end = pd.Timestamp(run_date) + pd.Timedelta(days=DAILY_CALENDAR_DAYS)
    daily = []
    for ts, row in frame[frame.index <= daily_end].iterrows():
        entry = {"date": ts.date().isoformat()} | {n: _r(row[n]) for n in ok}
        if cons:
            entry |= {"consensus": _r(row["consensus"]), "low": _r(row["consensus_low"]), "high": _r(row["consensus_high"])}
        daily.append(entry)

    # Monthly: from the current month through December 2030.
    monthly = []
    in_range = frame[frame.index.year <= MONTHLY_UNTIL]
    for period, g in in_range.groupby(in_range.index.to_period("M")):
        entry: dict = {"month": str(period)}
        for n in ok + (["consensus"] if cons else []):
            entry[n] = {"avg": _r(g[n].mean()), "min": _r(g[f"{n}_low"].min()), "max": _r(g[f"{n}_high"].max())}
        monthly.append(entry)

    # Yearly: 2031–2035, long-term methods only. P10/P90 are the yearly mean of the band.
    yearly = []
    for year in YEARLY:
        g = frame[frame.index.year == year]
        if g.empty:
            continue
        entry = {"year": year} | {n: _r(g[n].mean()) for n in LONG_TERM_METHODS if n in ok}
        if cons_long:
            entry |= {"consensus": _r(g["long"].mean()), "p10": _r(g["long_low"].mean()), "p90": _r(g["long_high"].mean())}
        yearly.append(entry)

    return Forecast(
        asset=asset.id,
        generated_at=datetime.now(timezone.utc).replace(microsecond=0),
        run_date=run_date,
        last_close={"date": last.date, "price": _r(last.close)},
        methods={n: {"status": m.status, "error": m.error, "params": _jsonable(m.params)} for n, m in methods.items()},
        daily=daily,
        monthly=monthly,
        yearly=yearly,
        accuracy=accuracy or {},
    )


def _jsonable(params: dict) -> dict:
    return {k: (v.item() if isinstance(v, np.generic) else v) for k, v in params.items()}


def compute_accuracy(asset: AssetConfig, close: pd.Series, history_dir: Path, arima_fc: MethodForecast) -> dict:
    live = backtest.live(history_dir, close)
    if live:
        return live
    if arima_fc.status == "ok":
        model = (arima_fc.params["order"], "t" if arima_fc.params["drift"] else "n")
    else:
        model = ((0, 1, 1), "n")
    cap = daily_drift_cap(asset.max_annual_drift, asset.calendar)
    return backtest.walk_forward(close, asset.calendar, settings(asset.calendar) | {"max_drift": cap}, model)


def archive_entry(fc: Forecast) -> dict:
    """The part of a run kept in data/<asset>/history/ for live accuracy tracking."""
    return {"run_date": fc.run_date.isoformat(), "last_close": fc.last_close.model_dump(mode="json"),
            "daily": fc.model_dump(mode="json")["daily"]}
