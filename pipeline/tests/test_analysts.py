"""analysts.json is edited by hand; these checks run in CI so a bad entry never reaches the site."""

from pathlib import Path

import pytest
from pydantic import ValidationError

from pipeline.prices import load
from pipeline.schemas import AnalystEntry, Analysts

ROOT = Path(__file__).resolve().parents[2]


def entry(**kw):
    base = dict(id="x", institution="Bank", type="bank", target_usd=60, basis="average", horizon="2026-Q4",
                published_on="2026-10-01", source_title="Outlook note", source_url="https://example.com/note")
    return AnalystEntry(**(base | kw))


@pytest.mark.parametrize("path", sorted(ROOT.glob("data/*/analysts.json")), ids=lambda p: p.parent.name)
def test_committed_analysts_files_are_valid(path):
    a = Analysts.model_validate_json(path.read_text(encoding="utf-8"))
    prices = load(path.parent / "prices.json")
    if prices:
        last = prices.bars[-1].close
        for e in a.entries:
            for v in (e.target_usd, e.target_low_usd, e.target_high_usd):
                assert v is None or 0.1 * last <= v <= 10 * last, f"{e.id}: {v} is outside 0.1x–10x of {last}"


def test_entry_requires_https_source_and_one_target_form():
    entry()
    with pytest.raises(ValidationError):
        entry(source_url="http://example.com")
    with pytest.raises(ValidationError):
        entry(target_low_usd=50, target_high_usd=70)  # point and range together
    with pytest.raises(ValidationError):
        entry(target_usd=None, target_low_usd=70, target_high_usd=50)
    with pytest.raises(ValidationError):
        entry(horizon="end of 2026")
