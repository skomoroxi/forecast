# FinForecast

Daily price predictions for silver (and later gold and bitcoin): three statistical forecasts, monthly outlooks to 2030 and technical analysis. A static site built with Astro, data computed in Python, updated daily by GitHub Actions and hosted on Cloudflare Pages.

See [`docs/TECHNICAL-TASK.md`](docs/TECHNICAL-TASK.md) for the full specification.

## Status
- [x] **M1: repo setup and data.** Astro skeleton, price pipeline and silver history since 2011.
- [x] **M2: forecast models and technical analysis.** ARIMA, trend + mean reversion, Monte Carlo, consensus, backtest; 12 oscillators, 12 moving averages and 5 pivot sets on daily/weekly/monthly.
- [x] **M3: design system and `/styleguide`.** Tokens, 14 components, lazy chart and SVG gauges. Awaiting owner approval; placeholder image until the renders are ready (docs/DESIGN.md §8).
- [x] **M4: pages.** Hub, silver prediction page (17 blocks, generated text), methodology, about, author, disclaimer, privacy, 404.
- [x] **M5: SEO and automation.** JSON-LD, sitemap, robots/noindex switch, OG images, self-hosted fonts, daily-update and CI workflows, Dependabot. Setup steps: [docs/DEPLOY.md](docs/DEPLOY.md).
- [ ] M6: QA and launch (blocked until the domain is decided)

## Data sources
| Asset | Price | Daily high/low |
|---|---|---|
| Silver (XAG/USD) | Alpha Vantage `GOLD_SILVER_HISTORY` (free; daily price) | Estimated from the SLV ETF on Twelve Data (scaled to the spot close) |
| Gold (XAU/USD), Bitcoin (BTC/USD), later | Twelve Data (free plan) | Twelve Data |

Market data: Twelve Data, Alpha Vantage. Non-commercial use.

## Setup
1. Get free API keys from [Twelve Data](https://twelvedata.com) and [Alpha Vantage](https://www.alphavantage.co/support/#api-key).
2. Local runs: copy `.env.example` to `.env` and fill in both keys. `.env` is git-ignored.
3. GitHub Actions: add `TWELVEDATA_API_KEY` and `ALPHAVANTAGE_API_KEY` as repository secrets (Settings → Secrets and variables → Actions).

```bash
python -m venv .venv
.venv/Scripts/pip install -r pipeline/requirements.txt   # macOS/Linux: .venv/bin/pip
.venv/Scripts/python -m pytest -q pipeline
.venv/Scripts/python -m pipeline.run --asset silver       # daily update
npm install && npm run build
```

## Adding an asset
Add or enable an entry in `config/assets.yml`, then run `python -m pipeline.run --asset <id> --backfill`.
