# Nvidia (NVDA): keyword research and query fan-out

## Keyword research (Ahrefs, US, 2026-10-29)
Templates: "nvidia prediction", "nvidia forecast", "nvda prediction", "nvda forecast" (matching terms, sorted by volume). Keywords for past years (2025) are listed but not targeted.

| Keyword | US volume | KD | Note |
|---|---|---|---|
| nvidia stock forecast 2026 | 44,000 | 6 | **top 3** |
| nvidia stock price prediction 2026 | 42,000 | 29 | **top 3** |
| nvidia stock price prediction 2030 | 26,000 | 15 | **top 3** |
| nvidia stock forecast | 22,000 | 57 |  |
| nvda stock prediction | 20,000 | 28 |  |
| nvda stock forecast | 16,000 | 68 |  |
| nvidia stock prediction | 6,000 | 5 |  |
| nvda stock price prediction | 4,100 | 54 |  |
| nvidia forecast | 3,000 | 52 |  |
| nvda stock forecast 2026 | 2,600 | 15 |  |
| nvidia stock forecast 2030 | 2,300 | 0 |  |
| nvidia stock tomorrow price prediction | 2,200 | 10 |  |
| chatgpt nvidia stock prediction | 2,200 | 0 | P3 |
| bank of america nvidia forecast | 2,100 | 1 |  |
| nvda forecast | 2,000 | 39 |  |
| morgan stanley nvidia stock forecast | 1,700 | — |  |
| nvidia stock price prediction 2040 | 1,500 | 10 |  |

**Top 3 by demand (targeted in Title, H1 and H2):** "nvidia stock forecast 2026", "nvidia stock price prediction 2026", "nvidia stock price prediction 2030".
These are stored in `config/assets.yml` (`keywords`), and the build checks that they appear in the title, H1 and H2s (`scripts/smoke.mjs`).

---

# Query Fan-Out Analysis: nvidia stock forecast 2026

## Inputs
- **Topic:** nvidia stock forecast 2026
- **Audience:** English-speaking retail investors (US primary), beginners to active traders
- **Current Depth:** greenfield (new asset page on the forecast site; template proven on /silver-price-prediction/)
- **Primary Intent:** see concrete expected Nvidia prices (tomorrow, 30 days, end of 2026, 2027–2030, beyond) and judge whether to buy, hold or sell
- **Demand data:** Ahrefs-grounded (US); rows without a measured keyword are labelled estimated

## Sub-Intents (12 total — 5 P1, 5 P2, 2 P3)

### 1. Short-term forecast: tomorrow, next week, next 30 days
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will the Nvidia stock price be tomorrow and next week?"
**Expected format:** attribute table (date → forecast per method, P10–P90) + dated claim
**User Journey Stage:** Evaluation
**Demand:** nvidia stock tomorrow price prediction 2,200 · prediction today 1,500 · next week 350 · nvda stock prediction tomorrow 400
**Content Angle:** Daily table for 30 days with the three models and consensus; separate tomorrow / one-week values near the top.

**EAV Slots:**
- Nvidia (NVDA) → forecast price tomorrow → TO-RESEARCH (USD per share)
- Nvidia (NVDA) → forecast price in 30 days → TO-RESEARCH (USD per share)

**Micro-Intent Questions:**
- Will Nvidia stock go up tomorrow?
- What is the Nvidia prediction for next week?
- How wide is the 30-day range?

### 2. Nvidia forecast for 2026 (rest of the year)
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "Where will Nvidia stock be at the end of 2026?"
**Expected format:** attribute table (month → low/avg/high) + dated claim
**User Journey Stage:** Evaluation
**Demand:** nvidia stock forecast 2026 44,000 · nvidia stock price prediction 2026 42,000 · nvda stock forecast 2026 2,600 · nvidia stock price forecast 2026 1,900
**Content Angle:** Monthly table for the remaining months and a December 2026 figure; this is the largest keyword cluster.

**EAV Slots:**
- Nvidia → forecast average December 2026 → TO-RESEARCH (USD per share)
- Nvidia → expected change to year end → TO-RESEARCH (%)

**Micro-Intent Questions:**
- What is the Nvidia forecast for the end of 2026?
- Will Nvidia stock rise in 2026?
- Which month is expected to be strongest?

### 3. Nvidia price prediction 2027–2030
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will Nvidia stock be worth in 2027, 2028, 2029 and 2030?"
**Expected format:** attribute table per year + comparison table (models side by side)
**User Journey Stage:** Evaluation
**Demand:** nvidia stock price prediction 2030 26,000 · forecast 2030 2,300 · 2028 1,700 · 2027 1,000 · 2029 800 · nvda stock forecast 2030 1,700
**Content Angle:** One monthly table per year plus a yearly model-comparison table; 2030 needs its own heading (high demand).

**EAV Slots:**
- Nvidia → forecast average 2030 → TO-RESEARCH (USD per share, per method)
- Nvidia → change to 2030 → TO-RESEARCH (% vs today)

**Micro-Intent Questions:**
- How much will Nvidia stock be worth in 2030?
- Which year to 2030 is strongest for Nvidia?
- How far apart are the models?

### 4. Long-term outlook to 2035 and beyond
**Priority:** P2 — Secondary
**Dimension:** Temporal
**Sub-query:** "Where could Nvidia stock be in 10 years?"
**Expected format:** attribute table (yearly) + direct verdict with evidence
**User Journey Stage:** Research
**Demand:** nvidia stock price prediction 2040 1,500 · 2035 800
**Content Angle:** Yearly 2031–2035 with very wide P10–P90; state plainly that 2040/2050 numbers are not published because uncertainty is too large.

**EAV Slots:**
- Nvidia → forecast 2035 → TO-RESEARCH (USD, range)
- Nvidia → P10–P90 width 2035 → TO-RESEARCH (USD)

**Micro-Intent Questions:**
- What will Nvidia stock be worth in 2035?
- Can anyone predict Nvidia for 2040 or 2050?

### 5. Technical analysis: buy or sell now
**Priority:** P1 — Core
**Dimension:** Contextual
**Sub-query:** "Is NVDA a buy or sell right now?"
**Expected format:** direct verdict (gauge) + attribute table (indicators, moving averages, pivots)
**User Journey Stage:** Implementation
**Demand:** estimated (daily/hourly signal phrasing; e.g. 'today' variants above)
**Content Angle:** Daily/weekly/monthly summary with the 12 indicators, 12 moving averages and pivot points.

**EAV Slots:**
- NVDA → RSI(14) daily → TO-RESEARCH (0–100)
- NVDA → technical summary → TO-RESEARCH (Strong Sell…Strong Buy)

**Micro-Intent Questions:**
- Is NVDA overbought?
- Where are Nvidia's support and resistance levels?
- Does the weekly signal agree with the daily one?

### 6. How reliable are these predictions
**Priority:** P1 — Core
**Dimension:** Safety & Legitimacy
**Sub-query:** "How accurate are Nvidia price predictions?"
**Expected format:** direct verdict with evidence + attribute table (MAPE)
**User Journey Stage:** Evaluation
**Demand:** estimated (YMYL trust branch)
**Content Angle:** Models, data source, growth cap, measured error by horizon, and a not-financial-advice statement.

**EAV Slots:**
- Forecast consensus → 30-day MAPE → TO-RESEARCH (%)
- Forecast → long-run growth cap → TO-RESEARCH (%/year)

**Micro-Intent Questions:**
- How accurate were past Nvidia forecasts?
- Why do the models disagree?
- Should I invest based on this?

### 7. Analyst and institutional forecasts
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "What do analysts and banks predict for Nvidia?"
**Expected format:** comparison table (institution, target, horizon, date, source)
**User Journey Stage:** Evaluation
**Demand:** bank of america nvidia forecast 2,100 · morgan stanley nvidia stock forecast 1,700
**Content Angle:** Hand-maintained analysts.json; block hidden until two sourced, current entries exist.

**EAV Slots:**
- [Institution] → Nvidia price target → TO-RESEARCH (USD, horizon, date)

**Micro-Intent Questions:**
- What is Wall Street's Nvidia target?
- How does this site compare to analysts?

### 8. What drives the Nvidia stock price
**Priority:** P2 — Secondary
**Dimension:** Definitional
**Sub-query:** "What factors move the Nvidia stock price?"
**Expected format:** ranked list
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Ranked qualitative drivers: AI data-centre demand, quarterly earnings and guidance, competition and export rules, interest rates and tech valuations, semiconductor cycle.

**EAV Slots:**
- Nvidia → main price drivers → TO-RESEARCH (ranked list)

**Micro-Intent Questions:**
- Why did Nvidia fall this year?
- What could push Nvidia higher?

### 9. Is Nvidia stock a good investment?
**Priority:** P2 — Secondary
**Dimension:** Cost
**Sub-query:** "Is Nvidia stock worth buying in 2026?"
**Expected format:** direct verdict with evidence (bull vs bear) + bulleted checklist (risks)
**User Journey Stage:** Evaluation
**Demand:** estimated
**Content Angle:** Balanced bull/bear lists generated from data plus risks; no personal advice.

**EAV Slots:**
- Nvidia → annualised volatility → TO-RESEARCH (%)
- Nvidia → largest one-day move → TO-RESEARCH (%, date)

**Micro-Intent Questions:**
- Is it a good time to buy Nvidia?
- What are the risks of Nvidia?

### 10. Earnings and what moves NVDA
**Priority:** P2 — Secondary
**Dimension:** Contextual
**Sub-query:** "How do Nvidia earnings affect the stock forecast?"
**Expected format:** dated claim + ranked list
**User Journey Stage:** Evaluation
**Demand:** nvda earnings prediction 500 · nvidia earnings prediction 400
**Content Angle:** State that statistical models use price history only, so earnings surprises are a main source of forecast error; give the next earnings date.

**EAV Slots:**
- Nvidia → next earnings date → TO-RESEARCH (date)
- Nvidia → fiscal year end → TO-RESEARCH (month)

**Micro-Intent Questions:**
- When does Nvidia report earnings?
- Do earnings move NVDA a lot?
- Are earnings in these forecasts?

### 11. How to buy Nvidia
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I buy Nvidia?"
**Expected format:** numbered steps
**User Journey Stage:** Implementation
**Demand:** estimated
**Content Angle:** One line and a link.
**Owned by:** a 'how to buy Nvidia' guide

**EAV Slots:**
- Nvidia → ways to buy → TO-RESEARCH (list)

**Micro-Intent Questions:**
- Where can I buy Nvidia?

### 12. ChatGPT / AI predictions for Nvidia stock
**Priority:** P3 — Adjacent
**Dimension:** Temporal
**Sub-query:** "What does ChatGPT predict for Nvidia stock?"
**Expected format:** dated claim
**User Journey Stage:** Research
**Demand:** chatgpt nvidia stock prediction 2,200
**Content Angle:** Not written here; one-line mention at most.
**Owned by:** an 'AI stock predictions' article

**EAV Slots:**
- Nvidia → named predictions → TO-RESEARCH (quote, date, source)

**Micro-Intent Questions:**
- What does ChatGPT predict for Nvidia stock?

## Scope Decision
**This page owns:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
**Linked out, not written:** 11 → a, 12 → a
**The next question:** "How do I buy Nvidia?" → the 'how to buy Nvidia' guide (planned).

## Dimension Coverage
| Dimension | Count | IDs |
|---|---|---|
| Definitional | 1 | 8 |
| Comparative | 1 | 7 |
| Procedural | 1 | 11 |
| Contextual | 2 | 5, 10 |
| Problem–Solution | 0 | — |
| Cost | 1 | 9 |
| Safety & Legitimacy | 1 | 6 |
| Prerequisite & Eligibility | 0 | — |
| Temporal | 5 | 1, 2, 3, 4, 12 |

Problem–Solution and Prerequisite & Eligibility are real absences for a forecast page: "why was the forecast wrong" is covered by the reliability branch, and account/eligibility questions belong to the 'how to buy' guide.

## Format Spread
| Container | Sub-intent IDs |
|---|---|
| attribute table | 1, 2, 4 |
| attribute table per year | 3 |
| direct verdict | 5 |
| direct verdict with evidence | 6, 9 |
| comparison table | 7 |
| ranked list | 8 |
| dated claim | 10, 12 |
| numbered steps | 11 |

## Pipeline Handoff Notes
Key entities: Nvidia (NVDA); AI data centres; Nasdaq; Wall Street price targets; Forecast models; Technical indicators.

Facts to source first: model outputs (computed daily by the pipeline), measured MAPE (pipeline), current technical summary (pipeline). No external fact blocks publication; analyst targets stay hidden until sourced.
