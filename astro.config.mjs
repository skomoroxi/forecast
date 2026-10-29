// @ts-check
import { defineConfig } from 'astro/config';

// The production domain is not decided yet. SITE_URL is the single place to change it:
// canonicals, sitemap, OG URLs and JSON-LD all derive from `site`.
const SITE_URL = process.env.SITE_URL ?? 'https://finforecast.pages.dev';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
});
