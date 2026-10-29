"""Alpha Vantage adapter for gold/silver spot history
(https://www.alphavantage.co/documentation/#gold-silver-history).

The endpoint returns one price per day and no open/high/low, so bars come back as
close-only (`ohlc="close"`). Use an `ohlc_proxy` in config/assets.yml to estimate the range.
The API key comes from ALPHAVANTAGE_API_KEY only and is never logged.
"""

from __future__ import annotations

import os
import time

import requests

from pipeline.schemas import Bar
from pipeline.sources.base import SourceError

API_URL = "https://www.alphavantage.co/query"


class AlphaVantageSource:
    name = "alphavantage"

    def __init__(self, api_key: str, session: requests.Session | None = None, retries: int = 3):
        if not api_key:
            raise SourceError("ALPHAVANTAGE_API_KEY is not set")
        self._api_key = api_key
        self._session = session or requests.Session()
        self._retries = retries

    @classmethod
    def from_env(cls) -> AlphaVantageSource:
        return cls(os.environ.get("ALPHAVANTAGE_API_KEY", ""))

    def daily_bars(self, symbol: str, count: int) -> list[Bar]:
        params = {"function": "GOLD_SILVER_HISTORY", "symbol": symbol, "interval": "daily", "apikey": self._api_key}
        rows = self._get(params).get("data") or []
        if not rows:
            raise SourceError(f"alphavantage returned no data for {symbol}")
        bars = []
        for row in rows:
            price = float(row["price"])
            bars.append(Bar(date=row["date"], open=price, high=price, low=price, close=price, ohlc="close"))
        bars.sort(key=lambda b: b.date)
        return bars[-count:]

    def _get(self, params: dict) -> dict:
        last_error = ""
        for attempt in range(self._retries):
            try:
                resp = self._session.get(API_URL, params=params, timeout=60)
                payload = resp.json()
            except (requests.RequestException, ValueError) as exc:
                last_error = type(exc).__name__
            else:
                # Problems come back as HTTP 200 with an "Error Message", "Information" or "Note" key.
                if "Error Message" in payload:
                    raise SourceError(f"alphavantage error: {payload['Error Message']}")
                message = payload.get("Information") or payload.get("Note")
                if not message:
                    return payload
                last_error = message
            if attempt < self._retries - 1:
                time.sleep(20 * (attempt + 1))
        raise SourceError(f"alphavantage request failed after {self._retries} attempts: {last_error}")
