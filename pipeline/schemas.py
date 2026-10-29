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


class LastClose(BaseModel):
    date: date
    price: float


class MethodInfo(BaseModel):
    status: Literal["ok", "failed"]
    error: str | None = None
    params: dict


class Band(BaseModel):
    avg: float
    min: float
    max: float


class DailyRow(BaseModel):
    date: date
    arima: float | None = None
    reversion: float | None = None
    montecarlo: float | None = None
    consensus: float | None = None
    low: float | None = None
    high: float | None = None


class MonthlyRow(BaseModel):
    month: str  # YYYY-MM
    arima: Band | None = None
    reversion: Band | None = None
    montecarlo: Band | None = None
    consensus: Band | None = None


class YearlyRow(BaseModel):
    year: int
    reversion: float | None = None
    montecarlo: float | None = None
    consensus: float | None = None
    p10: float | None = None
    p90: float | None = None


class Accuracy(BaseModel):
    mape_1d: float
    mape_7d: float
    mape_30d: float
    basis: Literal["walk-forward", "live"]
    samples: int


class Forecast(BaseModel):
    """data/<asset>/forecast.json"""

    asset: str
    generated_at: datetime
    run_date: date
    last_close: LastClose
    methods: dict[str, MethodInfo]
    daily: list[DailyRow]
    monthly: list[MonthlyRow]
    yearly: list[YearlyRow]
    accuracy: dict[str, Accuracy]


class Oscillator(BaseModel):
    name: str
    value: float | None
    action: str
    signal_line: float | None = None
    plus_di: float | None = None
    minus_di: float | None = None


class MAValue(BaseModel):
    value: float | None
    action: Literal["buy", "sell", "neutral"] | None


class MovingAverage(BaseModel):
    period: int
    simple: MAValue
    exponential: MAValue


class Tally(BaseModel):
    buy: int
    sell: int
    neutral: int
    verdict: Literal["strong_sell", "sell", "neutral", "buy", "strong_buy"]


class Summary(BaseModel):
    oscillators: Tally
    moving_averages: Tally
    overall: Tally


class Timeframe(BaseModel):
    bar_date: date
    close: float
    oscillators: list[Oscillator]
    moving_averages: list[MovingAverage]
    pivots: dict[str, dict[str, float]]
    summary: Summary


class TechnicalAnalysis(BaseModel):
    """data/<asset>/ta.json"""

    asset: str
    generated_at: datetime
    run_date: date
    ohlc_basis: Literal["actual", "proxy"]  # proxy: high/low estimated (silver from SLV)
    timeframes: dict[Literal["daily", "weekly", "monthly"], Timeframe]


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
