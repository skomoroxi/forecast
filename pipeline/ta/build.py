"""Build ta.json: indicators, moving averages, pivots and summaries for D / W / M (TECHNICAL-TASK §5.4)."""

from __future__ import annotations

from datetime import date, datetime, timezone

import pandas as pd

from pipeline.schemas import AssetConfig, PriceHistory, TechnicalAnalysis
from pipeline.ta import indicators as ind
from pipeline.ta import rules

MA_PERIODS = (5, 10, 20, 50, 100, 200)
TIMEFRAMES = {"daily": None, "weekly": "W-FRI", "monthly": "ME"}


def frame(history: PriceHistory) -> pd.DataFrame:
    df = pd.DataFrame([b.model_dump() for b in history.bars])
    df.index = pd.DatetimeIndex(pd.to_datetime(df.pop("date")))
    return df[["open", "high", "low", "close"]]


def resample(df: pd.DataFrame, rule: str | None) -> pd.DataFrame:
    if rule is None:
        return df
    # The latest week/month is still in progress; it is included, as on most TA dashboards.
    return df.resample(rule).agg({"open": "first", "high": "max", "low": "min", "close": "last"}).dropna()


def _r(x: float | None, nd: int = 4) -> float | None:
    return None if x is None or pd.isna(x) else round(float(x), nd)


def analyse(df: pd.DataFrame, period_complete: bool) -> dict:
    """period_complete: the last bar is a finished period (daily); weekly/monthly bars are still in progress."""
    close = float(df["close"].iloc[-1])
    macd_line, macd_signal = ind.macd(df)
    adx, plus_di, minus_di = ind.adx(df)
    atr, atr_avg = ind.atr(df)
    values = {
        "rsi_14": (ind.rsi(df), lambda v: rules.zone(v, 50, 30, 70)),
        "stoch_9_6": (ind.stoch(df), lambda v: rules.zone(v, 50, 20, 80)),
        "stochrsi_14": (ind.stoch_rsi(df), lambda v: rules.zone(v, 50, 20, 80)),
        "macd_12_26": (macd_line, rules.sign),
        "adx_14": (adx, lambda v: rules.adx_action(v, plus_di, minus_di)),
        "williams_r_14": (ind.williams_r(df), lambda v: rules.zone(v, -50, -80, -20)),
        "cci_14": (ind.cci(df), lambda v: rules.zone(v, 0, -200, 200)),
        "atr_14": (atr, lambda v: rules.atr_action(v, atr_avg)),
        "highs_lows_14": (ind.highs_lows(df), rules.sign),
        "ultimate_oscillator": (ind.ultimate_oscillator(df), lambda v: rules.zone(v, 50, 30, 70)),
        "roc_12": (ind.roc(df), rules.sign),
        "bull_bear_power_13": (ind.bull_bear_power(df), rules.sign),
    }
    oscillators = []
    counts = {"buy": 0, "sell": 0, "neutral": 0}
    for name, (value, rule) in values.items():
        action = rule(value)
        oscillators.append({"name": name, "value": _r(value), "action": action})
        if name == "atr_14":
            continue  # volatility measure, no direction
        counts["buy" if action == rules.BUY else "sell" if action == rules.SELL else "neutral"] += 1
    oscillators[3]["signal_line"] = _r(macd_signal)
    oscillators[4] |= {"plus_di": _r(plus_di, 2), "minus_di": _r(minus_di, 2)}

    mas = []
    ma_counts = {"buy": 0, "sell": 0, "neutral": 0}
    for n in MA_PERIODS:
        row = {"period": n}
        for kind, fn in (("simple", ind.sma_last), ("exponential", ind.ema_last)):
            v = fn(df["close"], n)
            action = rules.price_vs_ma(close, v)
            row[kind] = {"value": _r(v), "action": action}
            if action:
                ma_counts[action] += 1
        mas.append(row)

    total = {k: counts[k] + ma_counts[k] for k in counts}
    return {
        "bar_date": df.index[-1].date().isoformat(),
        "close": _r(close),
        "oscillators": oscillators,
        "moving_averages": mas,
        # Pivots for the coming/current period come from the last finished one.
        "pivots": ind.pivots(df.iloc[-1] if period_complete else df.iloc[-2]) if len(df) >= 2 else {},
        "summary": {
            "oscillators": counts | {"verdict": rules.verdict(**counts)},
            "moving_averages": ma_counts | {"verdict": rules.verdict(**ma_counts)},
            "overall": total | {"verdict": rules.verdict(**total)},
        },
    }


def build(asset: AssetConfig, history: PriceHistory, run_date: date) -> TechnicalAnalysis:
    df = frame(history)
    return TechnicalAnalysis(
        asset=asset.id,
        generated_at=datetime.now(timezone.utc).replace(microsecond=0),
        run_date=run_date,
        ohlc_basis="proxy" if any(b.ohlc == "proxy" for b in history.bars[-300:]) else "actual",
        timeframes={name: analyse(resample(df, rule), period_complete=rule is None) for name, rule in TIMEFRAMES.items()},
    )
