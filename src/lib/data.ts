// Typed access to the pipeline's JSON files (contract: pipeline/schemas.py).
export interface AnalystEntry {
  id: string; institution: string; type: string;
  target_usd?: number | null; target_low_usd?: number | null; target_high_usd?: number | null;
  basis: 'average' | 'end' | 'peak'; horizon: string; published_on: string;
  source_title: string; source_url: string; note?: string | null; show?: boolean;
}
export interface Analysts { asset: string; reviewed_at: string | null; reviewed_by: string; entries: AnalystEntry[] }

export interface Bar { date: string; open: number; high: number; low: number; close: number; ohlc?: 'proxy' | 'close' }
export interface PriceHistory { asset: string; symbol: string; currency: string; source: string; updated_at: string; bars: Bar[] }

export interface Band { avg: number; min: number; max: number }
export interface DailyRow { date: string; arima?: number; reversion?: number; montecarlo?: number; consensus?: number; low?: number; high?: number }
export interface MonthlyRow { month: string; arima?: Band; reversion?: Band; montecarlo?: Band; consensus?: Band }
export interface YearlyRow { year: number; reversion?: number; montecarlo?: number; consensus?: number; p10?: number; p90?: number }
export interface Accuracy { mape_1d: number; mape_7d: number; mape_30d: number; basis: 'walk-forward' | 'live'; samples: number }
export interface Forecast {
  asset: string; generated_at: string; run_date: string;
  last_close: { date: string; price: number };
  methods: Record<string, { status: 'ok' | 'failed'; error?: string | null; params: Record<string, unknown> }>;
  daily: DailyRow[]; monthly: MonthlyRow[]; yearly: YearlyRow[];
  accuracy: Record<string, Accuracy>;
}

export interface Oscillator { name: string; value: number | null; action: string; signal_line?: number | null; plus_di?: number | null; minus_di?: number | null }
export interface MAValue { value: number | null; action: 'buy' | 'sell' | 'neutral' | null }
export interface Tally { buy: number; sell: number; neutral: number; verdict: string }
export interface Timeframe {
  bar_date: string; close: number; oscillators: Oscillator[];
  moving_averages: { period: number; simple: MAValue; exponential: MAValue }[];
  pivots: Record<string, Record<string, number>>;
  summary: { oscillators: Tally; moving_averages: Tally; overall: Tally };
}
export interface TechnicalAnalysis { asset: string; generated_at: string; run_date: string; ohlc_basis: 'actual' | 'proxy'; timeframes: Record<'daily' | 'weekly' | 'monthly', Timeframe> }

export const METHOD_LABEL: Record<string, string> = {
  arima: 'ARIMA',
  reversion: 'Trend + reversion',
  montecarlo: 'Monte Carlo',
  consensus: 'Consensus',
};

// Every data/<id>/*.json is picked up automatically (Vite glob import), so a new asset needs no code here.
const files = import.meta.glob<{ default: unknown }>('../../data/*/{prices,forecast,ta,analysts}.json', { eager: true });
const file = (id: string, name: string) => files[`../../data/${id}/${name}.json`]?.default;

export type AssetId = string;

export function assetData(id: AssetId) {
  const prices = file(id, 'prices') as PriceHistory | undefined;
  const forecast = file(id, 'forecast') as Forecast | undefined;
  const ta = file(id, 'ta') as TechnicalAnalysis | undefined;
  if (!prices || !forecast || !ta) throw new Error(`data/${id}/: prices.json, forecast.json and ta.json are required`);
  const analysts = (file(id, 'analysts') as Analysts | undefined) ?? { asset: id, reviewed_at: null, reviewed_by: '', entries: [] };
  return { prices, forecast, ta, analysts };
}

/** Largest single-day move and largest peak-to-trough fall in the price history. */
export function extremes(bars: Bar[]) {
  let move = { pct: 0, date: bars[0].date };
  let peak = bars[0];
  let dd = { pct: 0, from: bars[0].date, to: bars[0].date };
  for (let i = 1; i < bars.length; i++) {
    const ch = bars[i].close / bars[i - 1].close - 1;
    if (Math.abs(ch) > Math.abs(move.pct)) move = { pct: ch, date: bars[i].date };
    if (bars[i].close > peak.close) peak = bars[i];
    const fall = bars[i].close / peak.close - 1;
    if (fall < dd.pct) dd = { pct: fall, from: peak.date, to: bars[i].date };
  }
  return { move, drawdown: dd, since: bars[0].date };
}

/** Freshness rules (TECHNICAL-TASK §5.6): hide entries older than 9 months, past horizons,
 *  individuals (they belong on a separate page) and hidden ones. The block needs at least 2. */
export function visibleAnalysts(a: Analysts, runDate: string): AnalystEntry[] {
  const run = new Date(runDate);
  const cutoff = new Date(run);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 9);
  const horizonEnd = (h: string) => {
    const [y, q] = h.split('-Q');
    return new Date(Date.UTC(Number(y), q ? Number(q) * 3 : 12, 0));
  };
  const list = a.entries.filter(
    (e) => e.show !== false && e.type !== 'individual' && new Date(e.published_on) >= cutoff && horizonEnd(e.horizon) >= run,
  );
  return list.length >= 2 ? list.sort((x, y) => x.horizon.localeCompare(y.horizon) || x.institution.localeCompare(y.institution)) : [];
}

/** Change of the last close vs the close `bars` trading days earlier, as a fraction. */
export function changeOver(bars: Bar[], back: number): number | null {
  if (bars.length <= back) return null;
  const last = bars[bars.length - 1].close;
  return last / bars[bars.length - 1 - back].close - 1;
}

/** Change since the last close of the previous calendar year. */
export function yearToDate(bars: Bar[]): number | null {
  const last = bars[bars.length - 1];
  const year = last.date.slice(0, 4);
  const prev = [...bars].reverse().find((b) => b.date.slice(0, 4) < year);
  return prev ? last.close / prev.close - 1 : null;
}

/** The consensus value on the last daily row, the last row of a year, or the yearly table. */
export function consensusAt(fc: Forecast, when: 'daily-end' | number): number | null {
  if (when === 'daily-end') return fc.daily.at(-1)?.consensus ?? null;
  const months = fc.monthly.filter((m) => m.month.startsWith(String(when)));
  if (months.length) return months.at(-1)!.consensus?.avg ?? null;
  return fc.yearly.find((y) => y.year === when)?.consensus ?? null;
}
