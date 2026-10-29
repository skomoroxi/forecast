// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The production domain is not decided yet. SITE_URL is the single place to change it:
// canonicals, sitemap, OG URLs and JSON-LD all derive from `site`.
const SITE_URL = process.env.SITE_URL ?? 'https://finforecast.pages.dev';

// Pages whose content changes with every daily data update get the build time as <lastmod>.
const DAILY = [/^\/$/, /-price-prediction\/$/, /^\/methodology\/$/];
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
        return DAILY.some((re) => re.test(path)) ? { ...item, lastmod: buildTime } : item;
      },
    }),
  ],
});
