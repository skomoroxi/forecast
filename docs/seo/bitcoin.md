# Bitcoin (BTC): keyword research and query fan-out

## Keyword research (Ahrefs, US, 2026-10-29)
Templates: "bitcoin prediction", "bitcoin forecast", "btc prediction", "btc forecast" (matching terms, sorted by volume). Keywords for past years (2025) are listed but not targeted.

| Keyword | US volume | KD | Note |
|---|---|---|---|
| bitcoin price prediction 2026 | 28,000 | 51 | **top 3** |
| bitcoin price prediction | 17,000 | 58 | **top 3** |
| bitcoin price prediction 2030 | 10,000 | 52 | **top 3** |
| bitcoin price prediction 2025 | 25,000 | 62 | past year: not targeted |
| btc price prediction | 7,300 | 60 |  |
| bitcoin price forecast 2026 | 5,100 | 45 |  |
| bitcoin price prediction blackrock | 4,900 | 6 | P3 |
| bitcoin price forecast | 4,600 | 53 |  |
| bitcoin forecast | 4,100 | 70 |  |
| bitcoin prediction | 3,900 | 51 |  |
| bitcoin price prediction 2040 | 3,400 | 59 |  |
| bitcoin price prediction end of 2026 | 3,300 | 55 |  |
| bitcoin price prediction daily | 2,800 | 73 |  |
| bitcoin price prediction next 24 hours | 2,300 | 72 |  |
| btc prediction | 1,600 | 58 |  |
| btc forecast | 800 | 72 |  |
| bitcoin price prediction tomorrow | 600 | 71 |  |

**Top 3 by demand (targeted in Title, H1 and H2):** "bitcoin price prediction 2026", "bitcoin price prediction", "bitcoin price prediction 2030".
These are stored in `config/assets.yml` (`keywords`), and the build checks that they appear in the title, H1 and H2s (`scripts/smoke.mjs`).

---

# Query Fan-Out Analysis: bitcoin price prediction 2026

## Inputs
- **Topic:** bitcoin price prediction 2026
- **Audience:** English-speaking retail investors (US primary), beginners to active traders
- **Current Depth:** greenfield (new asset page on the forecast site; template proven on /silver-price-prediction/)
- **Primary Intent:** see concrete expected Bitcoin prices (tomorrow, 30 days, end of 2026, 2027–2030, beyond) and judge whether to buy, hold or sell
- **Demand data:** Ahrefs-grounded (US); rows without a measured keyword are labelled estimated

## Sub-Intents (12 total — 5 P1, 5 P2, 2 P3)

### 1. Short-term forecast: tomorrow, next week, next 30 days
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will the Bitcoin price be tomorrow and next week?"
**Expected format:** attribute table (date → forecast per method, P10–P90) + dated claim
**User Journey Stage:** Evaluation
**Demand:** bitcoin price prediction next 24 hours 2,300 · daily 2,800 · today 1,200 · tomorrow 600 · this week 1,000
**Content Angle:** Daily table for 30 days with the three models and consensus; separate tomorrow / one-week values near the top.

**EAV Slots:**
- Bitcoin (BTC) → forecast price tomorrow → TO-RESEARCH (USD per coin)
- Bitcoin (BTC) → forecast price in 30 days → TO-RESEARCH (USD per coin)

**Micro-Intent Questions:**
- Will Bitcoin go up tomorrow?
- What is the Bitcoin prediction for next week?
- How wide is the 30-day range?

### 2. Bitcoin forecast for 2026 (rest of the year)
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "Where will Bitcoin be at the end of 2026?"
**Expected format:** attribute table (month → low/avg/high) + dated claim
**User Journey Stage:** Evaluation
**Demand:** bitcoin price prediction 2026 28,000 · end of 2026 3,300 · 2026 end of year 2,400 · bitcoin price forecast 2026 5,100
**Content Angle:** Monthly table for the remaining months and a December 2026 figure; this is the largest keyword cluster.

**EAV Slots:**
- Bitcoin → forecast average December 2026 → TO-RESEARCH (USD per coin)
- Bitcoin → expected change to year end → TO-RESEARCH (%)

**Micro-Intent Questions:**
- What is the Bitcoin forecast for the end of 2026?
- Will Bitcoin rise in 2026?
- Which month is expected to be strongest?

### 3. Bitcoin price prediction 2027–2030
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will Bitcoin be worth in 2027, 2028, 2029 and 2030?"
**Expected format:** attribute table per year + comparison table (models side by side)
**User Journey Stage:** Evaluation
**Demand:** bitcoin price prediction 2030 10,000 · 2028 1,600 · 2029 800 · 2026 2027 3,000 · btc price prediction 2030 800
**Content Angle:** One monthly table per year plus a yearly model-comparison table; 2030 needs its own heading (high demand).

**EAV Slots:**
- Bitcoin → forecast average 2030 → TO-RESEARCH (USD per coin, per method)
- Bitcoin → change to 2030 → TO-RESEARCH (% vs today)

**Micro-Intent Questions:**
- How much will Bitcoin be worth in 2030?
- Which year to 2030 is strongest for Bitcoin?
- How far apart are the models?

### 4. Long-term outlook to 2035 and beyond
**Priority:** P2 — Secondary
**Dimension:** Temporal
**Sub-query:** "Where could Bitcoin be in 10 years?"
**Expected format:** attribute table (yearly) + direct verdict with evidence
**User Journey Stage:** Research
**Demand:** bitcoin price prediction 2040 3,400 · 2035 1,700 · 2050 1,000
**Content Angle:** Yearly 2031–2035 with very wide P10–P90; state plainly that 2040/2050 numbers are not published because uncertainty is too large.

**EAV Slots:**
- Bitcoin → forecast 2035 → TO-RESEARCH (USD, range)
- Bitcoin → P10–P90 width 2035 → TO-RESEARCH (USD)

**Micro-Intent Questions:**
- What will Bitcoin be worth in 2035?
- Can anyone predict Bitcoin for 2040 or 2050?

### 5. Technical analysis: buy or sell now
**Priority:** P1 — Core
**Dimension:** Contextual
**Sub-query:** "Is BTC a buy or sell right now?"
**Expected format:** direct verdict (gauge) + attribute table (indicators, moving averages, pivots)
**User Journey Stage:** Implementation
**Demand:** estimated (daily/hourly signal phrasing; e.g. 'today' variants above)
**Content Angle:** Daily/weekly/monthly summary with the 12 indicators, 12 moving averages and pivot points.

**EAV Slots:**
- BTC → RSI(14) daily → TO-RESEARCH (0–100)
- BTC → technical summary → TO-RESEARCH (Strong Sell…Strong Buy)

**Micro-Intent Questions:**
- Is BTC overbought?
- Where are Bitcoin's support and resistance levels?
- Does the weekly signal agree with the daily one?

### 6. How reliable are these predictions
**Priority:** P1 — Core
**Dimension:** Safety & Legitimacy
**Sub-query:** "How accurate are Bitcoin price predictions?"
**Expected format:** direct verdict with evidence + attribute table (MAPE)
**User Journey Stage:** Evaluation
**Demand:** estimated (YMYL trust branch)
**Content Angle:** Models, data source, growth cap, measured error by horizon, and a not-financial-advice statement.

**EAV Slots:**
- Forecast consensus → 30-day MAPE → TO-RESEARCH (%)
- Forecast → long-run growth cap → TO-RESEARCH (%/year)

**Micro-Intent Questions:**
- How accurate were past Bitcoin forecasts?
- Why do the models disagree?
- Should I invest based on this?

### 7. Analyst and institutional forecasts
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "What do analysts and banks predict for Bitcoin?"
**Expected format:** comparison table (institution, target, horizon, date, source)
**User Journey Stage:** Evaluation
**Demand:** bitcoin price prediction blackrock 4,900 · bitcoin price forecast 2026 analysts 700 · jamie dimon bitcoin prediction 1,000 · tom lee bitcoin price prediction 600
**Content Angle:** Hand-maintained analysts.json; block hidden until two sourced, current entries exist.

**EAV Slots:**
- [Institution] → Bitcoin price target → TO-RESEARCH (USD, horizon, date)

**Micro-Intent Questions:**
- What is Wall Street's Bitcoin target?
- How does this site compare to analysts?

### 8. What drives the Bitcoin price
**Priority:** P2 — Secondary
**Dimension:** Definitional
**Sub-query:** "What factors move the Bitcoin price?"
**Expected format:** ranked list
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Ranked qualitative drivers: Bitcoin halving cycle, spot bitcoin ETF flows, US interest rates and liquidity, regulation, network adoption.

**EAV Slots:**
- Bitcoin → main price drivers → TO-RESEARCH (ranked list)

**Micro-Intent Questions:**
- Why did Bitcoin fall this year?
- What could push Bitcoin higher?

### 9. Is Bitcoin a good investment?
**Priority:** P2 — Secondary
**Dimension:** Cost
**Sub-query:** "Is Bitcoin worth buying in 2026?"
**Expected format:** direct verdict with evidence (bull vs bear) + bulleted checklist (risks)
**User Journey Stage:** Evaluation
**Demand:** estimated
**Content Angle:** Balanced bull/bear lists generated from data plus risks; no personal advice.

**EAV Slots:**
- Bitcoin → annualised volatility → TO-RESEARCH (%)
- Bitcoin → largest one-day move → TO-RESEARCH (%, date)

**Micro-Intent Questions:**
- Is it a good time to buy Bitcoin?
- What are the risks of Bitcoin?

### 10. Halving cycle and price
**Priority:** P2 — Secondary
**Dimension:** Contextual
**Sub-query:** "How does the bitcoin halving affect the price forecast?"
**Expected format:** dated claim + definition sentence
**User Journey Stage:** Evaluation
**Demand:** estimated (halving terms not in seed set)
**Content Angle:** Explain the 4-year halving cycle in one paragraph, when the next halving is, and why statistical models on this page do not model it explicitly.

**EAV Slots:**
- Bitcoin → next halving date → TO-RESEARCH (date)
- Bitcoin → block reward after next halving → TO-RESEARCH (BTC per block)

**Micro-Intent Questions:**
- When is the next bitcoin halving?
- Does the halving always push the price up?
- Is the halving included in these forecasts?

### 11. How to buy Bitcoin
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I buy Bitcoin?"
**Expected format:** numbered steps
**User Journey Stage:** Implementation
**Demand:** estimated
**Content Angle:** One line and a link.
**Owned by:** a 'how to buy Bitcoin' guide

**EAV Slots:**
- Bitcoin → ways to buy → TO-RESEARCH (list)

**Micro-Intent Questions:**
- Where can I buy Bitcoin?

### 12. Bitcoin price predictions by famous investors (BlackRock, Jamie Dimon, Tom Lee)
**Priority:** P3 — Adjacent
**Dimension:** Comparative
**Sub-query:** "What do BlackRock, Jamie Dimon and Tom Lee predict for bitcoin?"
**Expected format:** dated claim
**User Journey Stage:** Research
**Demand:** 4,900 + 1,000 + 600
**Content Angle:** Not written here; one-line mention at most.
**Owned by:** a 'famous bitcoin predictions' article

**EAV Slots:**
- Bitcoin → named predictions → TO-RESEARCH (quote, date, source)

**Micro-Intent Questions:**
- What do BlackRock, Jamie Dimon and Tom Lee predict for bitcoin?

## Scope Decision
**This page owns:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
**Linked out, not written:** 11 → a, 12 → a
**The next question:** "How do I buy Bitcoin?" → the 'how to buy Bitcoin' guide (planned).

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
| direct verdict with evidence | 6, 9 |
| comparison table | 7 |
| ranked list | 8 |
| dated claim | 10, 12 |
| numbered steps | 11 |

## Pipeline Handoff Notes
Key entities: Bitcoin (BTC/USD); Bitcoin halving; Spot bitcoin ETFs; US Federal Reserve; BlackRock; Forecast models (ARIMA, trend + reversion, Monte Carlo); Technical indicators.

Facts to source first: model outputs (computed daily by the pipeline), measured MAPE (pipeline), current technical summary (pipeline). No external fact blocks publication; analyst targets stay hidden until sourced.
