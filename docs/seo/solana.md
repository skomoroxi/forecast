# Solana (SOL): keyword research and query fan-out

## Keyword research (Ahrefs, US, 2026-10-29)
Templates: "solana prediction", "solana forecast", "sol prediction", "sol forecast" (matching terms, sorted by volume). Keywords for past years (2025) are listed but not targeted.

| Keyword | US volume | KD | Note |
|---|---|---|---|
| solana price prediction | 46,000 | 16 | **top 3** |
| solana price prediction 2026 | 5,400 | 30 | **top 3** |
| solana price prediction 2030 | 4,700 | 26 | **top 3** |
| solana sol price prediction 2026 | 3,000 | 31 |  |
| sol price prediction | 2,000 | 17 |  |
| solana sol price prediction 2030 | 1,100 | — |  |
| solana price prediction 2027 | 800 | — |  |
| solana prediction | 800 | 12 |  |
| solana crypto price prediction | 600 | 25 |  |
| solana price prediction 2035 | 500 | 0 |  |
| sol price prediction 2030 | 450 | 34 |  |
| solana price forecast | 350 | 22 |  |
| solana forecast | 350 | 43 |  |
| solana price prediction today | 250 | 61 |  |
| xrp vs solana 2030 forecast | 300 | — | P3 |

**Top 3 by demand (targeted in Title, H1 and H2):** "solana price prediction", "solana price prediction 2026", "solana price prediction 2030".
These are stored in `config/assets.yml` (`keywords`), and the build checks that they appear in the title, H1 and H2s (`scripts/smoke.mjs`).

---

# Query Fan-Out Analysis: solana price prediction

## Inputs
- **Topic:** solana price prediction
- **Audience:** English-speaking retail investors (US primary), beginners to active traders
- **Current Depth:** greenfield (new asset page on the forecast site; template proven on /silver-price-prediction/)
- **Primary Intent:** see concrete expected Solana prices (tomorrow, 30 days, end of 2026, 2027–2030, beyond) and judge whether to buy, hold or sell
- **Demand data:** Ahrefs-grounded (US); rows without a measured keyword are labelled estimated

## Sub-Intents (12 total — 5 P1, 5 P2, 2 P3)

### 1. Short-term forecast: tomorrow, next week, next 30 days
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will the Solana price be tomorrow and next week?"
**Expected format:** attribute table (date → forecast per method, P10–P90) + dated claim
**User Journey Stage:** Evaluation
**Demand:** solana price prediction today 250 · short term 300 · today, tomorrow 200
**Content Angle:** Daily table for 30 days with the three models and consensus; separate tomorrow / one-week values near the top.

**EAV Slots:**
- Solana (SOL) → forecast price tomorrow → TO-RESEARCH (USD per coin)
- Solana (SOL) → forecast price in 30 days → TO-RESEARCH (USD per coin)

**Micro-Intent Questions:**
- Will Solana go up tomorrow?
- What is the Solana prediction for next week?
- How wide is the 30-day range?

### 2. Solana forecast for 2026 (rest of the year)
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "Where will Solana be at the end of 2026?"
**Expected format:** attribute table (month → low/avg/high) + dated claim
**User Journey Stage:** Evaluation
**Demand:** solana price prediction 2026 5,400 · solana sol price prediction 2026 3,000 · end of 2026 400
**Content Angle:** Monthly table for the remaining months and a December 2026 figure; this is the largest keyword cluster.

**EAV Slots:**
- Solana → forecast average December 2026 → TO-RESEARCH (USD per coin)
- Solana → expected change to year end → TO-RESEARCH (%)

**Micro-Intent Questions:**
- What is the Solana forecast for the end of 2026?
- Will Solana rise in 2026?
- Which month is expected to be strongest?

### 3. Solana price prediction 2027–2030
**Priority:** P1 — Core
**Dimension:** Temporal
**Sub-query:** "What will Solana be worth in 2027, 2028, 2029 and 2030?"
**Expected format:** attribute table per year + comparison table (models side by side)
**User Journey Stage:** Evaluation
**Demand:** solana price prediction 2030 4,700 · 2027 800 · 2028 400 · 2029 250 · solana sol price prediction 2030 1,100
**Content Angle:** One monthly table per year plus a yearly model-comparison table; 2030 needs its own heading (high demand).

**EAV Slots:**
- Solana → forecast average 2030 → TO-RESEARCH (USD per coin, per method)
- Solana → change to 2030 → TO-RESEARCH (% vs today)

**Micro-Intent Questions:**
- How much will Solana be worth in 2030?
- Which year to 2030 is strongest for Solana?
- How far apart are the models?

### 4. Long-term outlook to 2035 and beyond
**Priority:** P2 — Secondary
**Dimension:** Temporal
**Sub-query:** "Where could Solana be in 10 years?"
**Expected format:** attribute table (yearly) + direct verdict with evidence
**User Journey Stage:** Research
**Demand:** solana price prediction 2035 500 · 2050 250
**Content Angle:** Yearly 2031–2035 with very wide P10–P90; state plainly that 2040/2050 numbers are not published because uncertainty is too large.

**EAV Slots:**
- Solana → forecast 2035 → TO-RESEARCH (USD, range)
- Solana → P10–P90 width 2035 → TO-RESEARCH (USD)

**Micro-Intent Questions:**
- What will Solana be worth in 2035?
- Can anyone predict Solana for 2040 or 2050?

### 5. Technical analysis: buy or sell now
**Priority:** P1 — Core
**Dimension:** Contextual
**Sub-query:** "Is SOL a buy or sell right now?"
**Expected format:** direct verdict (gauge) + attribute table (indicators, moving averages, pivots)
**User Journey Stage:** Implementation
**Demand:** estimated (daily/hourly signal phrasing; e.g. 'today' variants above)
**Content Angle:** Daily/weekly/monthly summary with the 12 indicators, 12 moving averages and pivot points.

**EAV Slots:**
- SOL → RSI(14) daily → TO-RESEARCH (0–100)
- SOL → technical summary → TO-RESEARCH (Strong Sell…Strong Buy)

**Micro-Intent Questions:**
- Is SOL overbought?
- Where are Solana's support and resistance levels?
- Does the weekly signal agree with the daily one?

### 6. How reliable are these predictions
**Priority:** P1 — Core
**Dimension:** Safety & Legitimacy
**Sub-query:** "How accurate are Solana price predictions?"
**Expected format:** direct verdict with evidence + attribute table (MAPE)
**User Journey Stage:** Evaluation
**Demand:** estimated (YMYL trust branch)
**Content Angle:** Models, data source, growth cap, measured error by horizon, and a not-financial-advice statement.

**EAV Slots:**
- Forecast consensus → 30-day MAPE → TO-RESEARCH (%)
- Forecast → long-run growth cap → TO-RESEARCH (%/year)

**Micro-Intent Questions:**
- How accurate were past Solana forecasts?
- Why do the models disagree?
- Should I invest based on this?

### 7. Analyst and institutional forecasts
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "What do analysts and banks predict for Solana?"
**Expected format:** comparison table (institution, target, horizon, date, source)
**User Journey Stage:** Evaluation
**Demand:** solana analyst ratings price targets 2026 (parent topic, volume not measured)
**Content Angle:** Hand-maintained analysts.json; block hidden until two sourced, current entries exist.

**EAV Slots:**
- [Institution] → Solana price target → TO-RESEARCH (USD, horizon, date)

**Micro-Intent Questions:**
- What is Wall Street's Solana target?
- How does this site compare to analysts?

### 8. What drives the Solana price
**Priority:** P2 — Secondary
**Dimension:** Definitional
**Sub-query:** "What factors move the Solana price?"
**Expected format:** ranked list
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Ranked qualitative drivers: network activity (DeFi, NFTs, memecoins), spot SOL ETF approvals, network reliability, competition with Ethereum, crypto market risk appetite.

**EAV Slots:**
- Solana → main price drivers → TO-RESEARCH (ranked list)

**Micro-Intent Questions:**
- Why did Solana fall this year?
- What could push Solana higher?

### 9. Is Solana a good investment?
**Priority:** P2 — Secondary
**Dimension:** Cost
**Sub-query:** "Is Solana worth buying in 2026?"
**Expected format:** direct verdict with evidence (bull vs bear) + bulleted checklist (risks)
**User Journey Stage:** Evaluation
**Demand:** estimated
**Content Angle:** Balanced bull/bear lists generated from data plus risks; no personal advice.

**EAV Slots:**
- Solana → annualised volatility → TO-RESEARCH (%)
- Solana → largest one-day move → TO-RESEARCH (%, date)

**Micro-Intent Questions:**
- Is it a good time to buy Solana?
- What are the risks of Solana?

### 10. Solana vs Ethereum and XRP
**Priority:** P2 — Secondary
**Dimension:** Comparative
**Sub-query:** "Is Solana a better investment than Ethereum or XRP?"
**Expected format:** comparison table
**User Journey Stage:** Evaluation
**Demand:** xrp vs solana 2030 forecast 300 · bitcoin ethereum solana price prediction 2026 400
**Content Angle:** Compare forecast change to 2030 and volatility across Solana, XRP and Bitcoin pages using site data; link to each.

**EAV Slots:**
- Solana → 30-day forecast error (MAPE) → TO-RESEARCH (%)
- Solana → annualised volatility → TO-RESEARCH (%)

**Micro-Intent Questions:**
- Will Solana outperform Ethereum?
- Solana or XRP in 2030?
- Which crypto is more volatile?

### 11. How to buy Solana
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I buy Solana?"
**Expected format:** numbered steps
**User Journey Stage:** Implementation
**Demand:** estimated
**Content Angle:** One line and a link.
**Owned by:** a 'how to buy Solana' guide

**EAV Slots:**
- Solana → ways to buy → TO-RESEARCH (list)

**Micro-Intent Questions:**
- Where can I buy Solana?

### 12. How to stake Solana
**Priority:** P3 — Adjacent
**Dimension:** Procedural
**Sub-query:** "How do I stake SOL?"
**Expected format:** dated claim
**User Journey Stage:** Research
**Demand:** estimated
**Content Angle:** Not written here; one-line mention at most.
**Owned by:** a 'how to buy and stake Solana' guide

**EAV Slots:**
- Solana → named predictions → TO-RESEARCH (quote, date, source)

**Micro-Intent Questions:**
- How do I stake SOL?

## Scope Decision
**This page owns:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
**Linked out, not written:** 11 → a, 12 → a
**The next question:** "How do I buy Solana?" → the 'how to buy Solana' guide (planned).

## Dimension Coverage
| Dimension | Count | IDs |
|---|---|---|
| Definitional | 1 | 8 |
| Comparative | 2 | 7, 10 |
| Procedural | 2 | 11, 12 |
| Contextual | 1 | 5 |
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
Key entities: Solana (SOL/USD); Solana network; Ethereum; Spot crypto ETFs; Forecast models; Technical indicators.

Facts to source first: model outputs (computed daily by the pipeline), measured MAPE (pipeline), current technical summary (pipeline). No external fact blocks publication; analyst targets stay hidden until sourced.
