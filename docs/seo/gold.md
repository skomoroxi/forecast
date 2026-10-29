# Gold (XAU): keyword research and query fan-out

## Keyword research (Ahrefs, US, 2026-10-29)
Templates: "gold prediction", "gold forecast", "xau prediction", "xau forecast" (matching terms, sorted by volume). Keywords for past years (2025) are listed but not targeted.

| Keyword | US volume | KD | Note |
|---|---|---|---|
| gold price prediction | 10,000 | 7 | **top 3** |
| gold price forecast 2026 | 10,000 | 13 | **top 3** |
| gold price forecast | 9,100 | 42 | **top 3** |
| gold price prediction 2026 | 7,300 | 23 |  |
| gold price forecast next week | 2,500 | 42 |  |
| gold price prediction next 12 months 2026 | 2,400 | — |  |
| gold price forecast 2030 | 2,300 | 18 |  |
| gold forecast | 2,100 | 50 |  |
| gold prediction 2026 | 2,000 | 0 |  |
| gold price prediction 2030 | 1,800 | 14 |  |
| gold forecast 2026 | 1,500 | 35 |  |
| gold prediction | 1,400 | 50 |  |
| gold price forecast tomorrow | 1,200 | 57 |  |
| gold price forecast 2026 analysts | 1,000 | 46 |  |
| gold, silver price forecast | 1,000 | 13 |  |
| bank of america gold forecast | 900 | 6 |  |
| gold price forecast xauusd | 500 | 6 |  |

**Top 3 by demand (targeted in Title, H1 and H2):** "gold price prediction", "gold price forecast 2026", "gold price forecast".
These are stored in `config/assets.yml` (`keywords`), and the build checks that they appear in the title, H1 and H2s (`scripts/smoke.mjs`).

---

# Query Fan-Out Analysis: gold price prediction

## Inputs
- **Topic:** gold price prediction
- **Audience:** English-speaking retail investors (US primary), beginners to active traders
- **Current Depth:** greenfield (new asset page on the forecast site; template proven on /silver-price-prediction/)
- **Primary Intent:** see concrete expected Gold prices (tomorrow, 30 days, end of 2026, 2027–2030, beyond) and judge whether to buy, hold or sell
- **Demand data:** Ahrefs-grounded (US); rows without a measured keyword are labelled estimated

## Sub-Intents (12 total — 5 P1, 5 P2, 2 P3)

### 1. Short-term forecast: tomorrow, next week, next 30 days
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will the Gold price be tomorrow and next week?"
**Expected format:** attribute table (date → forecast per method, P10–P90) + dated claim
**User Journey Stage:** Evaluation
**Demand:** gold price forecast next week 2,500 · tomorrow 1,200 · today 900
**Content Angle:** Daily table for 30 days with the three models and consensus; separate tomorrow / one-week values near the top.

**EAV Slots:**
- Gold (XAU) → forecast price tomorrow → TO-RESEARCH (USD per troy ounce)
- Gold (XAU) → forecast price in 30 days → TO-RESEARCH (USD per troy ounce)

**Micro-Intent Questions:**
- Will gold go up tomorrow?
- What is the Gold prediction for next week?
- How wide is the 30-day range?

### 2. Gold forecast for 2026 (rest of the year)
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "Where will gold be at the end of 2026?"
**Expected format:** attribute table (month → low/avg/high) + dated claim
**User Journey Stage:** Evaluation
**Demand:** gold price forecast 2026 10,000 · gold price prediction 2026 7,300 · next 12 months 2,400 · end of 2026 900
**Content Angle:** Monthly table for the remaining months and a December 2026 figure; this is the largest keyword cluster.

**EAV Slots:**
- Gold → forecast average December 2026 → TO-RESEARCH (USD per troy ounce)
- Gold → expected change to year end → TO-RESEARCH (%)

**Micro-Intent Questions:**
- What is the Gold forecast for the end of 2026?
- Will gold rise in 2026?
- Which month is expected to be strongest?

### 3. Gold price prediction 2027–2030
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will gold be worth in 2027, 2028, 2029 and 2030?"
**Expected format:** attribute table per year + comparison table (models side by side)
**User Journey Stage:** Evaluation
**Demand:** gold price forecast 2030 2,300 · gold price prediction 2030 1,800 · 2027 900 · 2026 2027 2028 1,100
**Content Angle:** One monthly table per year plus a yearly model-comparison table; 2030 needs its own heading (high demand).

**EAV Slots:**
- Gold → forecast average 2030 → TO-RESEARCH (USD per troy ounce, per method)
- Gold → change to 2030 → TO-RESEARCH (% vs today)

**Micro-Intent Questions:**
- How much will gold be worth in 2030?
- Which year to 2030 is strongest for Gold?
- How far apart are the models?

### 4. Long-term outlook to 2035 and beyond
**Priority:** P2 — Secondary
**Dimension:** Temporal
**Sub-query:** "Where could gold be in 10 years?"
**Expected format:** attribute table (yearly) + direct verdict with evidence
**User Journey Stage:** Research
**Demand:** gold price today and 5 years prediction 1,100 · next 5 years 600
**Content Angle:** Yearly 2031–2035 with very wide P10–P90; state plainly that 2040/2050 numbers are not published because uncertainty is too large.

**EAV Slots:**
- Gold → forecast 2035 → TO-RESEARCH (USD, range)
- Gold → P10–P90 width 2035 → TO-RESEARCH (USD)

**Micro-Intent Questions:**
- What will gold be worth in 2035?
- Can anyone predict Gold for 2040 or 2050?

### 5. Technical analysis: buy or sell now
**Priority:** P1 — Core
**Dimension:** Contextual
**Sub-query:** "Is XAU a buy or sell right now?"
**Expected format:** direct verdict (gauge) + attribute table (indicators, moving averages, pivots)
**User Journey Stage:** Implementation
**Demand:** estimated (daily/hourly signal phrasing; e.g. 'today' variants above)
**Content Angle:** Daily/weekly/monthly summary with the 12 indicators, 12 moving averages and pivot points.

**EAV Slots:**
- XAU → RSI(14) daily → TO-RESEARCH (0–100)
- XAU → technical summary → TO-RESEARCH (Strong Sell…Strong Buy)

**Micro-Intent Questions:**
- Is XAU overbought?
- Where are Gold's support and resistance levels?
- Does the weekly signal agree with the daily one?

### 6. How reliable are these predictions
**Priority:** P1 — Core
**Dimension:** Safety & Legitimacy
**Sub-query:** "How accurate are Gold price predictions?"
**Expected format:** direct verdict with evidence + attribute table (MAPE)
**User Journey Stage:** Evaluation
**Demand:** estimated (YMYL trust branch)
**Content Angle:** Models, data source, growth cap, measured error by horizon, and a not-financial-advice statement.

**EAV Slots:**
- Forecast consensus → 30-day MAPE → TO-RESEARCH (%)
- Forecast → long-run growth cap → TO-RESEARCH (%/year)

**Micro-Intent Questions:**
- How accurate were past Gold forecasts?
- Why do the models disagree?
- Should I invest based on this?

### 7. Analyst and institutional forecasts
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "What do analysts and banks predict for Gold?"
**Expected format:** comparison table (institution, target, horizon, date, source)
**User Journey Stage:** Evaluation
**Demand:** gold price forecast 2026 analysts 1,000 · bank of america 900 · goldman sachs 2027 900 · wells fargo 800 · ubs 600
**Content Angle:** Hand-maintained analysts.json; block hidden until two sourced, current entries exist.

**EAV Slots:**
- [Institution] → Gold price target → TO-RESEARCH (USD, horizon, date)

**Micro-Intent Questions:**
- What is Wall Street's Gold target?
- How does this site compare to analysts?

### 8. What drives the Gold price
**Priority:** P2 — Secondary
**Dimension:** Definitional
**Sub-query:** "What factors move the Gold price?"
**Expected format:** ranked list
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Ranked qualitative drivers: central-bank gold buying, real interest rates, the US dollar, geopolitical risk, ETF and investment demand.

**EAV Slots:**
- Gold → main price drivers → TO-RESEARCH (ranked list)

**Micro-Intent Questions:**
- Why did Gold fall this year?
- What could push Gold higher?

### 9. Is gold a good investment?
**Priority:** P2 — Secondary
**Dimension:** Cost
**Sub-query:** "Is gold worth buying in 2026?"
**Expected format:** direct verdict with evidence (bull vs bear) + bulleted checklist (risks)
**User Journey Stage:** Evaluation
**Demand:** estimated
**Content Angle:** Balanced bull/bear lists generated from data plus risks; no personal advice.

**EAV Slots:**
- Gold → annualised volatility → TO-RESEARCH (%)
- Gold → largest one-day move → TO-RESEARCH (%, date)

**Micro-Intent Questions:**
- Is it a good time to buy Gold?
- What are the risks of Gold?

### 10. Gold vs silver and the gold/silver ratio
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "Will gold or silver rise more?"
**Expected format:** comparison table + figure with unit, date and conditions
**User Journey Stage:** Evaluation
**Demand:** gold, silver price forecast 1,000 · gold silver price forecast 600 · gold silver ratio forecast 2026 600
**Content Angle:** Side-by-side forecast from both pages and today's gold/silver ratio computed from site data.

**EAV Slots:**
- Gold/silver ratio → current value → TO-RESEARCH (ratio, date)
- Gold/silver ratio → long-run average → TO-RESEARCH (ratio, period)

**Micro-Intent Questions:**
- Is silver cheap relative to gold?
- What is the gold/silver ratio today?
- Which metal is forecast to rise more?

### 11. How to buy Gold
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I buy Gold?"
**Expected format:** numbered steps
**User Journey Stage:** Implementation
**Demand:** estimated
**Content Angle:** One line and a link.
**Owned by:** a 'how to buy Gold' guide

**EAV Slots:**
- Gold → ways to buy → TO-RESEARCH (list)

**Micro-Intent Questions:**
- Where can I buy Gold?

### 12. Gold price per gram in EUR/INR
**Priority:** P3 — Adjacent
**Dimension:** Contextual
**Sub-query:** "What is the gold forecast per gram in euros?"
**Expected format:** dated claim
**User Journey Stage:** Research
**Demand:** gold price forecast 2026 eur per gram 900
**Content Angle:** Not written here; one-line mention at most.
**Owned by:** localized currency pages (10-language version)

**EAV Slots:**
- Gold → named predictions → TO-RESEARCH (quote, date, source)

**Micro-Intent Questions:**
- What is the gold forecast per gram in euros?

## Scope Decision
**This page owns:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
**Linked out, not written:** 11 → a, 12 → l
**The next question:** "How do I buy Gold?" → the 'how to buy Gold' guide (planned).

## Dimension Coverage
| Dimension | Count | IDs |
|---|---|---|
| Definitional | 1 | 8 |
| Comparative | 2 | 7, 10 |
| Procedural | 1 | 11 |
| Contextual | 2 | 5, 12 |
| Problem–Solution | 0 | — |
| Cost | 1 | 9 |
| Safety & Legitimacy | 1 | 6 |
| Prerequisite & Eligibility | 0 | — |
| Temporal | 4 | 1, 2, 3, 4 |

Problem–Solution and Prerequisite & Eligibility are real absences for a forecast page: "why was the forecast wrong" is covered by the reliability branch, and account/eligibility questions belong to the 'how to buy' guide.

## Format Spread
| Container | Sub-intent IDs |
|---|---|
| attribute table | 1, 2, 4 |
| attribute table per year | 3 |
| direct verdict | 5 |
| direct verdict with evidence | 6, 9 |
| comparison table | 7, 10 |
| ranked list | 8 |
| numbered steps | 11 |
| dated claim | 12 |

## Pipeline Handoff Notes
Key entities: Gold (XAU/USD); Central banks; US real interest rates; US dollar index; Gold/silver ratio; Forecast models; Technical indicators.

Facts to source first: model outputs (computed daily by the pipeline), measured MAPE (pipeline), current technical summary (pipeline). No external fact blocks publication; analyst targets stay hidden until sourced.
