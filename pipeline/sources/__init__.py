from pipeline.sources.alphavantage import AlphaVantageSource
from pipeline.sources.base import PriceSource, SourceError
from pipeline.sources.twelvedata import TwelveDataSource

# Bars requested for a full backfill.
MAX_HISTORY = 10_000  # Twelve Data caps each request at MAX_OUTPUTSIZE itself


def get_source(name: str) -> PriceSource:
    if name == "twelvedata":
        return TwelveDataSource.from_env()
    if name == "alphavantage":
        return AlphaVantageSource.from_env()
    raise ValueError(f"unknown price source: {name}")


__all__ = ["MAX_HISTORY", "AlphaVantageSource", "PriceSource", "SourceError", "TwelveDataSource", "get_source"]
