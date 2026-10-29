// Smoke test of the built site (no browser needed): every page exists, carries the key SEO tags
// and valid JSON-LD, asset pages have their tables, each asset's top-3 keywords (config/assets.yml)
// appear in its title, H1 and H2s, and no template leaked "NaN"/"undefined".
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const DIST = 'dist';
const assets = parse(readFileSync('config/assets.yml', 'utf-8')).filter((a) => a.enabled);

const PAGES = {
  'index.html': {},
  'methodology/index.html': { minTables: 2 },
  'about/index.html': {},
  'authors/margerie-holtz/index.html': { ld: ['Person'] },
  'disclaimer/index.html': {},
  'privacy/index.html': {},
  '404.html': {},
};
for (const a of assets) {
  PAGES[`${a.slug}/index.html`] = { minTables: 15, ld: ['BreadcrumbList', 'Article', 'Dataset', 'FAQPage'], asset: a };
}
const FILES = ['robots.txt', 'sitemap-index.xml', 'logo.png', 'og/default.png', ...assets.flatMap((a) => [`og/${a.slug}.png`, `data/${a.id}/chart.json`])];

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
// Tokens for keyword matching: lowercase words without stop words, simple plural stripping
// ("predictions" → "prediction").
const STOP = new Set(['for', 'the', 'of', 'in', 'to', 'and', 'a']);
const tokens = (text) =>
  new Set(
    text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w)),
  );
const covers = (text, kw) => {
  const t = tokens(text);
  return [...tokens(kw)].every((w) => t.has(w));
};

for (const f of FILES) if (!existsSync(join(DIST, f))) fail(f, 'missing');

for (const [page, want] of Object.entries(PAGES)) {
  const path = join(DIST, page);
  if (!existsSync(path)) {
    fail(page, 'missing');
    continue;
  }
  const html = readFileSync(path, 'utf-8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));
  const title = strip(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  if (h1s.length !== 1) fail(page, `expected exactly one <h1>, found ${h1s.length}`);
  if (title.length < 10) fail(page, 'missing or short <title>');
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

  if (want.asset) {
    const a = want.asset;
    for (const kw of a.keywords) {
      if (!covers(title, kw)) fail(page, `keyword "${kw}" not in <title> "${title}"`);
      if (!covers(h1s[0] ?? '', kw)) fail(page, `keyword "${kw}" not in <h1> "${h1s[0]}"`);
      if (!h2s.some((h) => covers(h, kw))) fail(page, `keyword "${kw}" not in any <h2>`);
    }
    const both = h2s.filter((h) => h.includes(a.name) && h.includes(a.code));
    if (both.length < 3) fail(page, `only ${both.length} <h2> contain both "${a.name}" and "${a.code}" (want ≥ 3)`);
  }
}

for (const a of assets) {
  const chart = JSON.parse(readFileSync(join(DIST, `data/${a.id}/chart.json`), 'utf-8'));
  if (chart.history.length < 500) fail(`chart.json ${a.id}`, `only ${chart.history.length} history points`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ smoke test passed: ${Object.keys(PAGES).length} pages (${assets.length} assets, keywords checked), ${FILES.length} files`);
