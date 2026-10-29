// robots.txt follows the same switch as the robots meta tag: closed until INDEXING=on (launch, M6).
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const open = import.meta.env.INDEXING === 'on';
  const body = open
    ? `User-agent: *\nAllow: /\nDisallow: /styleguide/\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
    : `# Pre-launch: nothing is indexed until the production domain is set (INDEXING=on).\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
