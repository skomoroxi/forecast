# Amazon (AMZN): keyword research and query fan-out

## Keyword research (Ahrefs, US, 2026-10-29)
Templates: "amazon prediction", "amazon forecast", "amzn prediction", "amzn forecast" (matching terms, sorted by volume). Keywords for past years (2025) are listed but not targeted.

| Keyword | US volume | KD | Note |
|---|---|---|---|
| amazon stock price prediction | 7,100 | 26 | **top 3** |
| amazon stock forecast | 7,000 | 11 | **top 3** |
| amzn stock forecast | 6,600 | 65 | **top 3** |
| amazon stock price prediction 2030 | 2,400 | 6 |  |
| amazon stock forecast 2026 | 1,000 | 1 |  |
| amazon stock price prediction 2025 | 1,000 | 13 | past year |
| amazon stock prediction | 900 | 43 |  |
| amazon stock forecast 2030 | 800 | 6 |  |
| amzn forecast | 500 | 12 |  |
| amazon stock price prediction 2026 | 500 | 18 |  |
| amazon stock price prediction 2040 | 400 | 0 |  |
| amazon stock prediction 2030 | 350 | 6 |  |
| amazon stock price prediction tomorrow | 200 | 43 |  |
| amazon stock prediction in 10 years | 150 | 13 |  |
| amazon forecast | 500 | 37 | mixed intent: AWS Forecast service |

**Top 3 by demand (targeted in Title, H1 and H2):** "amazon stock price prediction", "amazon stock forecast", "amzn stock forecast".
These are stored in `config/assets.yml` (`keywords`), and the build checks that they appear in the title, H1 and H2s (`scripts/smoke.mjs`).

---

# Query Fan-Out Analysis: amazon stock price prediction

## Inputs
- **Topic:** amazon stock price prediction
- **Audience:** English-speaking retail investors (US primary), beginners to active traders
- **Current Depth:** greenfield (new asset page on the forecast site; template proven on /silver-price-prediction/)
- **Primary Intent:** see concrete expected Amazon prices (tomorrow, 30 days, end of 2026, 2027–2030, beyond) and judge whether to buy, hold or sell
- **Demand data:** Ahrefs-grounded (US); rows without a measured keyword are labelled estimated

## Sub-Intents (12 total — 5 P1, 5 P2, 2 P3)

### 1. Short-term forecast: tomorrow, next week, next 30 days
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will the Amazon stock price be tomorrow and next week?"
**Expected format:** attribute table (date → forecast per method, P10–P90) + dated claim
**User Journey Stage:** Evaluation
**Demand:** amazon stock price prediction tomorrow 200 · today 90 · next week 70
**Content Angle:** Daily table for 30 days with the three models and consensus; separate tomorrow / one-week values near the top.

**EAV Slots:**
- Amazon (AMZN) → forecast price tomorrow → TO-RESEARCH (USD per share)
- Amazon (AMZN) → forecast price in 30 days → TO-RESEARCH (USD per share)

**Micro-Intent Questions:**
- Will Amazon stock go up tomorrow?
- What is the Amazon prediction for next week?
- How wide is the 30-day range?

### 2. Amazon forecast for 2026 (rest of the year)
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "Where will Amazon stock be at the end of 2026?"
**Expected format:** attribute table (month → low/avg/high) + dated claim
**User Journey Stage:** Evaluation
**Demand:** amazon stock forecast 2026 1,000 · amazon stock price prediction 2026 500 · amzn stock forecast 2026 300
**Content Angle:** Monthly table for the remaining months and a December 2026 figure; this is the largest keyword cluster.

**EAV Slots:**
- Amazon → forecast average December 2026 → TO-RESEARCH (USD per share)
- Amazon → expected change to year end → TO-RESEARCH (%)

**Micro-Intent Questions:**
- What is the Amazon forecast for the end of 2026?
- Will Amazon stock rise in 2026?
- Which month is expected to be strongest?

### 3. Amazon price prediction 2027–2030
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will Amazon stock be worth in 2027, 2028, 2029 and 2030?"
**Expected format:** attribute table per year + comparison table (models side by side)
**User Journey Stage:** Evaluation
**Demand:** amazon stock price prediction 2030 2,400 · forecast 2030 800 · 2027 150 · 2028 100 · amazon stock 5 year forecast 70
**Content Angle:** One monthly table per year plus a yearly model-comparison table; 2030 needs its own heading (high demand).

**EAV Slots:**
- Amazon → forecast average 2030 → TO-RESEARCH (USD per share, per method)
- Amazon → change to 2030 → TO-RESEARCH (% vs today)

**Micro-Intent Questions:**
- How much will Amazon stock be worth in 2030?
- Which year to 2030 is strongest for Amazon?
- How far apart are the models?

### 4. Long-term outlook to 2035 and beyond
**Priority:** P2 — Secondary
**Dimension:** Temporal
**Sub-query:** "Where could Amazon stock be in 10 years?"
**Expected format:** attribute table (yearly) + direct verdict with evidence
**User Journey Stage:** Research
**Demand:** amazon stock price prediction 2040 400 · 2035 150 · in 10 years 150
**Content Angle:** Yearly 2031–2035 with very wide P10–P90; state plainly that 2040/2050 numbers are not published because uncertainty is too large.

**EAV Slots:**
- Amazon → forecast 2035 → TO-RESEARCH (USD, range)
- Amazon → P10–P90 width 2035 → TO-RESEARCH (USD)

**Micro-Intent Questions:**
- What will Amazon stock be worth in 2035?
- Can anyone predict Amazon for 2040 or 2050?

### 5. Technical analysis: buy or sell now
**Priority:** P1 — Core
**Dimension:** Contextual
**Sub-query:** "Is AMZN a buy or sell right now?"
**Expected format:** direct verdict (gauge) + attribute table (indicators, moving averages, pivots)
**User Journey Stage:** Implementation
**Demand:** estimated (daily/hourly signal phrasing; e.g. 'today' variants above)
**Content Angle:** Daily/weekly/monthly summary with the 12 indicators, 12 moving averages and pivot points.

**EAV Slots:**
- AMZN → RSI(14) daily → TO-RESEARCH (0–100)
- AMZN → technical summary → TO-RESEARCH (Strong Sell…Strong Buy)

**Micro-Intent Questions:**
- Is AMZN overbought?
- Where are Amazon's support and resistance levels?
- Does the weekly signal agree with the daily one?

### 6. How reliable are these predictions
**Priority:** P1 — Core
**Dimension:** Safety & Legitimacy
**Sub-query:** "How accurate are Amazon price predictions?"
**Expected format:** direct verdict with evidence + attribute table (MAPE)
**User Journey Stage:** Evaluation
**Demand:** estimated (YMYL trust branch)
**Content Angle:** Models, data source, growth cap, measured error by horizon, and a not-financial-advice statement.

**EAV Slots:**
- Forecast consensus → 30-day MAPE → TO-RESEARCH (%)
- Forecast → long-run growth cap → TO-RESEARCH (%/year)

**Micro-Intent Questions:**
- How accurate were past Amazon forecasts?
- Why do the models disagree?
- Should I invest based on this?

### 7. Analyst and institutional forecasts
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "What do analysts and banks predict for Amazon?"
**Expected format:** comparison table (institution, target, horizon, date, source)
**User Journey Stage:** Evaluation
**Demand:** jim cramer amazon stock prediction 150 · amazon earnings prediction 90
**Content Angle:** Hand-maintained analysts.json; block hidden until two sourced, current entries exist.

**EAV Slots:**
- [Institution] → Amazon price target → TO-RESEARCH (USD, horizon, date)

**Micro-Intent Questions:**
- What is Wall Street's Amazon target?
- How does this site compare to analysts?

### 8. What drives the Amazon stock price
**Priority:** P2 — Secondary
**Dimension:** Definitional
**Sub-query:** "What factors move the Amazon stock price?"
**Expected format:** ranked list
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Ranked qualitative drivers: AWS cloud growth, retail margins and advertising, AI investment and capex, quarterly earnings, interest rates and tech valuations.

**EAV Slots:**
- Amazon → main price drivers → TO-RESEARCH (ranked list)

**Micro-Intent Questions:**
- Why did Amazon fall this year?
- What could push Amazon higher?

### 9. Is Amazon stock a good investment?
**Priority:** P2 — Secondary
**Dimension:** Cost
**Sub-query:** "Is Amazon stock worth buying in 2026?"
**Expected format:** direct verdict with evidence (bull vs bear) + bulleted checklist (risks)
**User Journey Stage:** Evaluation
**Demand:** estimated
**Content Angle:** Balanced bull/bear lists generated from data plus risks; no personal advice.

**EAV Slots:**
- Amazon → annualised volatility → TO-RESEARCH (%)
- Amazon → largest one-day move → TO-RESEARCH (%, date)

**Micro-Intent Questions:**
- Is it a good time to buy Amazon?
- What are the risks of Amazon?

### 10. AWS, advertising and earnings
**Priority:** P2 — Secondary
**Dimension:** Contextual
**Sub-query:** "What drives Amazon stock: AWS, ads or retail?"
**Expected format:** ranked list + dated claim
**User Journey Stage:** Evaluation
**Demand:** amazon earnings prediction 90
**Content Angle:** Rank business drivers qualitatively and give the next earnings date; note models use price history only.

**EAV Slots:**
- Amazon → next earnings date → TO-RESEARCH (date)
- AWS → share of operating income → TO-RESEARCH (%)

**Micro-Intent Questions:**
- Why does AWS matter for Amazon stock?
- When are Amazon's next earnings?
- Are earnings in these forecasts?

### 11. How to buy Amazon
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I buy Amazon?"
**Expected format:** numbered steps
**User Journey Stage:** Implementation
**Demand:** estimated
**Content Angle:** One line and a link.
**Owned by:** a 'how to buy Amazon' guide

**EAV Slots:**
- Amazon → ways to buy → TO-RESEARCH (list)

**Micro-Intent Questions:**
- Where can I buy Amazon?

### 12. Amazon Forecast (AWS service)
**Priority:** P3 — Adjacent
**Dimension:** Definitional
**Sub-query:** "What is Amazon Forecast the AWS service?"
**Expected format:** dated claim
**User Journey Stage:** Research
**Demand:** amazon forecast 500 · amazon forecast vs sagemaker 150
**Content Angle:** Not written here; one-line mention at most.
**Owned by:** not this site (different intent)

**EAV Slots:**
- Amazon → named predictions → TO-RESEARCH (quote, date, source)

**Micro-Intent Questions:**
- What is Amazon Forecast the AWS service?

## Scope Decision
**This page owns:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
**Linked out, not written:** 11 → a, 12 → n
**The next question:** "How do I buy Amazon?" → the 'how to buy Amazon' guide (planned).

## Dimension Coverage
| Dimension | Count | IDs |
|---|---|---|
| Definitional | 2 | 8, 12 |
| Comparative | 1 | 7 |
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
| direct verdict with evidence | 6, 9 |
| comparison table | 7 |
| ranked list | 8, 10 |
| numbered steps | 11 |
| dated claim | 12 |

## Pipeline Handoff Notes
Key entities: Amazon (AMZN); AWS; Nasdaq; Wall Street price targets; Forecast models; Technical indicators.

Facts to source first: model outputs (computed daily by the pipeline), measured MAPE (pipeline), current technical summary (pipeline). No external fact blocks publication; analyst targets stay hidden until sourced.
