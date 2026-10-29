// Generated page text (TECHNICAL-TASK §5.5). Every number comes from forecast.json / ta.json.
// Each sentence has several variants; the choice is a hash of (asset, run date, block), so text
// changes from day to day but is stable within a day. Tone: neutral and conditional, never advice.
import type { Forecast, MonthlyRow, TechnicalAnalysis, Bar } from './data';
import { consensusAt } from './data';
import { date, money, month, number, VERDICT_LABEL } from './format';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export class Writer {
  constructor(private fc: Forecast, private ta: TechnicalAnalysis, private name: string) {}

  private pick<T>(block: string, options: T[]): T {
    return options[hash(`${this.fc.asset}|${this.fc.run_date}|${block}`) % options.length];
  }

  get today(): number {
    return this.fc.last_close.price;
  }

  get runYear(): number {
    return new Date(this.fc.run_date).getUTCFullYear();
  }

  /** First forecast date after the run date (the run date's own close is still to come). */
  nextDay() {
    return this.fc.daily.find((r) => r.date > this.fc.run_date) ?? this.fc.daily[0];
  }

  /** "rise about 3.2%" / "fall about 3.2%" / "stay close to today's level" */
  move(target: number | null | undefined, verb: 'future' | 'past' = 'future'): string {
    if (target == null) return 'move';
    const ch = target / this.today - 1;
    const pct = `${number(Math.abs(ch) * 100)}%`;
    if (Math.abs(ch) < 0.01) return verb === 'future' ? "stay close to today's level" : 'stayed close to its level';
    return ch > 0 ? `rise about ${pct}` : `fall about ${pct}`;
  }

  private change(target: number | null | undefined): string {
    if (target == null) return '';
    const ch = target / this.today - 1;
    return `${ch >= 0 ? '+' : '−'}${number(Math.abs(ch) * 100)}%`;
  }

  private yearRows(year: number): MonthlyRow[] {
    return this.fc.monthly.filter((m) => m.month.startsWith(String(year)) && m.consensus);
  }

  yearAverage(year: number): number | null {
    const rows = this.yearRows(year);
    return rows.length ? rows.reduce((a, m) => a + m.consensus!.avg, 0) / rows.length : null;
  }

  /** Hero intro: two short paragraphs. */
  intro(): string[] {
    const n = this.name;
    return [
      this.pick('intro1', [
        `Daily ${n.toLowerCase()} price forecasts for the next 30 days, monthly averages for every month to December 2030 and a yearly outlook to 2035, from three independent statistical models.`,
        `This page forecasts the ${n.toLowerCase()} price for the next 30 days, for every month through 2030 and for each year to 2035, using three different statistical models and their consensus.`,
      ]),
      this.pick('intro2', [
        `The forecasts, the technical analysis and this text are recalculated automatically every day from the latest closing price.`,
        `Everything on this page is recalculated every day after the market close, so the numbers always start from the latest price.`,
      ]),
    ];
  }

  /** BLUF summary above the fold. */
  summary(): string {
    const in30 = consensusAt(this.fc, 'daily-end');
    const end = consensusAt(this.fc, 2026);
    const y2030 = consensusAt(this.fc, 2030);
    const verdict = VERDICT_LABEL[this.ta.timeframes.daily.summary.overall.verdict];
    const n = this.name;
    return this.pick('summary', [
      `${n} closed at ${money(this.today)} per ounce. The model consensus expects ${money(in30)} in 30 days, ${money(end)} at the end of 2026 and ${money(y2030)} by December 2030. Today's daily technical signal is ${verdict}.`,
      `From today's close of ${money(this.today)}, the three models together point to ${money(in30)} in a month, ${money(end)} by the end of 2026 and ${money(y2030)} in December 2030. The daily technical summary reads ${verdict}.`,
    ]);
  }

  /** 30-day trend paragraph. */
  next30(): string[] {
    const d = this.fc.daily;
    const last = d.at(-1)!;
    const peak = d.reduce((a, r) => ((r.consensus ?? 0) > (a.consensus ?? 0) ? r : a), d[0]);
    const n = this.name.toLowerCase();
    return [
      this.pick('d30a', [
        `Over the next 30 days the consensus expects ${n} to ${this.move(last.consensus)}, to about ${money(last.consensus)} on ${month(last.date.slice(0, 7)).split(' ')[0]} ${Number(last.date.slice(8))}.`,
        `By ${month(last.date.slice(0, 7)).split(' ')[0]} ${Number(last.date.slice(8))}, the average of the three models puts ${n} at ${money(last.consensus)}, so the price would ${this.move(last.consensus)} from today.`,
      ]),
      this.pick('d30b', [
        `The 80% range for that day is ${money(last.low)} to ${money(last.high)}: daily moves of a few percent are normal for ${n}, so treat single-day values as a guide to direction rather than exact prices.`,
        `There is real uncertainty even a month ahead: 80% of model outcomes for that day fall between ${money(last.low)} and ${money(last.high)}.`,
      ]),
      `The highest consensus value in this window is ${money(peak.consensus)}.`,
    ];
  }

  /** Paragraphs for one calendar year of the monthly table. */
  year(year: number): string[] {
    const rows = this.yearRows(year);
    if (!rows.length) return [];
    const avg = this.yearAverage(year)!;
    const hi = rows.reduce((a, m) => (m.consensus!.avg > a.consensus!.avg ? m : a));
    const lo = rows.reduce((a, m) => (m.consensus!.avg < a.consensus!.avg ? m : a));
    const low = Math.min(...rows.map((m) => m.consensus!.min));
    const high = Math.max(...rows.map((m) => m.consensus!.max));
    const dec = rows.at(-1)!;
    const per = (k: 'arima' | 'reversion' | 'montecarlo') => {
      const v = rows.filter((m) => m[k]).map((m) => m[k]!.avg);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const n = this.name.toLowerCase();
    const partial = rows.length < 12;
    const period = partial ? `the rest of ${year}` : String(year);
    return [
      this.pick(`y${year}a`, [
        `For ${period}, the consensus averages <strong>${money(avg)}</strong> per ounce, ${this.change(avg)} versus today. The strongest month is ${month(hi.month)} at ${money(hi.consensus!.avg)}; the weakest is ${month(lo.month)} at ${money(lo.consensus!.avg)}.`,
        `The models expect ${n} to average <strong>${money(avg)}</strong> over ${period} (${this.change(avg)} from today), with monthly averages between ${money(lo.consensus!.avg)} in ${month(lo.month)} and ${money(hi.consensus!.avg)} in ${month(hi.month)}.`,
      ]),
      this.pick(`y${year}b`, [
        `The three methods disagree by design: ARIMA averages ${money(per('arima'))}, trend + reversion ${money(per('reversion'))} and Monte Carlo ${money(per('montecarlo'))}. The 80% range across ${period} runs from ${money(low)} to ${money(high)}.`,
        `By method, the averages for ${period} are ${money(per('arima'))} (ARIMA), ${money(per('reversion'))} (trend + reversion) and ${money(per('montecarlo'))} (Monte Carlo); 80% of outcomes fall between ${money(low)} and ${money(high)}.`,
      ]),
      `December ${year} consensus: <strong>${money(dec.consensus!.avg)}</strong>.`,
    ];
  }

  /** 2031–2035 outlook. */
  longTerm(): string[] {
    const y = this.fc.yearly;
    if (!y.length) return [];
    const first = y[0];
    const last = y.at(-1)!;
    return [
      this.pick('lt1', [
        `Beyond 2030 the forecast uses only the two long-run models. Their consensus moves from ${money(first.consensus)} in ${first.year} to ${money(last.consensus)} in ${last.year}.`,
        `For ${first.year}–${last.year} only trend + reversion and Monte Carlo are used; together they average ${money(first.consensus)} in ${first.year} and ${money(last.consensus)} in ${last.year}.`,
      ]),
      `The models pull in opposite directions: trend + reversion expects ${money(last.reversion)} by ${last.year}, Monte Carlo ${money(last.montecarlo)}. The 80% band for ${last.year} is extremely wide, ${money(last.p10)} to ${money(last.p90)}, which is the honest answer to "where will ${this.name.toLowerCase()} be in 10 years": nobody knows precisely.`,
    ];
  }

  /** Technical analysis interpretation. */
  technical(): string {
    const t = this.ta.timeframes;
    const d = t.daily;
    const rsi = d.oscillators.find((o) => o.name === 'rsi_14');
    const v = (k: 'daily' | 'weekly' | 'monthly') => VERDICT_LABEL[t[k].summary.overall.verdict];
    const ma200 = d.moving_averages.find((m) => m.period === 200)?.simple;
    const ma200Text = ma200?.value
      ? ` The price is ${d.close > ma200.value ? 'above' : 'below'} its 200-day moving average (${money(ma200.value)}).`
      : '';
    return (
      this.pick('ta', [
        `Technical indicators read ${v('daily')} on the daily chart, ${v('weekly')} on the weekly and ${v('monthly')} on the monthly.`,
        `The technical summary is ${v('daily')} for the daily timeframe, ${v('weekly')} for weekly and ${v('monthly')} for monthly.`,
      ]) +
      (rsi?.value != null ? ` The 14-day RSI stands at ${number(rsi.value)}.` : '') +
      ma200Text +
      ' Technical signals describe the recent trend; they are not a forecast of where the price will be.'
    );
  }

  /** Short accuracy statement for the methodology block and FAQ. */
  accuracy(): string {
    const c = this.fc.accuracy.consensus;
    if (!c) return '';
    const basis = c.basis === 'live' ? `over ${c.samples} published forecasts` : `in a test on ${c.samples} past dates`;
    return `On average, ${basis}, the consensus missed the actual price by ${number(c.mape_1d)}% one day ahead, ${number(c.mape_7d)}% one week ahead and ${number(c.mape_30d)}% 30 days ahead.`;
  }

  faq(): { q: string; a: string }[] {
    const n = this.name.toLowerCase();
    const N = this.name;
    const in30 = consensusAt(this.fc, 'daily-end');
    const end = consensusAt(this.fc, this.runYear);
    const y2030 = consensusAt(this.fc, 2030);
    const y2035 = this.fc.yearly.at(-1);
    const year2030 = this.fc.monthly.filter((m) => m.month.startsWith('2030'));
    const p90in2030 = Math.max(...year2030.map((m) => m.consensus?.max ?? 0));
    const tomorrow = this.nextDay();
    const verdict = VERDICT_LABEL[this.ta.timeframes.daily.summary.overall.verdict];
    return [
      { q: `What is the ${n} price forecast for ${this.runYear}?`, a: `The model consensus expects ${n} to average ${money(end)} per troy ounce in December ${this.runYear}, ${this.change(end)} versus the latest close of ${money(this.today)}.` },
      { q: `What will the ${n} price be tomorrow?`, a: `For ${date(tomorrow.date, { weekday: 'long', month: 'long', day: 'numeric' })}, the consensus is ${money(tomorrow.consensus)}, with an 80% range of ${money(tomorrow.low)} to ${money(tomorrow.high)}. Day-to-day moves are mostly noise, so the range matters more than the point value.` },
      { q: `What will ${n} be worth next month?`, a: `In 30 days the consensus is ${money(in30)}, a ${this.change(in30)} change from the latest close.` },
      { q: `How much will ${n} be worth in 2030?`, a: `The consensus for December 2030 is ${money(y2030)}. The three models range from flat (ARIMA) to falling back toward the long-run trend (trend + reversion) to continuing the 10-year growth rate (Monte Carlo).` },
      { q: `Will ${n} reach $100 by 2030?`, a: p90in2030 >= 100 ? `It is possible but not the central case: the 2030 consensus is ${money(y2030)}, while the upper end of the 80% range reaches ${money(p90in2030)}. Only the most optimistic model paths get to $100.` : `Not in the central scenario: the 2030 consensus is ${money(y2030)} and even the upper end of the 80% range stays at ${money(p90in2030)}.` },
      { q: `How much will ${n} be worth in 10 years?`, a: y2035 ? `For ${y2035.year} the long-run models average ${money(y2035.consensus)}, but 80% of outcomes fall anywhere between ${money(y2035.p10)} and ${money(y2035.p90)}. Ten-year forecasts carry very large uncertainty.` : `The outlook beyond 2030 is not available today.` },
      { q: `Is ${n} a buy or sell right now?`, a: `The daily technical summary currently reads ${verdict}. That describes the recent trend only. FinForecast does not give investment advice; consider your own goals and risk before buying or selling.` },
      { q: `How accurate are these ${n} predictions?`, a: `${this.accuracy()} ${N} is volatile, so errors grow quickly with the horizon.` },
    ];
  }
}

/** Yearly history rows from daily bars (average, high, low, change over the year). */
export function yearlyHistory(bars: Bar[], years: number) {
  const by = new Map<string, Bar[]>();
  for (const b of bars) {
    const y = b.date.slice(0, 4);
    if (!by.has(y)) by.set(y, []);
    by.get(y)!.push(b);
  }
  const keys = [...by.keys()].sort();
  return keys
    .slice(-years)
    .reverse()
    .map((y) => {
      const list = by.get(y)!;
      const prevYear = by.get(String(Number(y) - 1));
      const start = prevYear ? prevYear.at(-1)!.close : list[0].close;
      return {
        year: y,
        avg: list.reduce((a, b) => a + b.close, 0) / list.length,
        high: Math.max(...list.map((b) => b.close)),
        low: Math.min(...list.map((b) => b.close)),
        change: list.at(-1)!.close / start - 1,
        partial: list.at(-1)!.date.slice(5) < '12-24',
      };
    });
}
