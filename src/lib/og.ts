// Build-time PNG rendering for Open Graph images and the logo (satori → SVG → resvg → PNG).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Builds run from the project root (locally and on Cloudflare Pages).
const font = (pkg: string, file: string) => readFileSync(join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

const FONTS = [
  { name: 'Inter', data: font('inter', 'inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font('inter', 'inter-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Serif', data: font('old-standard-tt', 'old-standard-tt-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];

export const COLORS = { navy: '#181d27', navy700: '#252b37', cream: '#f4efed', gray: '#d5d7da', muted: '#a3a6ab', accent: '#1431cd', up: '#16c47f', down: '#f26161' };

type Node = { type: string; props: { style?: Record<string, unknown>; children?: (Node | string)[] | Node | string } };

/** Tiny hyperscript helper so the layouts read like markup. */
export const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});

export async function png(node: Node, width: number, height: number): Promise<Uint8Array> {
  const svg = await satori(node as never, { width, height, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

export function pngResponse(body: Uint8Array): Response {
  return new Response(Buffer.from(body), { headers: { 'Content-Type': 'image/png' } });
}
