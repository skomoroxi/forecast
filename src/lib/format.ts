// Number and date formatting via Intl, ready for the 10-language version (TECHNICAL-TASK §10).

export const LOCALE = 'en-US';

const usd = (digits: number) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
const usd0 = usd(0);
const usd2 = usd(2);
const usd3 = usd(3);
const usd4 = usd(4);
const num2 = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat(LOCALE, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' });

/** Precision follows the price level: $81,344 · $254.60 · $1.326 · $0.0798 */
export function money(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  const a = Math.abs(v);
  return (a >= 1000 ? usd0 : a >= 10 ? usd2 : a >= 1 ? usd3 : usd4).format(v);
}

/** Round figures without trailing zeros: $500 · $0.20 · $0.005 */
export function moneyRound(v: number): string {
  // keep at least two decimals below $1 ($0.20), drop extra trailing zeros ($0.0050 → $0.005)
  return (v >= 1 ? usd0 : v >= 0.01 ? usd2 : usd4).format(v).replace(/(\.\d\d\d*?)0+$/, '$1');
}

export function number(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '—' : num2.format(v);
}

/** change as a fraction (0.0123 → +1.23%) */
export function percent(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '—' : pct.format(v);
}

export function direction(v: number | null | undefined): 'up' | 'down' | 'flat' {
  // below 0.005% the value prints as 0.00%, so it gets no arrow or color
  if (v == null || Number.isNaN(v) || Math.abs(v) < 0.00005) return 'flat';
  return v > 0 ? 'up' : 'down';
}

/** ▲ / ▼ so up/down never relies on color alone (DESIGN §6) */
export function arrow(v: number | null | undefined): string {
  const d = direction(v);
  return d === 'up' ? '▲' : d === 'down' ? '▼' : '';
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function dateFormat(opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(opts);
  if (!fmtCache.has(key)) fmtCache.set(key, new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', ...opts }));
  return fmtCache.get(key)!;
}

/** 2026-10-29 → Oct 29, 2026 */
export function date(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
  return dateFormat(opts).format(new Date(iso.length === 7 ? `${iso}-01` : iso));
}

/** 2026-10-29 → Thu, Oct 29 */
export function shortDay(iso: string): string {
  return date(iso, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** 2026-11 → November 2026 */
export function month(ym: string): string {
  return date(ym, { month: 'long', year: 'numeric' });
}

/** ISO datetime → Oct 29, 2026, 01:15 UTC */
export function dateTimeUtc(iso: string): string {
  return `${date(iso, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} UTC`;
}

export const VERDICT_LABEL: Record<string, string> = {
  strong_sell: 'Strong Sell',
  sell: 'Sell',
  neutral: 'Neutral',
  buy: 'Buy',
  strong_buy: 'Strong Buy',
};

export const ACTION_LABEL: Record<string, string> = {
  buy: 'Buy',
  sell: 'Sell',
  neutral: 'Neutral',
  overbought: 'Overbought',
  oversold: 'Oversold',
  high_volatility: 'High volatility',
  low_volatility: 'Low volatility',
};
