// Asset list from config/assets.yml: the same file the pipeline reads, so the two never drift.
import { parse } from 'yaml';
import raw from '../../config/assets.yml?raw';

export interface AssetConfig {
  id: string;
  name: string;
  symbol: string;
  slug: string;
  unit: string;
  currency: string;
  calendar: 'fx' | 'crypto' | 'nyse';
  chart_color: string;
  enabled: boolean;
}

export const GROUPS: Record<string, string> = { silver: 'Metals', gold: 'Metals', bitcoin: 'Crypto' };

export const assets: AssetConfig[] = parse(raw);

export function assetUrl(a: AssetConfig): string {
  return `/${a.slug}/`;
}

export function unitShort(a: AssetConfig): string {
  return a.unit === 'troy ounce' ? '/oz' : '';
}
