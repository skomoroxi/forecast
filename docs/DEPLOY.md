# Deployment and operations

How FinForecast runs: GitHub Actions does everything. It updates the data once a day, builds the site, and uploads `dist/` to Cloudflare Pages with Wrangler (a "direct upload" project). Cloudflare never builds anything itself, so its build settings, including "Root directory", are not used.

```
01:15 UTC  daily-update.yml ── fetch prices ── forecasts + TA ── validate ── commit data/**
                                                                                 │
                                                       deploy.yml (called) ◄─────┘
push to main ─────────────────────────────────────────► deploy.yml
                                                         npm ci → build → smoke test
                                                         → wrangler pages deploy dist → CDN
```

## 1. GitHub secrets for the data (owner, once)
Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `TWELVEDATA_API_KEY` | your Twelve Data key |
| `ALPHAVANTAGE_API_KEY` | your Alpha Vantage key |

Or from a terminal logged in with `gh`: `gh secret set TWELVEDATA_API_KEY --repo skomoroxi/forecast` (it prompts for the value). Never put keys in files: the repository is public.

## 2. Cloudflare access for deployment (owner, once)
1. **Remove a Git-connected project if you created one.** A Pages project connected to Git cannot also receive uploads from Wrangler. Delete it under Workers & Pages → project → Settings → Delete, or use a different project name (step 4).
2. **Create an API token:** Cloudflare dashboard → **My Profile → API Tokens → Create Token → Create Custom Token**.
   - Permissions: **Account · Cloudflare Pages · Edit**
   - Account Resources: **Include · your account**
   - Copy the token; it is shown only once.
3. **Find your Account ID:** **Workers & Pages** overview, right-hand column "Account ID" (32 hex characters).
4. **Add the secrets** in GitHub (Settings → Secrets and variables → Actions → **Secrets**):

   | Name | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | the token from step 2 |
   | `CLOUDFLARE_ACCOUNT_ID` | the ID from step 3 |

5. *(Optional)* **Repository variables** (same page → **Variables** tab):

   | Name | Default | When to set |
   |---|---|---|
   | `CF_PAGES_PROJECT` | `finforecast` | if you want another project name |
   | `SITE_URL` | `https://<project>.pages.dev` | if Cloudflare gives the project a different `*.pages.dev` address (shown in the first deploy log), and at launch: `https://<domain>` |
   | `INDEXING` | *(unset)* | `on` only at launch |

6. **First deployment:** GitHub → **Actions → Deploy → Run workflow**. The first run creates the Pages project automatically. When it finishes, open the URL printed in the log (also in the run summary).
7. **Web Analytics:** Cloudflare → Workers & Pages → `finforecast` → **Metrics → Web Analytics → Enable**. It is cookieless and needs no code change.

Usage: about 30 data deploys plus a few code deploys a month, well inside the free plan.

**Optional: let Claude work with Cloudflare from your computer.** Run `npx wrangler login` in your own terminal and approve access in the browser. Claude can then list projects and deployments and read logs with Wrangler, without handling your token. Revoke it any time with `npx wrangler logout`.

## 3. First run of the daily update
GitHub → **Actions → Daily data update → Run workflow** (leave the inputs empty). Expected result:
- a green run with two jobs, `update` and `deploy`
- a new commit `data: daily update YYYY-MM-DD` (or "No data changes" on weekends)
- the site redeployed with the new numbers

From then on it runs every day at 01:15 UTC.

## 4. When something goes wrong
| Symptom | Cause | Fix |
|---|---|---|
| Red "Daily data update" run, `ALPHAVANTAGE_API_KEY is not set` | secret missing | add the secret (step 1) |
| Red "Deploy" run, "Add the CLOUDFLARE_API_TOKEN…" | Cloudflare secrets missing | step 2.4 |
| Red "Deploy" run, `Authentication error [code: 10000]` | token lacks **Cloudflare Pages: Edit**, or wrong account ID | create the token again (step 2.2) |
| Red "Deploy" run, project "is a Git-connected project" | the project was created with the dashboard Git integration | delete it or set `CF_PAGES_PROJECT` to a new name (step 2.1) |
| Red run, `alphavantage ... rate limit` | 25 requests/day used up (e.g. many manual runs) | wait until the next day |
| Red run, `exceeds 35%` (PriceJumpError) | a huge daily move, possibly bad data | compare with another source. If the move is real: Run workflow with **allow_jumps** checked |
| Red run at "Validate data files" | a data file broke the contract | check the log; nothing was committed |
| Page shows "The daily update is delayed" | last update older than 48 h | look at the Actions tab for the failed run |
| CI red on `analysts.json` | a manual entry is invalid (missing source, bad horizon…) | fix the entry; the message names the field |

In every failure case nothing is committed, so the live site keeps the last good data.

## 5. Launch checklist (M6, blocked until the domain exists)
1. Add the custom domain: Pages project → **Custom domains**.
2. Set the repository variables `SITE_URL=https://<domain>` and `INDEXING=on`, then **Actions → Deploy → Run workflow**.
3. Check `https://<domain>/robots.txt`: it should show `Allow: /` and the sitemap line.
4. Check that page source has `<meta name="robots" content="index, follow…">`.
5. Google Search Console: add a **Domain property**, verify with the DNS TXT record (in Cloudflare DNS), then submit `https://<domain>/sitemap-index.xml`.
6. Test the silver page in the Rich Results Test (FAQ, Breadcrumb, Article and Dataset should be detected).
7. Optional: redirect `*.pages.dev` to the domain (Bulk Redirects) so only one host is indexed.
