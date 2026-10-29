"""Load, merge, validate and save an asset's daily price history (data/<asset>/prices.json)."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone
from pathlib import Path

from pipeline.schemas import AssetConfig, Bar, PriceHistory

log = logging.getLogger(__name__)


class PriceJumpError(RuntimeError):
    """A new close differs from the previous one by more than the asset's max_daily_change."""


def load(path: Path) -> PriceHistory | None:
    if not path.exists():
        return None
    return PriceHistory.model_validate_json(path.read_text(encoding="utf-8"))


def save(history: PriceHistory, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = history.model_dump(mode="json", exclude_defaults=True)
    # One bar per line keeps daily git diffs small and readable.
    bars = ",\n".join("    " + json.dumps(b, separators=(", ", ": ")) for b in data.pop("bars"))
    head = json.dumps(data, indent=2)[:-2]
    path.write_text(f'{head},\n  "bars": [\n{bars}\n  ]\n}}\n', encoding="utf-8", newline="\n")


def drop_incomplete(bars: list[Bar], today: date) -> list[Bar]:
    """Drop today's bar: at run time (01:15 UTC) the current daily candle is still forming."""
    return [b for b in bars if b.date < today]


def drop_non_trading_days(bars: list[Bar], calendar: str) -> list[Bar]:
    if calendar in ("fx", "nyse"):
        return [b for b in bars if b.date.weekday() < 5]
    return bars


def apply_proxy_range(bars: list[Bar], proxy: list[Bar]) -> list[Bar]:
    """Estimate open/high/low for close-only bars from a tracking instrument's OHLC.

    The proxy's bar is scaled by spot_close / proxy_close for that day, so the estimated range
    has the proxy's shape around the true spot close. Days without a proxy bar stay close-only.
    """
    by_date = {p.date: p for p in proxy}
    out = []
    for bar in bars:
        p = by_date.get(bar.date)
        if bar.ohlc != "close" or p is None:
            out.append(bar)
            continue
        k = bar.close / p.close
        # Round first, then clamp: the unrounded spot close must stay inside the range.
        open_ = round(p.open * k, 4)
        out.append(bar.model_copy(update={
            "open": open_,
            "high": max(round(p.high * k, 4), open_, bar.close),
            "low": min(round(p.low * k, 4), open_, bar.close),
            "ohlc": "proxy",
        }))
    return out


def merge(existing: list[Bar], fresh: list[Bar]) -> tuple[list[Bar], list[Bar]]:
    """Upsert fresh bars by date (the provider may revise recent bars). Returns (merged, changed)."""
    by_date = {b.date: b for b in existing}
    changed = [b for b in fresh if by_date.get(b.date) != b]
    for b in fresh:
        by_date[b.date] = b
    return [by_date[d] for d in sorted(by_date)], changed


def check_jumps(merged: list[Bar], changed: list[Bar], max_change: float) -> None:
    """Fail if any new or revised bar jumps more than max_change from the previous close."""
    index = {b.date: i for i, b in enumerate(merged)}
    for bar in changed:
        i = index[bar.date]
        if i == 0:
            continue
        prev = merged[i - 1].close
        change = abs(bar.close / prev - 1)
        if change > max_change:
            raise PriceJumpError(
                f"{bar.date}: close {bar.close} vs previous {prev} ({change:.1%}) exceeds "
                f"{max_change:.0%}. Check the source; rerun with --allow-jumps if the move is real."
            )


def update(
    asset: AssetConfig,
    fresh: list[Bar],
    existing: PriceHistory | None,
    source_name: str,
    today: date,
    allow_jumps: bool = False,
    proxy: list[Bar] | None = None,
) -> tuple[PriceHistory, int]:
    """Merge freshly fetched bars into the stored history. Returns (history, bars added or revised)."""
    fresh = drop_non_trading_days(drop_incomplete(fresh, today), asset.calendar)
    if proxy:
        fresh = apply_proxy_range(fresh, proxy)
    old_bars = existing.bars if existing else []
    merged, changed = merge(old_bars, fresh)
    # Jump check guards daily updates only: a first backfill takes the provider's full history.
    if existing and not allow_jumps:
        check_jumps(merged, changed, asset.max_daily_change)
    history = PriceHistory(
        asset=asset.id,
        symbol=asset.symbol,
        currency=asset.currency,
        source=source_name,
        updated_at=datetime.now(timezone.utc).replace(microsecond=0) if changed or not existing else existing.updated_at,
        bars=merged,
    )
    return history, len(changed)
