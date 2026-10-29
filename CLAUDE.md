# FinForecast

Static price-forecast site: an Astro front end plus a Python data pipeline, updated daily by GitHub Actions and hosted on Cloudflare Pages.

- **Spec:** `docs/TECHNICAL-TASK.md` (scope, data, models, pages, acceptance criteria). Check the milestone table (§12) for what is in scope now.
- **Design:** follow `docs/DESIGN.md` for all UI work. Use tokens only, no hard-coded colors.
- **SEO structure** of asset pages: `docs/SEO-silver.md`.

## Rules
- Never commit API keys. They live in `.env` locally (git-ignored) and in GitHub Secrets (`TWELVEDATA_API_KEY`, `ALPHAVANTAGE_API_KEY`). The repo is public.
- `data/**` is written only by the pipeline, except `analysts.json`, which is edited by hand (validated by `pipeline/tests/test_analysts.py`; never estimate a value).
- Page text is generated in `src/lib/text.ts` from the JSON. Never hard-code a number or a data-dependent claim in a page. Asset-specific qualitative text (drivers, bull/bear, comparison) lives in `src/lib/assetContent.ts`.
- `pipeline/schemas.py` is the JSON contract with the site. Change it there first.
- The site URL is set in one place only: `SITE_URL` in `astro.config.mjs` (the domain is not decided yet). Pages stay `noindex` until launch.
- Forecast methods: ARIMA, trend + mean reversion, Monte Carlo (Prophet was tested and dropped; see TECHNICAL-TASK §5.3). TA signal rules live only in `pipeline/ta/rules.py`.
- Silver: Twelve Data's free plan has no XAG/USD. Silver spot comes from Alpha Vantage (close only), and the daily high/low is estimated from the SLV ETF (`ohlc: "proxy"` bars).

## Commands
- `python -m venv .venv && .venv/Scripts/pip install -r pipeline/requirements.txt`
- `.venv/Scripts/python -m pytest -q pipeline`: pipeline tests
- `.venv/Scripts/python -m pipeline.run [--asset silver] [--backfill] [--allow-jumps] [--no-backtest] [--force]`
- `.venv/Scripts/python -m pipeline.export_schemas`: regenerate `src/lib/schemas/*.schema.json` after changing `schemas.py`
- `.venv/Scripts/python -m pipeline.validate`: validate every data file against the contract
- `npm install`, `npm run check`, `npm run build`, `npm run dev`, `node scripts/smoke.mjs` (after a build)
- Indexing is off unless the build has `INDEXING=on` (launch only). Deployment: GitHub Actions `deploy.yml` builds and uploads with Wrangler (Cloudflare never builds); details in `docs/DEPLOY.md`.
