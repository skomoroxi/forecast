// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// The production domain is not decided yet. SITE_URL is the single place to change it:
// canonicals, sitemap, OG URLs and JSON-LD all derive from `site`.
const SITE_URL = process.env.SITE_URL ?? 'https://finforecast.pages.dev';

// Pages whose content changes with every daily data update get the build time as <lastmod>.
/** @type {{ slug: string, enabled: boolean }[]} */
const assets = parse(readFileSync(new URL('./config/assets.yml', import.meta.url), 'utf-8'));
const DAILY = new Set(['/', '/methodology/', ...assets.filter((a) => a.enabled).map((a) => `/${a.slug}/`)]);
const buildTime = new Date().toISOString();

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  // ~30 KB of CSS in total: inlining it removes the render-blocking stylesheet requests.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide/') && !page.includes('/404'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        return DAILY.has(path) ? { ...item, lastmod: buildTime } : item;
      },
    }),
  ],
});
