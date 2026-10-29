// Static chart data, fetched lazily by PriceChart: keeps the full history out of the page HTML.
import type { APIRoute, GetStaticPaths } from 'astro';
import { assets } from '../../../lib/assets';
import { assetData, type AssetId } from '../../../lib/data';

export const getStaticPaths: GetStaticPaths = () =>
  assets.filter((a) => a.enabled).map((a) => ({ params: { asset: a.id } }));

export const GET: APIRoute = ({ params }) => {
  const { prices, forecast } = assetData(params.asset as AssetId);
  // Daily table for the first month, then mid-month averages through 2030.
  const lastDaily = forecast.daily.at(-1)?.date ?? '';
  const monthly = forecast.monthly
    .map((m) => ({ date: `${m.month}-15`, m }))
    .filter(({ date }) => date > lastDaily);
  const series = (key: 'arima' | 'reversion' | 'montecarlo' | 'consensus') => [
    ...forecast.daily.map((r) => [r.date, r[key]] as const),
    ...monthly.map(({ date, m }) => [date, m[key]?.avg] as const),
  ].filter(([, v]) => v != null);
  const body = {
    history: prices.bars.map((b) => [b.date, +b.close.toFixed(3)]),
    forecast: {
      arima: series('arima'),
      reversion: series('reversion'),
      montecarlo: series('montecarlo'),
      consensus: series('consensus'),
      low: [...forecast.daily.map((r) => [r.date, r.low]), ...monthly.map(({ date, m }) => [date, m.consensus?.min])],
      high: [...forecast.daily.map((r) => [r.date, r.high]), ...monthly.map(({ date, m }) => [date, m.consensus?.max])],
    },
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
};
