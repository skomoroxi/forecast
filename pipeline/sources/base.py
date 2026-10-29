"""Common interface for price providers. Every adapter returns daily bars in the same shape."""

from __future__ import annotations

from typing import Protocol

from pipeline.schemas import Bar


class SourceError(RuntimeError):
    """The provider failed or returned unusable data."""


class PriceSource(Protocol):
    name: str

    def daily_bars(self, symbol: str, count: int) -> list[Bar]:
        """Return up to `count` most recent daily bars, oldest first."""
        ...
