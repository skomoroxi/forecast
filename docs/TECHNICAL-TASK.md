# Technical Task: Small Price-Forecast Website (MVP)

| | |
|---|---|
| **Repository** | https://github.com/skomoroxi/forecast (public, currently empty) |
| **Hosting** | Cloudflare Pages (static), connected to the repo's `main` branch |
| **Language** | English only |
| **Scope of this task** | Main (hub) page + asset forecast pages (silver at launch; gold, Bitcoin, XRP, Solana, Dogecoin, Nvidia, Amazon added 2026-10-29) + service pages |
| **Update frequency** | Automatically once a day (GitHub Actions) |
| **Companion documents** | `docs/DESIGN.md` (visual design), `docs/seo/silver.md` (fan-out analysis and page structure), `docs/seo/keywords-silver-us.csv` |
| **Brand** | **FinForecast** (serif wordmark; no separate logo for the MVP) |
| **Author** | Margerie Holtz, Senior Analyst; M.A. International Economics, Hochschule für Wirtschaft und Recht Berlin (HWR Berlin, 2015) |
| **Usage** | Non-commercial (no ads, no affiliate links); Twelve Data free plan |
| **Version / date** | v1.2, 2026-10-29 (author details and licensing confirmed) |

---

## 1. Goals

1. Publish an SEO-optimized page that ranks for the "silver price prediction / forecast" keyword cluster (about 80k US searches a month in total; most keywords have difficulty 5–26).
2. Show three independent statistical forecasts:
   - daily prices for the next 30 days
   - monthly averages for the rest of 2026 and for 2027–2030
   - a yearly outlook for 2031–2035
3. Show technical analysis in an investing.com-like format: indicators, moving averages, pivot points and a summary widget.
4. Run fully automatically at zero hosting cost.
5. Build an architecture that adds the next assets (gold, bitcoin) by adding **one config entry**, without new code.

## 2. Scope

**In scope:**
- **Pages:** home/hub, `/silver-price-prediction/`, `/methodology/`, `/about/`, `/disclaimer/`, `/privacy/`, `404`.
- **Data pipeline:** fetch prices, compute forecasts and technical analysis, generate text, write JSON.
- **Daily automation:** GitHub Actions then Cloudflare Pages deploy.
- **Technical SEO:** meta tags, JSON-LD, sitemap, robots.txt, Open Graph image.

**Out of scope** (later phases):
- other assets (gold and bitcoin appear on the hub as "Coming soon" cards)
- other languages
- admin panel and user accounts
- a newsletter backend (the form UI may be present but disabled or hidden)
- intraday data

## 3. Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Static site | **Astro 7** (TypeScript, `output: "static"`; Node ≥ 22.23) | Hand-written CSS with custom properties, following `docs/DESIGN.md`. No Tailwind or UI kit. |
| Charts | **TradingView Lightweight Charts 4.x** (price, forecast, bands); hand-made **SVG gauges** (no chart library needed) | Loaded lazily (below the fold). |
| Data pipeline | **Python 3.12** with `pandas`, `numpy`, `statsmodels` (indicators written in pandas), `requests`, `pydantic`, `jinja2` (text templates) | Dependencies pinned in `pipeline/requirements.txt`. |
| Storage | **JSON files** in `data/` committed to the repo | No database. |
| CI / scheduler | **GitHub Actions** | Daily cron plus manual `workflow_dispatch`. |
| Hosting / CDN | **Cloudflare Pages** | Build command `npm run build`, output `dist/`, Node 20. |
| Tests | `pytest` (pipeline), `astro check` + Playwright smoke test (site), Lighthouse CI | |

## 4. Repository structure

```
forecast/
├─ .github/workflows/
│  ├─ daily-update.yml         # cron: fetch → compute → commit
│  └─ ci.yml                   # on PR: pytest, astro check, build, Lighthouse
├─ config/
│  └─ assets.yml               # one entry per asset (see §5.1)
├─ pipeline/
│  ├─ requirements.txt
│  ├─ run.py                   # entry point: python -m pipeline.run [--asset silver]
│  ├─ sources/                 # twelvedata.py, fallback_source.py (common interface)
│  ├─ forecast/                # arima.py, reversion.py, montecarlo.py, build.py, backtest.py
│  ├─ ta/                      # indicators.py, moving_averages.py, pivots.py, summary.py
│  ├─ text/                    # generator.py + templates/*.j2 (several variants per sentence)
│  ├─ schemas.py               # pydantic models = JSON contract with the site
│  └─ tests/
├─ data/
│  └─ silver/
│     ├─ prices.json           # full daily OHLC history
│     ├─ forecast.json         # latest run (all methods, all horizons)
│     ├─ ta.json               # latest technical analysis (D/W/M)
│     ├─ analysts.json         # MANUAL: bank / analyst targets (edited by hand)
│     └─ history/forecast-YYYY-MM-DD.json   # archive for the accuracy tracking
├─ docs/                       # DESIGN.md, DEPLOY.md, seo/<asset>.md (keywords + fan-out), this file
├─ public/                     # favicon, robots.txt, og images, fonts (self-hosted optional)
├─ src/
│  ├─ styles/ tokens.css, global.css
│  ├─ components/              # Ticker, Navbar, Hero, ForecastCard, YearSection, PriceChart,
│  │                           # DataTable, TaSummary, Factors, Faq, RelatedAssets, Footer …
│  ├─ layouts/BaseLayout.astro
│  ├─ lib/                     # data loaders, formatters (Intl), JSON-LD builders
│  └─ pages/
│     ├─ index.astro
│     ├─ [asset]-price-prediction.astro   # generated from config/assets.yml
│     ├─ methodology.astro, about.astro, disclaimer.astro, privacy.astro, 404.astro
│     └─ styleguide.astro      # all components with sample data (noindex)
├─ astro.config.mjs, package.json, tsconfig.json
├─ CLAUDE.md                   # "Follow docs/DESIGN.md for all UI work"
└─ README.md                   # setup, secrets, how to add an asset
```

## 5. Data pipeline

### 5.1 Asset config (`config/assets.yml`)

```yaml
- id: silver
  name: Silver
  symbol: XAG/USD
  slug: silver-price-prediction
  unit: troy ounce
  currency: USD
  calendar: fx            # fx = Mon–Fri (≈24/5); crypto = 7 days; nyse = NYSE trading days
  source: { primary: twelvedata, symbol: XAG/USD, fallback: <TBD in phase 1> }
  chart_color: "#8A96A8"
  enabled: true
- id: gold     # enabled: false → shown on the hub as "Coming soon"
- id: bitcoin  # enabled: false
```

### 5.2 Price source
**Finding in M1 (2026-10-29):** Twelve Data's free plan does **not** include silver spot (XAG/USD returns "available starting with the Grow plan"). XAU/USD, BTC/USD and US stocks/ETFs are included. Silver therefore uses:

- **Silver price: Alpha Vantage `GOLD_SILVER_HISTORY`** (`symbol=SILVER`, `interval=daily`).
  - Free key, 25 requests/day.
  - One price per day, with history from 2011-06-01.
  - The secret is `ALPHAVANTAGE_API_KEY`.
- **Silver daily high/low (estimated): the SLV ETF from Twelve Data.**
  - For each day, SLV's open/high/low are scaled by `spot_close / SLV_close`.
  - The bar is stored with `"ohlc": "proxy"`.
  - Days without an SLV bar (US holidays) stay `"ohlc": "close"`.
  - Indicators that need high/low (STOCH, ADX, Williams %R, CCI, ATR, pivots) use these estimates. `/methodology/` must say so.
- **Gold and bitcoin (later):** Twelve Data `time_series` with `XAU/USD` and `BTC/USD`, `interval=1day`; the free plan allows 800 calls/day and 8/minute.

**Fetching:**
- The first run (or `--backfill`) loads the full history. Daily runs re-fetch recent bars and upsert them, which fixes any revised bars.
- The current day's bar is dropped (it is still forming), and weekends are dropped for the `fx` calendar.

**Keys:**
- Keys are GitHub secrets (`TWELVEDATA_API_KEY`, `ALPHAVANTAGE_API_KEY`) and are **never committed**, because the repo is public.
- For local runs the keys go in an untracked `.env` file.

**Validation:**
- A bar is rejected if a price is ≤ 0, if `low > high`, or if open/close is outside the high–low range.
- A daily run stops without writing anything if a close moves more than the asset's `max_daily_change` (silver 35%: the history already contains a one-day move of about 30%, around 2026-02-02). After checking the move, rerun with `--allow-jumps`.

**Fallback:** to be chosen; it plugs into the same interface. If the sources fail, the run ends with an error and the site keeps yesterday's data (§9).

**Licensing:** the site is non-commercial, which the free plans cover. The footer credits "Market data: Twelve Data, Alpha Vantage".

### 5.3 Forecast models
All models work on **log prices**, and all output is converted back to USD. Forecast dates follow the asset calendar (`fx`: business days, no weekends). Every method reports an **80% interval** (P10–P90).

| Method | Implementation | Data window | Output |
|---|---|---|---|
| **M1: ARIMA** | `statsmodels` ARIMA(p,1,q). The grid is p, q ∈ 0..3, with drift on or off, and the lowest AIC wins. | Last 5 years | Daily path + 80% interval |
| **M2: Trend + mean reversion** | `log price = a + b·t + e_t`, with an AR(1) deviation `e_t = φ·e_(t-1) + ε` (a discrete Ornstein-Uhlenbeck process). The forecast decays today's deviation back toward the trend line, with half-life `ln 0.5 / ln φ`. | All history, up to 20 years | Daily path + 80% interval |
| **M3: Monte Carlo (GBM)** | Drift μ and volatility σ from daily log returns. 10,000 paths, simulated step by step; the seed is the run date, so results are reproducible. | μ from 10 years, σ from 3 years | Median path + P10 / P90 |
| **Consensus** | Mean of the methods that passed the sanity check, per date. Its range is the min of the lower bounds and the max of the upper bounds. | — | Daily path + range |

**Why not Prophet (decided in M2, 2026-10-29).** Prophet was tested on silver and dropped. It extends its last trend segment for years, which here is either the January 2026 spike or the crash after it. Its 2035 value ranged from $0.30 to $221 depending on settings. The trend + mean-reversion model gives a stable, explainable view that differs from the other two:
- **ARIMA** = momentum / "no change". On current data AIC chooses no drift, so it is flat.
- **Trend + reversion** = pull back toward the long-run trend.
- **Monte Carlo** = continuation of the 10-year drift.

**Long-run growth cap (added 2026-10-29, with the crypto and stock pages).** Young, fast-growing assets have historical growth of 40–75% a year (Solana, Dogecoin, Nvidia, Bitcoin). Extrapolated for ten years, that produced paths outside the sanity guard. Every model now caps long-run growth at **±25% a year** (`max_annual_drift`, configurable per asset):
- Monte Carlo drift is clipped.
- The trend + reversion slope is clipped and its intercept refit.
- ARIMA drops its drift term if the drift implies more than the cap.

Capped parameters are recorded in `forecast.json` (`drift_capped`, `trend_capped`, `drift_dropped_by_cap`) and shown on /methodology/.

**Horizons:**
- **Daily:** business days within the next 30 calendar days of the run date.
- **Monthly:** every month from the current month to **Dec 2030**, per method:
  - `avg` = the mean of the daily central path in the month
  - `min` / `max` = the lowest P10 and highest P90 in the month

  The site must label these "Low (P10)" and "High (P90)", not as hard minimum/maximum prices.
- **Yearly:** 2031–2035, yearly mean of **trend + reversion** and **Monte Carlo** only (ARIMA is flat or pure drift at that range), plus their consensus and the band means `p10` / `p90`.

**Sanity guard:** if a method produces non-finite values, or a path outside [0.1×, 10×] of the current price within 5 years, it is marked `"status": "failed"` with the error, and the consensus is computed from the rest.

**Accuracy (MAPE):**
- **Walk-forward backtest:** 50 origins, every 5 trading days, over roughly the last year. At each origin the methods are refit on data up to that day; ARIMA keeps today's chosen order. Each forecast is compared with the actual close **1, 5 and 21 trading days** later (labelled 1d / 7d / 30d).
  - For speed, Monte Carlo uses its analytic median (`S0·e^(μh)`), which equals the simulated median.
- **Live:** every run archives its daily table to `data/<asset>/history/forecast-<date>.json`. Once there are **30+ matched samples** per horizon, accuracy switches to the live track record (`"basis": "live"`).
- `--no-backtest` reuses the previous figures.

**First run (2026-10-29, silver $54.25):**
- **Consensus:** about $54.0 at the end of November 2026, $59.5 in December 2030, $93 in 2035.
- **Walk-forward MAPE:** about 2.9% (1d), 6.8% (7d) and 13.5% (30d), nearly the same for all methods.
- **Runtime:** about 15 s per asset, including the backtest.

### 5.4 Technical analysis
Implemented in pandas (`pipeline/ta/`), with no TA-Lib dependency. Computed on daily bars, and on weekly (`W-FRI`) and monthly bars resampled from daily (timeframes **D / W / M**). The current week or month is still in progress and is included. For silver, high/low are SLV-based estimates (`"ohlc_basis": "proxy"`); /methodology/ must say so.

**Signal rules** (`pipeline/ta/rules.py`). Inside an overbought or oversold zone the action is shown as such and **counted as neutral**:

| Indicator | Buy | Sell | Zones |
|---|---|---|---|
| RSI(14) | > 50 | < 50 | overbought > 70, oversold < 30 |
| STOCH(9,6): slow %K | > 50 | < 50 | > 80 / < 20 |
| StochRSI(14) | > 50 | < 50 | > 80 / < 20 |
| MACD(12,26,9): MACD line | > 0 | < 0 | (signal line reported) |
| ADX(14) | ADX ≥ 25 and +DI > −DI | ADX ≥ 25 and −DI > +DI | ADX < 25 → neutral |
| Williams %R(14) | > −50 | < −50 | > −20 / < −80 |
| CCI(14) | > 0 | < 0 | > 200 / < −200 |
| ATR(14) | — | — | high/low volatility vs its 14-bar average; **not counted** |
| Highs/Lows(14) | > 0 | < 0 | |
| Ultimate Oscillator(7,14,28) | > 50 | < 50 | > 70 / < 30 |
| ROC(12) | > 0 | < 0 | |
| Bull/Bear Power(13) | > 0 | < 0 | |
| SMA / EMA 5, 10, 20, 50, 100, 200 | price > MA | price < MA | MA omitted if there is too little history |

- **Pivot points:** Classic, Fibonacci, Camarilla, Woodie (S3–R3) and DeMark (S1/R1). Daily pivots come from the last finished day; weekly and monthly pivots from the previous finished week or month.
- **Summary:** score = (buys − sells) / counted, computed separately for oscillators, for MAs and overall. Mapping: ≤ −0.5 Strong Sell, < −0.1 Sell, ≤ 0.1 Neutral, < 0.5 Buy, ≥ 0.5 Strong Buy.

### 5.5 Generated text
**Changed in M4:** text is generated at build time in the site (`src/lib/text.ts`), not in the pipeline, and there is no `text.json` or `faq.json`. The text reads the same `forecast.json` / `ta.json` as the tables, so the numbers in a sentence can never drift from the numbers in a table, and no Jinja2 dependency is needed. The future 10-language version will translate these templates.

- **Variants:** 2 per sentence, picked by a hash of `(asset, run date, block)`. The text changes from day to day but stays stable within a day.
- **Blocks:**
  - hero intro
  - key summary (BLUF)
  - 30-day trend
  - one paragraph set per year (current year to 2030)
  - outlook to 2035
  - technical-analysis interpretation
  - accuracy statement
  - 8 FAQ answers with live numbers
- **Conditional content:** statements that depend on the data are shown only while true. For example, "the price is X% above its trend" appears only when the deviation is above 10%, and the Monte Carlo upside line only when the drift is positive.
- **Tone:** neutral and conditional; never "you should buy". Every number comes from the JSON.

### 5.6 Analyst and bank forecasts (`analysts.json`)

**What it is.** A hand-maintained list of silver price targets **published by banks, research firms and public institutions**, for example JPMorgan, Bank of America, UBS, Goldman Sachs, HSBC, Citi, the World Bank Commodity Markets Outlook and the LBMA annual forecast survey.

Unlike everything else on the page, these numbers are **not computed by the pipeline** and are not available from a free API. Someone reads them in press releases, research notes or reputable news coverage and records them in this file.

**Why it exists.**
- **Demand:** searches naming banks or analysts add up to about 4,000 a month in the US, e.g. "silver price forecast 2026 analysts" 2,100, "bank of america silver forecast" 700, "jpmorgan silver price forecast 2026" 600 (sub-intent 5, P1, in `seo/silver.md`).
- **Trust:** it puts our model forecasts next to real institutional views. Readers and Google treat that as a credibility signal on a finance page.

**Structure.**

```json
{
  "asset": "silver",
  "reviewed_at": "2026-10-29",          // last time the editor checked all entries
  "reviewed_by": "Margerie Holtz",
  "entries": [
    {
      "id": "jpm-2026-q4",                 // unique, stable
      "institution": "JPMorgan",           // display name
      "type": "bank",                      // bank | research | public_institution | survey | individual
      "target_usd": 0.00,                  // point target in USD per troy ounce …
      "target_low_usd": null,              // … or a range (fill low/high, leave target_usd null)
      "target_high_usd": null,
      "basis": "average",                  // average (period average) | end (end-of-period price) | peak
      "horizon": "2026-Q4",                // 2026 | 2026-Q4 | 2027 | 2030 …  (what the target refers to)
      "published_on": "YYYY-MM-DD",        // date the institution published the target
      "source_title": "…",                 // headline of the note or article
      "source_url": "https://…",           // primary source if public, otherwise reputable press coverage
      "note": "Raised from previous target", // optional, at most 120 characters, neutral wording
      "show": true                         // editor switch: hide an entry without deleting it
    }
  ]
}
```

The number fields above are placeholders. **Values must never be estimated or invented.** Every entry must come from a source the editor has actually read, and the entry must have `source_url` and `published_on`.

**How the site uses it** (silver page, block 10, "What analysts and banks predict for silver"):
1. **Table:** Institution · Target (USD/oz, or "low–high") · For (horizon + basis, e.g. "Q4 2026 average") · Published · Source link. Rows are sorted by horizon, then institution.
2. **FinForecast row:** the last row shows our consensus for the same horizon, taken from `forecast.json`, so readers can compare.
3. **Summary sentence above the table**, generated: "N institutions published silver forecasts for {horizon}; targets range from ${min} to ${max}, median ${median}. FinForecast's model consensus is ${x}." Medians are computed only from entries with the same horizon and basis.
4. **Freshness rules (applied at build time):**
   - Entries older than **9 months** are hidden automatically.
   - Entries whose horizon is already in the past are hidden.
   - If fewer than 2 entries remain, the whole block is hidden, so the page never shows a stale or near-empty table.
5. **SEO:** the table is static HTML. Institution names in the H3 or caption help match "JPMorgan silver forecast"-type queries. The `source_url` links get `rel="nofollow noopener"`.
6. **FAQ:** "What do analysts predict about silver?" uses the same summary sentence.

**Who updates it and how.**
- The editor (Margerie Holtz) reviews it **monthly**, and also when a major bank changes its forecast.
- Changes go through a pull request that edits `data/silver/analysts.json`. CI validates the file against the schema: required fields, a valid date, a `source_url` with `https`, `target_low ≤ target_high`, and values within 0.1×–10× of the current price.
- Merging the PR triggers a redeploy.
- No code changes are needed. Later, the large site's admin panel will replace this file with a database table that has the same fields.

**Rules.** Quote the number exactly as published, in USD per troy ounce, and record which basis it uses (average, end-of-period or peak). Don't mix bases in one median. Don't copy the source's wording; link to it instead. Individual commentators (e.g. Robert Kiyosaki) are `type: individual` and are shown only on a separate "famous predictions" page, not in this table.

### 5.7 JSON contract
Pydantic models in `pipeline/schemas.py` are the single source of truth. Export them as JSON Schema to `src/lib/schemas/` and validate in `astro check` / the build.

`forecast.json` minimum:
```json
{
  "asset": "silver", "generated_at": "2026-10-29T01:10:00Z", "last_close": {"date": "2026-10-28", "price": 52.81},
  "methods": { "arima": {"status": "ok", "params": {...}}, "reversion": {...}, "montecarlo": {...} },
  "daily":   [ {"date": "2026-10-30", "arima": 52.9, "reversion": 53.1, "montecarlo": 52.8, "consensus": 52.93, "low": 50.6, "high": 55.2} ],
  "monthly": [ {"month": "2026-11", "arima": {"avg": 53.4, "min": 50.1, "max": 56.9}, "reversion": {...}, "montecarlo": {...}, "consensus": {...}} ],
  "yearly":  [ {"year": 2031, "reversion": 61.2, "montecarlo": 63.0, "consensus": 62.1, "p10": 38.0, "p90": 104.0} ],
  "accuracy": { "arima": {"mape_1d": 0.9, "mape_7d": 2.8, "mape_30d": 6.1, "basis": "walk-forward"} }
}
```
(The numbers above are placeholders for illustration only.)

## 6. Pages

### 6.1 Home / hub `/`
1. Ticker bar: silver live-ish price and daily change; gold and bitcoin shown as "soon" (DESIGN §4.1).
2. Navbar (DESIGN §4.2): Metals ▾ (Silver; Gold soon), Crypto ▾ (Bitcoin soon), Methodology, About.
3. Dark hero:
   - H1 "Price predictions for gold, silver and bitcoin"
   - a short intro saying the site is updated daily and uses 3 statistical models
   - a disclaimer box
4. Asset cards grid (serif name, current price, 1-day % change, 30-day consensus forecast, mini sparkline, "View forecast →"). Disabled assets show "Coming soon" without a link.
5. "How our forecasts work": a 4-column factors-style block (data → 3 models → technical analysis → daily update), linking to `/methodology/`.
6. Short FAQ (4–5 questions about the site), then the footer.

**SEO:** title "Price Predictions: Silver, Gold & Bitcoin Forecasts | {Brand}"; `WebSite` + `Organization` JSON-LD.

### 6.2 Silver page `/silver-price-prediction/`
Block order and content follow `docs/seo/silver.md` (structure) and `docs/DESIGN.md §5` (components):

| # | Block | Data source | Notes |
|---|---|---|---|
| 1 | Ticker, navbar, breadcrumbs | prices.json | |
| 2 | Hero: H1 "Silver Price Prediction & Forecast 2026–2030", intro, disclaimer, "Updated {date}" | text.ts | |
| 3 | Key forecast summary: 3 forecast cards (30 days / end of 2026 / 2030) + TA verdict pill | forecast.json, ta.json | Above the fold on desktop |
| 4 | Price chart: history with 1M/6M/1Y/5Y/10Y/All, plus 3 dashed forecast lines and the MC P10–P90 band, plus a quick-period strip (1D/1W/1M/6M/YTD) | prices.json, forecast.json | Lazy-loaded JS; static `<noscript>` summary |
| 5 | H2 "Silver price forecast for the next 30 days": text + daily table (Date, ARIMA, Trend + reversion, Monte Carlo, Consensus, Low–High) | forecast.daily | First 10 rows visible, "Show all" |
| 6 | H2 "Silver price forecast 2026": text + monthly table for the remaining months | forecast.monthly | |
| 7 | H2 "Silver price prediction 2027–2030": yearly summary table, then an H3 per year with text + monthly table (Month, Min, Avg, Max, change vs today) | forecast.monthly | 2030 uses the dark variant |
| 8 | H2 "Silver price outlook to 2035": yearly table with P10–P90 + uncertainty note | forecast.yearly | |
| 9 | H2 "Silver technical analysis": D/W/M tabs, 3 gauges, then oscillator, MA and pivot tables | ta.json | |
| 10 | H2 "What analysts and banks predict for silver": institution, target, horizon, date, source link + our consensus row | analysts.json (manual) | Hidden if the file is empty |
| 11 | H2 "What will drive silver prices": ranked list of 5 factors | static content | |
| 12 | H2 "Gold vs silver forecast": gold/silver ratio + text; link to the gold page when enabled | static + data later | MVP: text only |
| 13 | H2 "Silver price history (5 and 10 years)": yearly avg/high/low/% table | prices.json | |
| 14 | H2 "Is silver a good investment in 2026?": bull vs bear table, risk checklist | text.ts + forecast.json | |
| 15 | H2 "How we forecast silver and how accurate we are": methods summary + MAPE table → /methodology/ | forecast.accuracy | |
| 16 | FAQ (8 questions from docs/seo/<asset>.md micro-intents; answers filled with live numbers) | text.ts + data | `<details>` |
| 17 | Related assets, disclaimer band, footer | config | |

### 6.3 Service pages
- **`/methodology/`:** data source, update time, all 3 models in plain language, TA signal rules, the accuracy table and its limitations.
- **`/about/`:** who runs FinForecast, plus an author section for E-E-A-T.
- **Author page `/authors/margerie-holtz/`:**
  - **Name and role:** Margerie Holtz, Senior Analyst, Editor of FinForecast.
  - **Education:** M.A. International Economics, Hochschule für Wirtschaft und Recht Berlin (graduated 2015).
  - **Experience:**
    - Analyst at Brown Brothers Harriman since 2017
    - Senior Analyst since 2020
  - **Draft bio for owner and author approval:** "Margerie Holtz is a Senior Analyst with more than eight years of experience in financial markets. She has worked at Brown Brothers Harriman since 2017 and has been a Senior Analyst there since 2020. She holds a Master of Arts in International Economics from the Hochschule für Wirtschaft und Recht Berlin (2015). At FinForecast she reviews the forecasting methodology and the analyst-forecast data."
  - **Independence note**, shown on the author page and in the byline tooltip: "Views and forecasts on FinForecast are her own and do not represent Brown Brothers Harriman." The author must confirm that her employer's outside-activity policy allows her to be named.
  - **Photo:** to be provided. Until then, show an initials avatar ("MH"). Never use a generated face.
  - **Profile link:** optional (e.g. LinkedIn) if the author agrees.
  - `Person` JSON-LD: `jobTitle` "Senior Analyst", `alumniOf` = Hochschule für Wirtschaft und Recht Berlin, `worksFor` = FinForecast (editor role). Don't mark up the employer as `worksFor` unless the author wants that.
  - Linked from the byline on every forecast page ("Reviewed by Margerie Holtz · Updated {date}"). The `Article` schema `author` points to this page.
  - Use only facts the owner provides. Don't invent experience.
- **`/disclaimer/`:** not investment advice; no liability.
- **`/privacy/`:** analytics and cookies.
- **`404`:** a styled page with links to the hub.

## 7. Design
Implement exactly as specified in **`docs/DESIGN.md`** (tokens, typography, components, responsive rules). Build `/styleguide` first (noindex) and get approval before building the real pages.

Owner design decisions:
- **Brand:** "FinForecast" as a serif wordmark (Old Standard TT) in the navbar and footer, plus a simple "FF" monogram for the favicon and OG images.
- **Accent color:** `#1431cd` (buttons, links, focus outlines). Hover color `#0f27a6`.
- **Imagery:** AI-generated renders. Generate them once, optimize them to AVIF/WebP and commit them to `public/images/`:
  - silver bars on a dark background, for the hero
  - silver coins and a bar stack, for the year sections
  - an abstract chart texture, for the dark sections
  - gold and bitcoin renders for the "Coming soon" cards

  Renders must not contain any real bank, mint or brand logos, or legible hallmark text.

## 8. SEO requirements

| Item | Requirement |
|---|---|
| URLs | Lowercase, trailing slash, no year in the URL; canonical tag on every page |
| Title / description | Silver: `Silver Price Prediction 2026–2030: Daily & 5-Year Forecast` / `Silver price forecast for tomorrow, next 30 days, end of 2026 and 2027–2030. Three models, analyst consensus and live technical analysis. Updated daily.` Years in titles roll over automatically. |
| Headings | One H1 per page; H2/H3 exactly as in §6.2 (they carry the target keywords) |
| Rendering | **All tables and numbers rendered to static HTML at build time.** JS is only for the chart, the gauges and tab switching. |
| Structured data | `BreadcrumbList`, `WebPage` + `Article` (author, `datePublished`, `dateModified` = run date), `FAQPage`, `Dataset` (forecast tables), `Organization`, `WebSite` |
| Sitemap / robots | `@astrojs/sitemap` with `<lastmod>` = data date; robots.txt allows everything except `/styleguide` |
| Freshness | Visible "Updated {date} {time} UTC" near the H1 |
| Social | Open Graph and Twitter tags; OG image 1200×630 per asset, generated at build time (e.g. `satori`) with the current price and the 2030 consensus |
| Internal links | Hub ↔ asset; asset → methodology; "how to buy silver" placeholder link reserved (next page in the plan) |
| E-E-A-T (YMYL) | Author block, methodology, accuracy, disclaimer, About and Contact (e-mail) |
| Analytics | Cloudflare Web Analytics (cookieless, so no consent banner is needed). Google Search Console verification via DNS. |
| Indexing switch | Every page is `noindex` and `robots.txt` blocks everything unless the build has `INDEXING=on` (set at launch). `/styleguide/` is always `noindex`. |
| Fonts | Self-hosted (`@fontsource`), with the latin 400 files preloaded and CSS inlined: no third-party requests on page load. |

## 9. Automation and deployment

`.github/workflows/daily-update.yml`:
- **Trigger:** `schedule: "15 1 * * *"` (01:15 UTC, after the daily FX close) + `workflow_dispatch` with an `asset` input.
- **Steps:**
  1. checkout
  2. setup Python 3.12 with a pip cache
  3. `python -m pipeline.run`
  4. validate the JSON against the schemas
  5. if the data changed, commit `data/**` as `github-actions[bot]` with the message `data: daily update YYYY-MM-DD`, and push to `main`
- **Secrets:** `TWELVEDATA_API_KEY`, `ALPHAVANTAGE_API_KEY`. Permissions: `contents: write` only.
- **On failure:** the workflow fails, which triggers GitHub's e-mail notification. No commit is made, so the site keeps the last good data. A failed or stale run also shows a small "data as of {date}" note on the page (the site checks whether `generated_at` is older than 48h).
- **Runtime budget:** under 10 minutes per run (one asset takes about 15 s).

**Cloudflare Pages (changed after M5: direct upload).** GitHub Actions `deploy.yml` builds the site and uploads `dist/` with Wrangler. It runs on every push to `main`, after each daily update and by hand. Cloudflare does not build. The notes below on Git-connected builds no longer apply.

**Original plan, superseded:**
- Connect the repo; production branch `main`; build `npm ci && npm run build`; output `dist`; Node 20.
- Each data commit triggers a deploy, about 30 builds a month against the free limit of 500.
- Preview deployments for PRs.
- Custom domain + HTTPS. Cache rules: HTML `max-age=0, s-maxage=3600`; static assets immutable for 1 year.

`ci.yml` (on PRs): `pytest`, `ruff`, `astro check`, build, Playwright smoke test (both pages render, tables have rows, no console errors), Lighthouse CI.

## 10. Non-functional requirements
- **Performance (mobile, Lighthouse):** Performance ≥ 90, LCP < 2.5s, CLS < 0.1. Total JS on the silver page < 150 KB gzipped.
- **Accessibility:** WCAG 2.1 AA, Lighthouse a11y ≥ 95. Up/down shown with ▲/▼ as well as color. Tables use `<th scope>`.
- **SEO:** Lighthouse SEO 100.
- **Browsers:** last 2 versions of Chrome, Edge, Safari and Firefox; iOS Safari 16+. Works at 360px width with no horizontal page scroll.
- **Reproducibility:** fixed random seeds, pinned dependencies; running the pipeline locally for the same date gives the same JSON.
- **Security:** no secrets in the repo; Dependabot enabled; Actions permissions kept minimal.

## 11. Acceptance criteria
1. Opening the production URL shows the hub and the silver page, styled according to DESIGN.md at 360, 768 and 1300px.
2. Without any manual action, the next day after 01:15 UTC:
   - a new `data:` commit exists
   - Cloudflare has deployed it
   - the "Updated" date, the prices, all forecast tables and the TA blocks show the new values
3. The 30-day table has 30 calendar days (business days only for silver); monthly tables cover every month up to Dec 2030; the yearly table covers 2031–2035; all three methods plus the consensus are present.
4. The TA block shows D/W/M with every indicator, MA and pivot from §5.4, and summary verdicts consistent with the counts.
5. The page source (with JS disabled) contains all H1–H3, all tables and the JSON-LD, which pass the Rich Results Test without errors.
6. Lighthouse thresholds from §10 are met on the silver page.
7. Simulating an API failure (wrong key) fails the workflow without changing the live site.
8. Adding gold requires only `enabled: true` in `assets.yml` + `analysts.json` content (plus asset-specific drivers text), with no code changes (checked by enabling gold on a preview branch).

## 12. Milestones

| # | Milestone | Deliverables | Est. |
|---|---|---|---|
| M1 | Repo setup + data | Astro skeleton, CLAUDE.md, docs/, the source adapter, history backfill, `prices.json` | 1–2 days |
| M2 | Models and TA | ARIMA / trend + reversion / MC / consensus, backtest, TA + summary, pytest, JSON schemas. Done 2026-10-29 | 3–4 days |
| M3 | Design system | tokens, components, `/styleguide` → owner approval. Built 2026-10-29, awaiting approval | 2–3 days |
| M4 | Pages | Hub, silver page, service pages, text templates, FAQ. Done 2026-10-29 | 3 days |
| M5 | SEO + automation | JSON-LD, sitemap, OG images, daily workflow, Cloudflare, CI, Lighthouse. Code done 2026-10-29; Cloudflare connection by the owner (docs/DEPLOY.md) | 1–2 days |
| M6 | QA and launch | acceptance checks §11, Search Console, 7 days of unattended runs | 1 week elapsed |

## 13. Owner decisions and remaining questions

**Decided (2026-10-29):**

| Topic | Decision |
|---|---|
| Brand | FinForecast |
| Accent color | `#1431cd` |
| Imagery | AI-generated renders (§7) |
| Author | Margerie Holtz, Senior Analyst; HWR Berlin M.A. 2015; Brown Brothers Harriman since 2017, Senior Analyst since 2020 (§6.3) |
| Price API | Silver: Alpha Vantage (free), with high/low estimated from SLV on Twelve Data. Gold and bitcoin: Twelve Data free plan. Keys are stored only as GitHub secrets (§5.2). |
| Usage / licensing | Non-commercial: no ads and no affiliate links, which the free plan covers. Footer attribution: "Market data: Twelve Data, Alpha Vantage". **If monetization is added later, upgrade the data plan first.** |
| Analyst targets | `analysts.json`, reviewed monthly by the author (§5.6) |

**Still open (not blocking M1–M4):**
1. **Domain.** Build and test on `https://<project>.pages.dev`. Keep the site URL in **one** config value (`SITE_URL` in `astro.config.mjs` / an environment variable) so that switching the domain changes canonicals, the sitemap, OG URLs and JSON-LD in one place. Until the domain is set:
   - keep `noindex` on the pages.dev host
   - don't submit to Search Console

   **Launch (M6) is blocked until the domain is defined.**
2. **Contact e-mail.** Will be added later. Until then, the About page and Organization schema omit it, and the footer has no contact link.
3. **Author photo and approval** of the bio and the independence note (§6.3).
