"""Validate every data file against the JSON contract: python -m pipeline.validate

Runs in the daily workflow before committing and in CI, so a malformed file never reaches the site.
"""

from __future__ import annotations

import sys
from pathlib import Path

from pydantic import ValidationError

from pipeline.schemas import Analysts, Forecast, PriceHistory, TechnicalAnalysis

ROOT = Path(__file__).resolve().parent.parent
FILES = {"prices.json": PriceHistory, "forecast.json": Forecast, "ta.json": TechnicalAnalysis, "analysts.json": Analysts}
REQUIRED = ("prices.json", "forecast.json", "ta.json")


def main() -> int:
    errors = []
    folders = sorted(p for p in (ROOT / "data").iterdir() if p.is_dir())
    for folder in folders:
        for name, model in FILES.items():
            path = folder / name
            if not path.exists():
                if name in REQUIRED:
                    errors.append(f"{path.relative_to(ROOT)}: missing")
                continue
            try:
                model.model_validate_json(path.read_text(encoding="utf-8"))
            except ValidationError as exc:
                errors.append(f"{path.relative_to(ROOT)}: {exc.error_count()} error(s)\n{exc}")
    for e in errors:
        print(f"ERROR {e}", file=sys.stderr)
    print(f"validated {len(folders)} asset folder(s), {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
