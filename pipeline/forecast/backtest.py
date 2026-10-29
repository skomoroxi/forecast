"""Forecast accuracy (MAPE) per method and horizon (TECHNICAL-TASK §5.3).

Until enough live forecasts are archived, accuracy comes from a walk-forward backtest: the
methods are refit at past origins on data up to that day only and compared with what happened.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd

from pipeline.forecast import arima, montecarlo, reversion

# Horizon label → bars ahead, per calendar. 7 and 30 calendar days ≈ 5 and 21 trading days.
HORIZONS = {"fx": {"1d": 1, "7d": 5, "30d": 21}, "nyse": {"1d": 1, "7d": 5, "30d": 21},
            "crypto": {"1d": 1, "7d": 7, "30d": 30}}
MIN_LIVE_SAMPLES = 30


def walk_forward(close: pd.Series, calendar: str, settings: dict, arima_model: tuple,
                 origins: int = 50, step: int = 5) -> dict:
    horizons = HORIZONS[calendar]
    longest = max(horizons.values())
    values = close.to_numpy()
    last_origin = len(values) - 1 - longest
    origin_idx = [last_origin - k * step for k in range(origins) if last_origin - k * step > settings["arima_bars"]]
    errors: dict[str, dict[str, list[float]]] = {m: {h: [] for h in horizons} for m in ("arima", "reversion", "montecarlo", "consensus")}
    order, trend = arima_model
    for i in origin_idx:
        train = values[: i + 1]
        log_train = np.log(train)
        mu, _ = montecarlo.estimate(pd.Series(train), settings["mc_drift_bars"], settings["mc_vol_bars"])
        paths = {
            "arima": np.exp(arima.predict_log(log_train[-settings["arima_bars"]:], tuple(order), trend, longest)[0]),
            "reversion": np.exp(reversion.predict_log(reversion.fit(log_train[-settings["reversion_bars"]:]), longest)[0]),
            "montecarlo": montecarlo.median_path(train[-1], mu, longest),
        }
        paths["consensus"] = np.mean([paths["arima"], paths["reversion"], paths["montecarlo"]], axis=0)
        for label, h in horizons.items():
            actual = values[i + h]
            for method, path in paths.items():
                errors[method][label].append(abs(path[h - 1] / actual - 1) * 100)
    return {
        method: {f"mape_{label}": round(float(np.mean(v)), 2) for label, v in by_h.items()} | {
            "basis": "walk-forward", "samples": len(origin_idx)}
        for method, by_h in errors.items()
    }


def live(history_dir: Path, close: pd.Series) -> dict | None:
    """MAPE from archived daily forecasts vs actual closes, once enough samples exist."""
    actual = {d.date(): v for d, v in close.items()}
    errors: dict[str, dict[str, list[float]]] = {}
    for f in sorted(history_dir.glob("forecast-*.json")):
        run = json.loads(f.read_text(encoding="utf-8"))
        rows = run["daily"]
        for label, h in (("1d", 1), ("7d", 5), ("30d", 21)):
            if len(rows) < h:
                continue
            row = rows[h - 1]
            a = actual.get(date.fromisoformat(row["date"]))
            if a is None:
                continue
            for method in ("arima", "reversion", "montecarlo", "consensus"):
                if row.get(method) is not None:
                    errors.setdefault(method, {}).setdefault(label, []).append(abs(row[method] / a - 1) * 100)
    if not errors or min(len(v) for by_h in errors.values() for v in by_h.values()) < MIN_LIVE_SAMPLES:
        return None
    return {
        method: {f"mape_{label}": round(float(np.mean(v)), 2) for label, v in by_h.items()} | {
            "basis": "live", "samples": min(len(v) for v in by_h.values())}
        for method, by_h in errors.items()
    }
