// 512×512 raster logo for Organization JSON-LD (search engines prefer PNG over SVG).
import type { APIRoute } from 'astro';
import { COLORS as C, h, png, pngResponse } from '../lib/og';

export const GET: APIRoute = async () =>
  pngResponse(await png(
    h('div', { width: 512, height: 512, alignItems: 'center', justifyContent: 'center', background: C.navy, borderRadius: 80 },
      h('div', { fontFamily: 'Serif', fontSize: 280, lineHeight: 1, color: C.cream, letterSpacing: -16, marginTop: 40 }, 'FF'),
    ),
    512, 512,
  ));
