// Number and date formatting via Intl, ready for the 10-language version (TECHNICAL-TASK §10).

export const LOCALE = 'en-US';

const usd2 = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd0 = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num2 = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat(LOCALE, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' });

/** $54.25, or $1,234 for values ≥ 1000 */
export function money(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return Math.abs(v) >= 1000 ? usd0.format(v) : usd2.format(v);
}

export function number(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '—' : num2.format(v);
}

/** change as a fraction (0.0123 → +1.23%) */
export function percent(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '—' : pct.format(v);
}

export function direction(v: number | null | undefined): 'up' | 'down' | 'flat' {
  if (v == null || v === 0 || Number.isNaN(v)) return 'flat';
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
