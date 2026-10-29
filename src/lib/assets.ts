// Asset list from config/assets.yml: the same file the pipeline reads, so the two never drift.
import { parse } from 'yaml';
import raw from '../../config/assets.yml?raw';

export type Group = 'Metals' | 'Crypto' | 'Stocks';

export interface AssetConfig {
  id: string;
  name: string;
  code: string;
  group: Group;
  symbol: string;
  slug: string;
  keywords: string[];
  unit: string;
  currency: string;
  calendar: 'fx' | 'crypto' | 'nyse';
  chart_color: string;
  enabled: boolean;
}

export const GROUP_ORDER: Group[] = ['Metals', 'Crypto', 'Stocks'];
export const GROUP_HEADING: Record<Group, string> = {
  Metals: 'Precious metals price predictions',
  Crypto: 'Cryptocurrency price predictions',
  Stocks: 'Stock price forecasts',
};

export const assets: AssetConfig[] = parse(raw);

export function assetUrl(a: AssetConfig): string {
  return `/${a.slug}/`;
}

/** "per troy ounce", "per coin", "per share" */
export function unitLabel(a: AssetConfig): string {
  return `per ${a.unit}`;
}

/** short suffix after a price: "/oz", "/share" or nothing for coins */
export function unitShort(a: AssetConfig): string {
  return a.unit === 'troy ounce' ? '/oz' : a.unit === 'share' ? '/share' : '';
}

/** How the asset reads inside a sentence: "silver", "Bitcoin", "Nvidia stock". */
export function subject(a: AssetConfig): string {
  if (a.group === 'Metals') return a.name.toLowerCase();
  if (a.group === 'Stocks') return `${a.name} stock`;
  return a.name;
}

/** "price" or "stock price" */
export function noun(a: AssetConfig): string {
  return a.group === 'Stocks' ? 'stock price' : 'price';
}

/** Note under the daily table about which days are forecast. */
export function calendarNote(a: AssetConfig): string {
  if (a.calendar === 'crypto') return 'Crypto trades every day, so weekends are included.';
  if (a.calendar === 'nyse') return 'US trading days only (weekends skipped; exchange holidays are not yet excluded).';
  return 'Weekends are skipped: the spot market is closed.';
}

export function hero(a: AssetConfig): string {
  if (a.id === 'gold') return '/images/gold-bars.svg';
  if (a.group === 'Crypto') return '/images/crypto-coin.svg';
  if (a.group === 'Stocks') return '/images/stock-chart.svg';
  return '/images/silver-bars.svg';
}
