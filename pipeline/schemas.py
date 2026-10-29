"""Pydantic models: the JSON contract between the pipeline and the site (TECHNICAL-TASK §5.7)."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator


SourceName = Literal["twelvedata", "alphavantage"]


class ProxyConfig(BaseModel):
    """An instrument that tracks the asset and has real OHLC (e.g. the SLV ETF for silver)."""

    source: SourceName
    symbol: str


class SourceConfig(BaseModel):
    primary: SourceName
    symbol: str
    ohlc_proxy: ProxyConfig | None = None
    fallback: str | None = None


class AssetConfig(BaseModel):
    id: str
    name: str
    symbol: str
    slug: str
    unit: str
    currency: str
    calendar: Literal["fx", "crypto", "nyse"]
    has_volume: bool
    max_daily_change: float = Field(gt=0, lt=1)
    source: SourceConfig
    chart_color: str
    enabled: bool


class Bar(BaseModel):
    date: date
    open: float = Field(gt=0)
    high: float = Field(gt=0)
    low: float = Field(gt=0)
    close: float = Field(gt=0)
    volume: float | None = None
    # actual = provider OHLC; proxy = open/high/low scaled from ohlc_proxy; close = close only
    ohlc: Literal["actual", "proxy", "close"] = "actual"

    @model_validator(mode="after")
    def _consistent(self) -> Bar:
        if self.low > self.high:
            raise ValueError(f"{self.date}: low {self.low} > high {self.high}")
        if not (self.low <= self.open <= self.high and self.low <= self.close <= self.high):
            raise ValueError(f"{self.date}: open/close outside the high-low range")
        return self


class PriceHistory(BaseModel):
    asset: str
    symbol: str
    currency: str
    source: str
    updated_at: datetime
    bars: list[Bar]

    @model_validator(mode="after")
    def _sorted_unique(self) -> PriceHistory:
        dates = [b.date for b in self.bars]
        if dates != sorted(set(dates)):
            raise ValueError("bars must be sorted by date with no duplicates")
        return self
