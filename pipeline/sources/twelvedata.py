"""Twelve Data adapter (https://twelvedata.com/docs#time-series).

The API key comes from the TWELVEDATA_API_KEY environment variable only. It is never logged.
"""

from __future__ import annotations

import os
import time

import requests

from pipeline.schemas import Bar
from pipeline.sources.base import SourceError

API_URL = "https://api.twelvedata.com/time_series"
MAX_OUTPUTSIZE = 5000
# Free plan: 8 requests per minute. Space requests so a run over many assets never hits the limit.
MIN_INTERVAL = 8.0
_last_request = 0.0


class TwelveDataSource:
    name = "twelvedata"

    def __init__(self, api_key: str, session: requests.Session | None = None, retries: int = 3):
        if not api_key:
            raise SourceError("TWELVEDATA_API_KEY is not set")
        self._api_key = api_key
        self._session = session or requests.Session()
        self._retries = retries
        self._no_wait = session is not None  # tests use a fake session: no spacing needed

    @classmethod
    def from_env(cls) -> TwelveDataSource:
        return cls(os.environ.get("TWELVEDATA_API_KEY", ""))

    def daily_bars(self, symbol: str, count: int) -> list[Bar]:
        params = {
            "symbol": symbol,
            "interval": "1day",
            "outputsize": min(count, MAX_OUTPUTSIZE),
            "order": "asc",
            "timezone": "UTC",
            "apikey": self._api_key,
        }
        payload = self._get(params)
        values = payload.get("values") or []
        if not values:
            raise SourceError(f"twelvedata returned no values for {symbol}")
        return [_to_bar(v) for v in values]

    def _get(self, params: dict) -> dict:
        global _last_request
        last_error = ""
        for attempt in range(self._retries):
            wait = _last_request + MIN_INTERVAL - time.monotonic()
            if wait > 0 and not self._no_wait:
                time.sleep(wait)
            _last_request = time.monotonic()
            try:
                resp = self._session.get(API_URL, params=params, timeout=30)
            except requests.RequestException as exc:
                last_error = type(exc).__name__
            else:
                try:
                    payload = resp.json()
                except ValueError:
                    payload = None
                if payload is None:
                    last_error = f"HTTP {resp.status_code}"
                elif payload.get("status") == "error":
                    # Errors come as JSON, sometimes with a matching HTTP status (e.g. 404 for a
                    # symbol not in the plan). 429 = per-minute credit limit: wait and retry.
                    code = payload.get("code")
                    if code != 429:
                        raise SourceError(f"twelvedata error {code}: {payload.get('message')}")
                    last_error = "rate limited"
                elif resp.status_code == 200:
                    return payload
                else:
                    last_error = f"HTTP {resp.status_code}"
            if attempt < self._retries - 1:
                time.sleep(15 * (attempt + 1))
        raise SourceError(f"twelvedata request failed after {self._retries} attempts: {last_error}")


def _to_bar(v: dict) -> Bar:
    volume = v.get("volume")
    return Bar(
        date=v["datetime"][:10],
        open=float(v["open"]),
        high=float(v["high"]),
        low=float(v["low"]),
        close=float(v["close"]),
        volume=float(volume) if volume not in (None, "") else None,
    )
