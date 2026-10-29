// Typed access to the pipeline's JSON files (contract: pipeline/schemas.py).
import silverPrices from '../../data/silver/prices.json';
import silverForecast from '../../data/silver/forecast.json';
import silverTa from '../../data/silver/ta.json';

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

const ASSETS = {
  silver: {
    prices: silverPrices as PriceHistory,
    forecast: silverForecast as unknown as Forecast,
    ta: silverTa as unknown as TechnicalAnalysis,
  },
};

export type AssetId = keyof typeof ASSETS;

export function assetData(id: AssetId) {
  return ASSETS[id];
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
