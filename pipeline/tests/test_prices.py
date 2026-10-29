from datetime import date

import pytest
from pydantic import ValidationError

from pipeline import prices
from pipeline.run import load_assets
from pipeline.schemas import Bar, PriceHistory
from pipeline.sources.twelvedata import TwelveDataSource


def bar(d: str, close: float) -> Bar:
    return Bar(date=d, open=close, high=close * 1.01, low=close * 0.99, close=close)


@pytest.fixture
def silver():
    return next(a for a in load_assets() if a.id == "silver")


def test_config_loads_and_silver_enabled(silver):
    assert silver.enabled and silver.symbol == "XAG/USD" and silver.calendar == "fx"
    assert silver.source.primary == "alphavantage" and silver.source.ohlc_proxy.symbol == "SLV"


def test_proxy_range_scales_etf_bar_to_spot():
    spot = [Bar(date="2026-10-27", open=54, high=54, low=54, close=54, ohlc="close"),
            Bar(date="2026-10-28", open=55, high=55, low=55, close=55, ohlc="close")]
    slv = [Bar(date="2026-10-27", open=49, high=50, low=48, close=49.5)]  # ratio 54/49.5
    out = prices.apply_proxy_range(spot, slv)
    k = 54 / 49.5
    assert out[0].ohlc == "proxy" and out[0].close == 54
    assert out[0].high == round(50 * k, 4) and out[0].low == round(48 * k, 4)
    assert out[1].ohlc == "close"  # no SLV bar that day


def test_alphavantage_parses_and_reports_limits():
    from pipeline.sources.alphavantage import AlphaVantageSource

    ok = FakeSession({"nominal": "XAGUSD", "data": [
        {"date": "2026-10-28", "price": "54.2"}, {"date": "2026-10-27", "price": "54.0"}]})
    bars = AlphaVantageSource("k", session=ok).daily_bars("SILVER", 10)
    assert [b.close for b in bars] == [54.0, 54.2] and bars[0].ohlc == "close"

    limited = FakeSession({"Information": "rate limit reached"})
    with pytest.raises(Exception, match="rate limit"):
        AlphaVantageSource("k", session=limited, retries=1).daily_bars("SILVER", 10)


def test_bar_rejects_inconsistent_values():
    with pytest.raises(ValidationError):
        Bar(date="2026-10-27", open=50, high=49, low=51, close=50)
    with pytest.raises(ValidationError):
        Bar(date="2026-10-27", open=0, high=1, low=0, close=1)


def test_drop_incomplete_and_weekends(silver):
    bars = [bar("2026-10-24", 50), bar("2026-10-25", 50), bar("2026-10-27", 51), bar("2026-10-29", 52)]
    kept = prices.drop_non_trading_days(prices.drop_incomplete(bars, date(2026, 10, 29)), silver.calendar)
    # 24th is Saturday, 25th Sunday, 29th is "today" (still forming)
    assert [b.date.isoformat() for b in kept] == ["2026-10-27"]


def test_merge_upserts_revisions():
    old = [bar("2026-10-26", 50), bar("2026-10-27", 51)]
    fresh = [bar("2026-10-27", 51.5), bar("2026-10-28", 52)]
    merged, changed = prices.merge(old, fresh)
    assert [b.close for b in merged] == [50, 51.5, 52]
    assert len(changed) == 2


def test_update_blocks_large_jump_unless_allowed(silver):
    existing = PriceHistory(
        asset="silver", symbol="XAG/USD", currency="USD", source="twelvedata",
        updated_at="2026-10-28T01:15:00Z", bars=[bar("2026-10-27", 50)],
    )
    fresh = [bar("2026-10-28", 80)]  # +60%
    with pytest.raises(prices.PriceJumpError):
        prices.update(silver, fresh, existing, "twelvedata", date(2026, 10, 29))
    history, changed = prices.update(silver, fresh, existing, "twelvedata", date(2026, 10, 29), allow_jumps=True)
    assert changed == 1 and history.bars[-1].close == 80


def test_unchanged_data_keeps_timestamp(silver):
    existing = PriceHistory(
        asset="silver", symbol="XAG/USD", currency="USD", source="twelvedata",
        updated_at="2026-10-28T01:15:00Z", bars=[bar("2026-10-27", 50)],
    )
    history, changed = prices.update(silver, [bar("2026-10-27", 50)], existing, "twelvedata", date(2026, 10, 29))
    assert changed == 0 and history.updated_at == existing.updated_at


def test_save_roundtrip(tmp_path):
    h = PriceHistory(
        asset="silver", symbol="XAG/USD", currency="USD", source="twelvedata",
        updated_at="2026-10-28T01:15:00Z", bars=[bar("2026-10-26", 50), bar("2026-10-27", 51)],
    )
    path = tmp_path / "prices.json"
    prices.save(h, path)
    assert prices.load(path) == h


class FakeResponse:
    def __init__(self, payload, status=200):
        self.payload, self.status_code = payload, status

    def json(self):
        return self.payload


class FakeSession:
    def __init__(self, payload):
        self.payload, self.params = payload, None

    def get(self, url, params, timeout):
        self.params = params
        return FakeResponse(self.payload)


def test_twelvedata_parses_values():
    session = FakeSession({"status": "ok", "values": [
        {"datetime": "2026-10-27", "open": "50.1", "high": "51", "low": "49.5", "close": "50.8"},
    ]})
    bars = TwelveDataSource("test-key", session=session).daily_bars("XAG/USD", 10)
    assert bars[0].close == 50.8 and session.params["order"] == "asc"


def test_twelvedata_error_does_not_leak_key():
    session = FakeSession({"status": "error", "code": 401, "message": "invalid api key"})
    with pytest.raises(Exception) as err:
        TwelveDataSource("secret-key-123", session=session).daily_bars("XAG/USD", 10)
    assert "secret-key-123" not in str(err.value)
