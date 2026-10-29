"""Pipeline entry point.

    python -m pipeline.run                 # daily update of all enabled assets
    python -m pipeline.run --asset silver  # one asset
    python -m pipeline.run --backfill      # (re)load the full available history
    python -m pipeline.run --allow-jumps   # accept a move bigger than max_daily_change
    python -m pipeline.run --no-backtest   # reuse the previous accuracy figures (faster)
    python -m pipeline.run --force         # recompute forecasts and TA even if prices did not change

Each asset: prices.json → forecast.json + ta.json + history/forecast-<date>.json.
Generated text is added in M4.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

from pipeline import prices
from pipeline.forecast import build as forecast_build
from pipeline.schemas import AssetConfig, Forecast, PriceHistory
from pipeline.sources import MAX_HISTORY, SourceError, get_source
from pipeline.ta import build as ta_build

ROOT = Path(__file__).resolve().parent.parent
DAILY_FETCH = 10  # recent bars re-fetched each day, so provider revisions are picked up

log = logging.getLogger("pipeline")


def load_assets(path: Path = ROOT / "config" / "assets.yml") -> list[AssetConfig]:
    return [AssetConfig.model_validate(a) for a in yaml.safe_load(path.read_text(encoding="utf-8"))]


def load_dotenv(path: Path = ROOT / ".env") -> None:
    """Minimal .env reader for local runs; GitHub Actions passes secrets as real env vars."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        key, sep, value = line.partition("=")
        if sep and not key.strip().startswith("#") and value.strip():
            os.environ.setdefault(key.strip(), value.strip())


def write_json(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text + "\n", encoding="utf-8", newline="\n")


def compute_asset(asset: AssetConfig, history: PriceHistory, run_date, backtest: bool) -> None:
    folder = ROOT / "data" / asset.id
    forecast_path = folder / "forecast.json"
    previous = None
    if not backtest and forecast_path.exists():
        previous = Forecast.model_validate_json(forecast_path.read_text(encoding="utf-8")).model_dump(mode="json")["accuracy"]
    fc = forecast_build.build(asset, history, run_date, folder / "history", previous_accuracy=previous)
    ta = ta_build.build(asset, history, run_date)
    write_json(forecast_path, fc.model_dump_json(indent=1))
    write_json(folder / "ta.json", ta.model_dump_json(indent=1))
    write_json(folder / "history" / f"forecast-{run_date.isoformat()}.json",
               json.dumps(forecast_build.archive_entry(fc), separators=(",", ":")))
    failed = [n for n, m in fc.methods.items() if m.status != "ok"]
    log.info("%s: forecast and TA written (daily verdict %s)%s", asset.id,
             ta.timeframes["daily"].summary.overall.verdict, f", FAILED methods: {failed}" if failed else "")


def update_asset(asset: AssetConfig, backfill: bool, allow_jumps: bool) -> int:
    path = ROOT / "data" / asset.id / "prices.json"
    existing = prices.load(path)
    count = MAX_HISTORY if backfill or existing is None else DAILY_FETCH
    source = get_source(asset.source.primary)
    fresh = source.daily_bars(asset.source.symbol, count)
    proxy = None
    if asset.source.ohlc_proxy:
        proxy_cfg = asset.source.ohlc_proxy
        proxy = get_source(proxy_cfg.source).daily_bars(proxy_cfg.symbol, count)
    history, changed = prices.update(
        asset, fresh, existing, source.name, datetime.now(timezone.utc).date(), allow_jumps, proxy
    )
    if changed:
        prices.save(history, path)
    log.info("%s: %d bars, %d added or revised, last %s", asset.id, len(history.bars), changed, history.bars[-1].date)
    return changed


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="FinForecast data pipeline")
    parser.add_argument("--asset", help="asset id from config/assets.yml (default: all enabled)")
    parser.add_argument("--backfill", action="store_true", help="reload the full available history")
    parser.add_argument("--allow-jumps", action="store_true", help="accept moves above max_daily_change")
    parser.add_argument("--no-backtest", action="store_true", help="reuse previous accuracy figures")
    parser.add_argument("--force", action="store_true", help="recompute even if prices did not change")
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    load_dotenv()

    assets = [a for a in load_assets() if a.enabled and (args.asset in (None, a.id))]
    if not assets:
        log.error("no enabled asset matches %r", args.asset)
        return 2

    failed = False
    for asset in assets:
        try:
            changed = update_asset(asset, args.backfill, args.allow_jumps)
            folder = ROOT / "data" / asset.id
            if changed or args.force or not (folder / "forecast.json").exists():
                history = prices.load(folder / "prices.json")
                compute_asset(asset, history, datetime.now(timezone.utc).date(), backtest=not args.no_backtest)
            else:
                log.info("%s: no new prices, forecasts unchanged", asset.id)
        except (SourceError, prices.PriceJumpError, ValueError) as exc:
            # The asset keeps yesterday's data; the non-zero exit fails the workflow and notifies.
            log.error("%s: %s", asset.id, exc)
            failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
