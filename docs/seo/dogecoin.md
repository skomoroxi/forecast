# Dogecoin (DOGE): keyword research and query fan-out

## Keyword research (Ahrefs, US, 2026-10-29)
Templates: "dogecoin prediction", "dogecoin forecast", "doge prediction", "doge forecast" (matching terms, sorted by volume). Keywords for past years (2025) are listed but not targeted.

| Keyword | US volume | KD | Note |
|---|---|---|---|
| dogecoin price prediction | 9,300 | 30 | **top 3** |
| dogecoin prediction | 8,100 | 33 | **top 3** |
| dogecoin price prediction 2030 | 3,300 | 30 | **top 3** |
| dogecoin price prediction 2025 | 4,600 | 2 | past year |
| dogecoin price prediction 2026 | 3,200 | 26 |  |
| dogecoin forecast | 2,500 | 39 |  |
| doge price prediction | 1,900 | 39 |  |
| shiba inu dogecoin plunge prediction | 1,100 | — | P3 |
| dogecoin price prediction 2050 | 700 | 46 |  |
| dogecoin price prediction 2027 | 500 | — |  |
| dogecoin price prediction 2040 | 450 | 1 |  |
| doge price prediction 2030 | 350 | 8 |  |
| doge prediction | 300 | 2 |  |
| dogecoin price prediction tomorrow | 150 | 50 |  |

**Top 3 by demand (targeted in Title, H1 and H2):** "dogecoin price prediction", "dogecoin prediction", "dogecoin price prediction 2030".
These are stored in `config/assets.yml` (`keywords`), and the build checks that they appear in the title, H1 and H2s (`scripts/smoke.mjs`).

---

# Query Fan-Out Analysis: dogecoin price prediction

## Inputs
- **Topic:** dogecoin price prediction
- **Audience:** English-speaking retail investors (US primary), beginners to active traders
- **Current Depth:** greenfield (new asset page on the forecast site; template proven on /silver-price-prediction/)
- **Primary Intent:** see concrete expected Dogecoin prices (tomorrow, 30 days, end of 2026, 2027–2030, beyond) and judge whether to buy, hold or sell
- **Demand data:** Ahrefs-grounded (US); rows without a measured keyword are labelled estimated

## Sub-Intents (12 total — 5 P1, 5 P2, 2 P3)

### 1. Short-term forecast: tomorrow, next week, next 30 days
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will the Dogecoin price be tomorrow and next week?"
**Expected format:** attribute table (date → forecast per method, P10–P90) + dated claim
**User Journey Stage:** Evaluation
**Demand:** dogecoin price prediction tomorrow 150 · today 100
**Content Angle:** Daily table for 30 days with the three models and consensus; separate tomorrow / one-week values near the top.

**EAV Slots:**
- Dogecoin (DOGE) → forecast price tomorrow → TO-RESEARCH (USD per coin)
- Dogecoin (DOGE) → forecast price in 30 days → TO-RESEARCH (USD per coin)

**Micro-Intent Questions:**
- Will Dogecoin go up tomorrow?
- What is the Dogecoin prediction for next week?
- How wide is the 30-day range?

### 2. Dogecoin forecast for 2026 (rest of the year)
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "Where will Dogecoin be at the end of 2026?"
**Expected format:** attribute table (month → low/avg/high) + dated claim
**User Journey Stage:** Evaluation
**Demand:** dogecoin price prediction 2026 3,200 · dogecoin prediction 2026 350 · end of 2026 100
**Content Angle:** Monthly table for the remaining months and a December 2026 figure; this is the largest keyword cluster.

**EAV Slots:**
- Dogecoin → forecast average December 2026 → TO-RESEARCH (USD per coin)
- Dogecoin → expected change to year end → TO-RESEARCH (%)

**Micro-Intent Questions:**
- What is the Dogecoin forecast for the end of 2026?
- Will Dogecoin rise in 2026?
- Which month is expected to be strongest?

### 3. Dogecoin price prediction 2027–2030
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will Dogecoin be worth in 2027, 2028, 2029 and 2030?"
**Expected format:** attribute table per year + comparison table (models side by side)
**User Journey Stage:** Evaluation
**Demand:** dogecoin price prediction 2030 3,300 · 2027 500 · 2028 200 · doge price prediction 2030 350
**Content Angle:** One monthly table per year plus a yearly model-comparison table; 2030 needs its own heading (high demand).

**EAV Slots:**
- Dogecoin → forecast average 2030 → TO-RESEARCH (USD per coin, per method)
- Dogecoin → change to 2030 → TO-RESEARCH (% vs today)

**Micro-Intent Questions:**
- How much will Dogecoin be worth in 2030?
- Which year to 2030 is strongest for Dogecoin?
- How far apart are the models?

### 4. Long-term outlook to 2035 and beyond
**Priority:** P2 — Secondary
**Dimension:** Temporal
**Sub-query:** "Where could Dogecoin be in 10 years?"
**Expected format:** attribute table (yearly) + direct verdict with evidence
**User Journey Stage:** Research
**Demand:** dogecoin price prediction 2050 700 · 2040 450 · 2035 150
**Content Angle:** Yearly 2031–2035 with very wide P10–P90; state plainly that 2040/2050 numbers are not published because uncertainty is too large.

**EAV Slots:**
- Dogecoin → forecast 2035 → TO-RESEARCH (USD, range)
- Dogecoin → P10–P90 width 2035 → TO-RESEARCH (USD)

**Micro-Intent Questions:**
- What will Dogecoin be worth in 2035?
- Can anyone predict Dogecoin for 2040 or 2050?

### 5. Technical analysis: buy or sell now
**Priority:** P1 — Core
**Dimension:** Contextual
**Sub-query:** "Is DOGE a buy or sell right now?"
**Expected format:** direct verdict (gauge) + attribute table (indicators, moving averages, pivots)
**User Journey Stage:** Implementation
**Demand:** estimated (daily/hourly signal phrasing; e.g. 'today' variants above)
**Content Angle:** Daily/weekly/monthly summary with the 12 indicators, 12 moving averages and pivot points.

**EAV Slots:**
- DOGE → RSI(14) daily → TO-RESEARCH (0–100)
- DOGE → technical summary → TO-RESEARCH (Strong Sell…Strong Buy)

**Micro-Intent Questions:**
- Is DOGE overbought?
- Where are Dogecoin's support and resistance levels?
- Does the weekly signal agree with the daily one?

### 6. How reliable are these predictions
**Priority:** P1 — Core
**Dimension:** Safety & Legitimacy
**Sub-query:** "How accurate are Dogecoin price predictions?"
**Expected format:** direct verdict with evidence + attribute table (MAPE)
**User Journey Stage:** Evaluation
**Demand:** estimated (YMYL trust branch)
**Content Angle:** Models, data source, growth cap, measured error by horizon, and a not-financial-advice statement.

**EAV Slots:**
- Forecast consensus → 30-day MAPE → TO-RESEARCH (%)
- Forecast → long-run growth cap → TO-RESEARCH (%/year)

**Micro-Intent Questions:**
- How accurate were past Dogecoin forecasts?
- Why do the models disagree?
- Should I invest based on this?

### 7. Analyst and institutional forecasts
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "What do analysts and banks predict for Dogecoin?"
**Expected format:** comparison table (institution, target, horizon, date, source)
**User Journey Stage:** Evaluation
**Demand:** none measured (no institutional coverage)
**Content Angle:** Hand-maintained analysts.json; block hidden until two sourced, current entries exist.

**EAV Slots:**
- [Institution] → Dogecoin price target → TO-RESEARCH (USD, horizon, date)

**Micro-Intent Questions:**
- What is Wall Street's Dogecoin target?
- How does this site compare to analysts?

### 8. What drives the Dogecoin price
**Priority:** P2 — Secondary
**Dimension:** Definitional
**Sub-query:** "What factors move the Dogecoin price?"
**Expected format:** ranked list
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Ranked qualitative drivers: Elon Musk and social-media attention, memecoin market cycles, payment adoption, unlimited supply (inflationary issuance), crypto market risk appetite.

**EAV Slots:**
- Dogecoin → main price drivers → TO-RESEARCH (ranked list)

**Micro-Intent Questions:**
- Why did Dogecoin fall this year?
- What could push Dogecoin higher?

### 9. Is Dogecoin a good investment?
**Priority:** P2 — Secondary
**Dimension:** Cost
**Sub-query:** "Is Dogecoin worth buying in 2026?"
**Expected format:** direct verdict with evidence (bull vs bear) + bulleted checklist (risks)
**User Journey Stage:** Evaluation
**Demand:** estimated
**Content Angle:** Balanced bull/bear lists generated from data plus risks; no personal advice.

**EAV Slots:**
- Dogecoin → annualised volatility → TO-RESEARCH (%)
- Dogecoin → largest one-day move → TO-RESEARCH (%, date)

**Micro-Intent Questions:**
- Is it a good time to buy Dogecoin?
- What are the risks of Dogecoin?

### 10. Will Dogecoin reach $1?
**Priority:** P2 — Secondary
**Dimension:** Contextual
**Sub-query:** "Can Dogecoin reach $1?"
**Expected format:** direct verdict with evidence
**User Journey Stage:** Evaluation
**Demand:** estimated (milestone phrasing; 'dogecoin price prediction 2030' 3,300)
**Content Angle:** Answer with the model ranges and the market-cap arithmetic given Dogecoin's growing supply.

**EAV Slots:**
- Dogecoin → circulating supply → TO-RESEARCH (coins)
- Dogecoin → annual new issuance → TO-RESEARCH (coins per year)

**Micro-Intent Questions:**
- Will Dogecoin hit $1?
- How much would Dogecoin's market cap be at $1?
- Why does Dogecoin's supply keep growing?

### 11. How to buy Dogecoin
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I buy Dogecoin?"
**Expected format:** numbered steps
**User Journey Stage:** Implementation
**Demand:** estimated
**Content Angle:** One line and a link.
**Owned by:** a 'how to buy Dogecoin' guide

**EAV Slots:**
- Dogecoin → ways to buy → TO-RESEARCH (list)

**Micro-Intent Questions:**
- Where can I buy Dogecoin?

### 12. Shiba Inu vs Dogecoin
**Priority:** P3 — Adjacent
**Dimension:** Comparative
**Sub-query:** "Will Shiba Inu or Dogecoin do better?"
**Expected format:** dated claim
**User Journey Stage:** Research
**Demand:** shiba inu dogecoin plunge prediction 1,100
**Content Angle:** Not written here; one-line mention at most.
**Owned by:** a Shiba Inu forecast page (not covered yet)

**EAV Slots:**
- Dogecoin → named predictions → TO-RESEARCH (quote, date, source)

**Micro-Intent Questions:**
- Will Shiba Inu or Dogecoin do better?

## Scope Decision
**This page owns:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
**Linked out, not written:** 11 → a, 12 → a
**The next question:** "How do I buy Dogecoin?" → the 'how to buy Dogecoin' guide (planned).

## Dimension Coverage
| Dimension | Count | IDs |
|---|---|---|
| Definitional | 1 | 8 |
| Comparative | 2 | 7, 12 |
| Procedural | 1 | 11 |
| Contextual | 2 | 5, 10 |
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
| direct verdict with evidence | 6, 9, 10 |
| comparison table | 7 |
| ranked list | 8 |
| numbered steps | 11 |
| dated claim | 12 |

## Pipeline Handoff Notes
Key entities: Dogecoin (DOGE/USD); Elon Musk; Memecoins; Dogecoin supply schedule; Forecast models; Technical indicators.

Facts to source first: model outputs (computed daily by the pipeline), measured MAPE (pipeline), current technical summary (pipeline). No external fact blocks publication; analyst targets stay hidden until sourced.
