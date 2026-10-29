// JSON-LD builders (TECHNICAL-TASK §8). URLs are absolute from Astro.site (SITE_URL).

export const SITE_NAME = 'FinForecast';
/** First publication of the asset pages (Article.datePublished). */
export const FIRST_PUBLISHED = '2026-10-29';
export const AUTHOR_PATH = '/authors/margerie-holtz/';

const abs = (site: URL, path: string) => new URL(path, site).href;

export function organization(site: URL) {
  return {
    '@type': 'Organization',
    '@id': abs(site, '/#organization'),
    name: SITE_NAME,
    url: abs(site, '/'),
    logo: { '@type': 'ImageObject', url: abs(site, '/logo.png'), width: 512, height: 512 },
  };
}

export function website(site: URL) {
  return {
    '@type': 'WebSite',
    '@id': abs(site, '/#website'),
    name: SITE_NAME,
    url: abs(site, '/'),
    publisher: { '@id': abs(site, '/#organization') },
    inLanguage: 'en',
  };
}

export function author(site: URL) {
  return { '@type': 'Person', '@id': abs(site, `${AUTHOR_PATH}#person`), name: 'Margerie Holtz', url: abs(site, AUTHOR_PATH) };
}

export function breadcrumbs(site: URL, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(site, it.path) })),
  };
}

export function article(site: URL, o: { path: string; headline: string; description: string; modified: string; image: string }) {
  const url = abs(site, o.path);
  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: o.headline,
      description: o.description,
      isPartOf: { '@id': abs(site, '/#website') },
      dateModified: o.modified,
      inLanguage: 'en',
    },
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: o.headline,
      description: o.description,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      image: abs(site, o.image),
      datePublished: FIRST_PUBLISHED,
      dateModified: o.modified,
      author: author(site),
      publisher: { '@id': abs(site, '/#organization') },
    },
  ];
}

export function dataset(site: URL, o: { path: string; name: string; description: string; from: string; to: string; modified: string; asset: string; id: string; unit: string }) {
  return {
    '@type': 'Dataset',
    '@id': abs(site, `${o.path}#dataset`),
    name: o.name,
    description: o.description,
    url: abs(site, o.path),
    temporalCoverage: `${o.from}/${o.to}`,
    dateModified: o.modified,
    creator: { '@id': abs(site, '/#organization') },
    isAccessibleForFree: true,
    keywords: [`${o.asset} price forecast`, `${o.asset} price prediction`, 'ARIMA', 'Monte Carlo', 'mean reversion'],
    variableMeasured: [`${o.asset} price forecast (USD ${o.unit})`, 'P10 and P90 range'],
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: abs(site, `/data/${o.id}/chart.json`) }],
  };
}

/** Wrap nodes into one @graph document. */
export function graph(nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
