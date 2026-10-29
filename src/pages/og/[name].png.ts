// Open Graph images, 1200×630: /og/default.png and /og/<asset-slug>.png (with today's numbers).
import type { APIRoute, GetStaticPaths } from 'astro';
import { assets, unitLabel } from '../../lib/assets';
import { headings } from '../../lib/assetContent';
import { assetData, consensusAt, type AssetId } from '../../lib/data';
import { date, money, percent } from '../../lib/format';
import { COLORS as C, h, png, pngResponse } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = () => [
  { params: { name: 'default' }, props: { asset: null } },
  ...assets.filter((a) => a.enabled).map((a) => ({ params: { name: a.slug }, props: { asset: a } })),
];

const frame = (...children: ReturnType<typeof h>[]) =>
  // satori sizes boxes as content-box: 1200×630 minus the 72/56 px padding on each side.
  h('div', { width: 1056, height: 518, flexDirection: 'column', justifyContent: 'space-between', padding: '56px 72px', background: C.navy, color: C.cream, fontFamily: 'Inter' },
    h('div', { alignItems: 'center', justifyContent: 'space-between' },
      h('div', { fontFamily: 'Serif', fontSize: 40, letterSpacing: -1 }, 'FinForecast'),
      h('div', { width: 96, height: 6, background: C.accent }),
    ),
    ...children,
  );

const stat = (label: string, value: string, sub?: { text: string; color: string }) =>
  h('div', { flexDirection: 'column', gap: 6, paddingRight: 48, marginRight: 48, borderRight: `1px solid ${C.navy700}` },
    h('div', { fontSize: 22, color: C.muted }, label),
    h('div', { fontFamily: 'Serif', fontSize: 52 }, value),
    ...(sub ? [h('div', { fontSize: 22, fontWeight: 500, color: sub.color }, sub.text)] : []),
  );

export const GET: APIRoute = async ({ props }) => {
  const asset = props.asset as (typeof assets)[number] | null;
  if (!asset) {
    return pngResponse(await png(frame(
      h('div', { flexDirection: 'column', gap: 20 },
        h('div', { fontFamily: 'Serif', fontSize: 76, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }, 'Price predictions for silver, gold and bitcoin'),
        h('div', { fontSize: 28, color: C.gray }, 'Daily, monthly and 10-year forecasts from three statistical models'),
      ),
      h('div', { fontSize: 22, color: C.muted }, 'Updated every day · Not financial advice'),
    ), 1200, 630));
  }

  const { forecast: fc } = assetData(asset.id as AssetId);
  const today = fc.last_close.price;
  const runYear = new Date(fc.run_date).getUTCFullYear();
  const lastYear = Number(fc.monthly.at(-1)!.month.slice(0, 4));
  const H = headings(asset, { run: runYear, last: lastYear });
  const in30 = consensusAt(fc, 'daily-end');
  const far = consensusAt(fc, lastYear);
  const sub = (v: number | null) => {
    const ch = v == null ? 0 : v / today - 1;
    // the OG fonts have no ▲/▼ glyphs; the sign of the percentage carries the direction
    return { text: `${percent(ch)} vs today`, color: ch >= 0 ? C.up : C.down };
  };
  return pngResponse(await png(frame(
    h('div', { flexDirection: 'column', gap: 12 },
      h('div', { fontFamily: 'Serif', fontSize: 76, lineHeight: 1.05, letterSpacing: -2 }, H.og),
      h('div', { fontSize: 30, color: C.gray }, `${asset.code} · daily forecast · ${runYear}–${lastYear} · technical analysis`),
    ),
    h('div', { alignItems: 'flex-start' },
      stat('Latest close', money(today)),
      stat('In 30 days', money(in30), sub(in30)),
      h('div', { flexDirection: 'column', gap: 6 },
        h('div', { fontSize: 22, color: C.muted }, `December ${lastYear}`),
        h('div', { fontFamily: 'Serif', fontSize: 52 }, money(far)),
        h('div', { fontSize: 22, fontWeight: 500, color: sub(far).color }, sub(far).text),
      ),
    ),
    h('div', { fontSize: 22, color: C.muted }, `Updated ${date(fc.run_date)} · USD ${unitLabel(asset)} · Not financial advice`),
  ), 1200, 630));
};
