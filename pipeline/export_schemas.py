"""Export the JSON contract as JSON Schema for the site: python -m pipeline.export_schemas"""

from __future__ import annotations

import json
from pathlib import Path

from pipeline.schemas import Forecast, PriceHistory, TechnicalAnalysis

OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "schemas"
MODELS = {"prices": PriceHistory, "forecast": Forecast, "ta": TechnicalAnalysis}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, model in MODELS.items():
        (OUT / f"{name}.schema.json").write_text(
            json.dumps(model.model_json_schema(), indent=2) + "\n", encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
