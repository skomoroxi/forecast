# Deployment and operations

How FinForecast runs: GitHub Actions updates the data once a day and commits it. Every commit to `main` triggers a Cloudflare Pages build. Visitors get static files from Cloudflare's CDN.

```
01:15 UTC  daily-update.yml ── fetch prices ── forecasts + TA ── validate ── commit data/**
                                                                                │
                                         Cloudflare Pages ◄── push to main ◄───┘
                                         npm ci && npm run build → dist/ → CDN
```

## 1. GitHub secrets (owner, once)
Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `TWELVEDATA_API_KEY` | your Twelve Data key |
| `ALPHAVANTAGE_API_KEY` | your Alpha Vantage key |

Or from a terminal logged in with `gh`: `gh secret set TWELVEDATA_API_KEY --repo skomoroxi/forecast` (it prompts for the value). Never put keys in files: the repository is public.

## 2. Cloudflare Pages project (owner, once)
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, then choose `skomoroxi/forecast`.
2. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
   - Production branch: `main`
3. Environment variables (Production and Preview):
   | Name | Value | Why |
   |---|---|---|
   | `NODE_VERSION` | `24` | Astro 7 needs Node ≥ 22.23 |
   | `SITE_URL` | `https://<your-project>.pages.dev` | canonical URLs, sitemap, OG images (change at launch) |
   | `INDEXING` | *(leave unset until launch)* | unset = `noindex` and `robots.txt` blocks everything |
4. Save and deploy, then open `https://<your-project>.pages.dev/silver-price-prediction/`.
5. **Web Analytics:** Pages project → **Metrics → Web Analytics → Enable**. It is cookieless and no code change is needed (the privacy page already describes it).
6. *(Optional)* Settings → Builds → **Preview deployments: None**. The daily data commits go to `main`, so previews only matter for pull requests.

Free-plan usage: about 30 data builds plus a few code builds a month, well inside the 500-build limit.

## 3. First run of the daily update
GitHub → **Actions → Daily data update → Run workflow** (leave the inputs empty). Expected result:
- a green run
- a new commit `data: daily update YYYY-MM-DD` (or "No data changes" on weekends)
- a new Cloudflare deployment a minute later

From then on it runs every day at 01:15 UTC.

## 4. When something goes wrong
| Symptom | Cause | Fix |
|---|---|---|
| Red "Daily data update" run, `ALPHAVANTAGE_API_KEY is not set` | secret missing | add the secret (step 1) |
| Red run, `alphavantage ... rate limit` | 25 requests/day used up (e.g. many manual runs) | wait until the next day |
| Red run, `exceeds 35%` (PriceJumpError) | a huge daily move, possibly bad data | compare with another source. If the move is real: Run workflow with **allow_jumps** checked |
| Red run at "Validate data files" | a data file broke the contract | check the log; nothing was committed |
| Page shows "The daily update is delayed" | last update older than 48 h | look at the Actions tab for the failed run |
| CI red on `analysts.json` | a manual entry is invalid (missing source, bad horizon…) | fix the entry; the message names the field |

In every failure case nothing is committed, so the live site keeps the last good data.

## 5. Launch checklist (M6, blocked until the domain exists)
1. Add the custom domain: Pages project → **Custom domains**.
2. Set `SITE_URL=https://<domain>` and `INDEXING=on`, then **Retry deployment**.
3. Check `https://<domain>/robots.txt`: it should show `Allow: /` and the sitemap line.
4. Check that page source has `<meta name="robots" content="index, follow…">`.
5. Google Search Console: add a **Domain property**, verify with the DNS TXT record (in Cloudflare DNS), then submit `https://<domain>/sitemap-index.xml`.
6. Test the silver page in the Rich Results Test (FAQ, Breadcrumb, Article and Dataset should be detected).
7. Optional: redirect `*.pages.dev` to the domain (Bulk Redirects) so only one host is indexed.
