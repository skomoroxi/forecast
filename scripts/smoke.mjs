// Smoke test of the built site (no browser needed): every page exists, carries the key SEO tags
// and valid JSON-LD, the asset page has its tables, and no template leaked "NaN"/"undefined".
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const PAGES = {
  'index.html': { h1: true },
  'silver-price-prediction/index.html': { h1: true, minTables: 15, ld: ['BreadcrumbList', 'Article', 'Dataset', 'FAQPage'] },
  'methodology/index.html': { h1: true, minTables: 2 },
  'about/index.html': { h1: true },
  'authors/margerie-holtz/index.html': { h1: true, ld: ['Person'] },
  'disclaimer/index.html': { h1: true },
  'privacy/index.html': { h1: true },
  '404.html': { h1: true },
};
const FILES = ['robots.txt', 'sitemap-index.xml', 'logo.png', 'og/default.png', 'og/silver-price-prediction.png', 'data/silver/chart.json'];

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

for (const f of FILES) if (!existsSync(join(DIST, f))) fail(f, 'missing');

for (const [page, want] of Object.entries(PAGES)) {
  const path = join(DIST, page);
  if (!existsSync(path)) {
    fail(page, 'missing');
    continue;
  }
  const html = readFileSync(path, 'utf-8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  if (want.h1 && (html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(page, 'expected exactly one <h1>');
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(page, 'missing or short <title>');
  if (!/<link rel="canonical" href="https?:\/\//.test(html)) fail(page, 'missing canonical');
  if (!/<meta name="robots"/.test(html)) fail(page, 'missing robots meta');
  for (const bad of ['NaN', 'undefined', '[object Object]', 'Infinity']) if (new RegExp(`\\b${bad.replace(/[[\]]/g, '\\$&')}`).test(text)) fail(page, `text contains "${bad}"`);
  const tables = (html.match(/<table/g) ?? []).length;
  if (want.minTables && tables < want.minTables) fail(page, `${tables} tables, expected ≥ ${want.minTables}`);
  const types = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const doc = JSON.parse(m[1]);
      for (const n of doc['@graph'] ?? [doc]) types.push(n['@type']);
    } catch {
      fail(page, 'invalid JSON-LD');
    }
  }
  for (const t of want.ld ?? []) if (!types.includes(t)) fail(page, `JSON-LD ${t} missing`);
}

const chart = JSON.parse(readFileSync(join(DIST, 'data/silver/chart.json'), 'utf-8'));
if (chart.history.length < 1000) fail('chart.json', `only ${chart.history.length} history points`);

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ smoke test passed: ${Object.keys(PAGES).length} pages, ${FILES.length} files`);
