// Turn forecast.json / ta.json into DataTable columns and rows.
import type { Column, Cell } from '../components/DataTable.astro';
import type { Forecast, Timeframe } from './data';
import { METHOD_LABEL } from './data';
import { ACTION_LABEL, arrow, direction, money, month, number, percent, shortDay } from './format';

type Row = Record<string, string | Cell>;

const METHODS = ['arima', 'reversion', 'montecarlo'] as const;

function vsToday(v: number | undefined, today: number): Cell {
  if (v == null) return { text: '—' };
  const ch = v / today - 1;
  const d = direction(ch);
  return { text: `${arrow(ch)} ${percent(ch)}`, tone: d === 'flat' ? 'muted' : d };
}

export function dailyTable(fc: Forecast): { columns: Column[]; rows: Row[] } {
  const today = fc.last_close.price;
  const columns: Column[] = [
    { key: 'date', label: 'Date', rowHeader: true },
    ...METHODS.map((m) => ({ key: m, label: METHOD_LABEL[m] })),
    { key: 'consensus', label: 'Consensus' },
    { key: 'range', label: 'Range (P10–P90)' },
    { key: 'change', label: 'vs today' },
  ];
  const rows = fc.daily.map((r) => ({
    date: shortDay(r.date),
    ...Object.fromEntries(METHODS.map((m) => [m, money(r[m])])),
    consensus: { text: money(r.consensus), strong: true },
    range: { text: `${money(r.low)} – ${money(r.high)}`, tone: 'muted' as const },
    change: vsToday(r.consensus, today),
  }));
  return { columns, rows };
}

/** Monthly rows for one year (or all), consensus band plus per-method averages. */
export function monthlyTable(fc: Forecast, year?: number): { columns: Column[]; rows: Row[] } {
  const today = fc.last_close.price;
  const columns: Column[] = [
    { key: 'month', label: 'Month', rowHeader: true },
    { key: 'low', label: 'Low (P10)' },
    { key: 'avg', label: 'Average' },
    { key: 'high', label: 'High (P90)' },
    { key: 'change', label: 'vs today' },
  ];
  const rows = fc.monthly
    .filter((m) => year == null || m.month.startsWith(String(year)))
    .map((m) => ({
      month: month(m.month),
      low: { text: money(m.consensus?.min), tone: 'muted' as const },
      avg: { text: money(m.consensus?.avg), strong: true },
      high: { text: money(m.consensus?.max), tone: 'muted' as const },
      change: vsToday(m.consensus?.avg, today),
    }));
  return { columns, rows };
}

/** Yearly averages per method for 2026–2030 (from monthly) — the "compare the models" table. */
export function yearSummaryTable(fc: Forecast, years: number[]): { columns: Column[]; rows: Row[] } {
  const columns: Column[] = [
    { key: 'year', label: 'Year', rowHeader: true },
    ...METHODS.map((m) => ({ key: m, label: METHOD_LABEL[m] })),
    { key: 'consensus', label: 'Consensus' },
  ];
  const avg = (xs: (number | undefined)[]) => {
    const v = xs.filter((x): x is number => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : undefined;
  };
  const rows = years.map((y) => {
    const ms = fc.monthly.filter((m) => m.month.startsWith(String(y)));
    return {
      year: String(y),
      ...Object.fromEntries(METHODS.map((m) => [m, money(avg(ms.map((x) => x[m]?.avg)))])),
      consensus: { text: money(avg(ms.map((x) => x.consensus?.avg))), strong: true },
    };
  });
  return { columns, rows };
}

export function longTermTable(fc: Forecast): { columns: Column[]; rows: Row[] } {
  const columns: Column[] = [
    { key: 'year', label: 'Year', rowHeader: true },
    { key: 'reversion', label: METHOD_LABEL.reversion },
    { key: 'montecarlo', label: METHOD_LABEL.montecarlo },
    { key: 'consensus', label: 'Consensus' },
    { key: 'band', label: 'Range (P10–P90)' },
  ];
  const rows = fc.yearly.map((y) => ({
    year: String(y.year),
    reversion: money(y.reversion),
    montecarlo: money(y.montecarlo),
    consensus: { text: money(y.consensus), strong: true },
    band: { text: `${money(y.p10)} – ${money(y.p90)}`, tone: 'muted' as const },
  }));
  return { columns, rows };
}

export function accuracyTable(fc: Forecast): { columns: Column[]; rows: Row[] } {
  const columns: Column[] = [
    { key: 'method', label: 'Method', rowHeader: true },
    { key: 'd1', label: '1 day' },
    { key: 'd7', label: '7 days' },
    { key: 'd30', label: '30 days' },
  ];
  const rows = [...METHODS, 'consensus'].filter((m) => fc.accuracy[m]).map((m) => {
    const a = fc.accuracy[m];
    return { method: METHOD_LABEL[m], d1: `${number(a.mape_1d)}%`, d7: `${number(a.mape_7d)}%`, d30: `${number(a.mape_30d)}%` };
  });
  return { columns, rows };
}

const OSC_LABEL: Record<string, string> = {
  rsi_14: 'RSI (14)',
  stoch_9_6: 'STOCH (9,6)',
  stochrsi_14: 'StochRSI (14)',
  macd_12_26: 'MACD (12,26)',
  adx_14: 'ADX (14)',
  williams_r_14: 'Williams %R',
  cci_14: 'CCI (14)',
  atr_14: 'ATR (14)',
  highs_lows_14: 'Highs/Lows (14)',
  ultimate_oscillator: 'Ultimate Oscillator',
  roc_12: 'ROC',
  bull_bear_power_13: 'Bull/Bear Power (13)',
};

function action(a: string | null): Cell {
  if (!a) return { text: '—', tone: 'muted' };
  const tone = a === 'buy' ? 'buy' : a === 'sell' ? 'sell' : 'neutral';
  return { text: ACTION_LABEL[a] ?? a, tone, strong: a === 'buy' || a === 'sell' };
}

export function oscillatorTable(tf: Timeframe): { columns: Column[]; rows: Row[] } {
  return {
    columns: [
      { key: 'name', label: 'Name', rowHeader: true },
      { key: 'value', label: 'Value' },
      { key: 'action', label: 'Action' },
    ],
    rows: tf.oscillators.map((o) => ({ name: OSC_LABEL[o.name] ?? o.name, value: number(o.value), action: action(o.action) })),
  };
}

export function maTable(tf: Timeframe): { columns: Column[]; rows: Row[] } {
  return {
    columns: [
      { key: 'name', label: 'Period', rowHeader: true },
      { key: 'sma', label: 'Simple' },
      { key: 'sma_a', label: '' },
      { key: 'ema', label: 'Exponential' },
      { key: 'ema_a', label: '' },
    ],
    rows: tf.moving_averages.map((m) => ({
      name: `MA${m.period}`,
      sma: number(m.simple.value),
      sma_a: action(m.simple.action),
      ema: number(m.exponential.value),
      ema_a: action(m.exponential.action),
    })),
  };
}

const PIVOT_LABEL: Record<string, string> = { classic: 'Classic', fibonacci: 'Fibonacci', camarilla: 'Camarilla', woodie: "Woodie's", demark: "DeMark's" };

export function pivotTable(tf: Timeframe): { columns: Column[]; rows: Row[] } {
  const keys = ['s3', 's2', 's1', 'p', 'r1', 'r2', 'r3'];
  return {
    columns: [{ key: 'name', label: 'Name', rowHeader: true }, ...keys.map((k) => ({ key: k, label: k === 'p' ? 'Pivot' : k.toUpperCase() }))],
    rows: Object.entries(tf.pivots).map(([name, lv]) => ({
      name: PIVOT_LABEL[name] ?? name,
      ...Object.fromEntries(keys.map((k) => [k, k === 'p' ? { text: number(lv[k]), strong: true } : number(lv[k])])),
    })),
  };
}
