const DEFAULT_BASE = 'https://domera.shop';

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE).replace(/\/$/, '');
export const absoluteUrl = (value = '/') => /^https?:\/\//i.test(value) ? value : `${siteUrl()}${value.startsWith('/') ? value : `/${value}`}`;
export const stripText = (value = '', max = 160) => String(value).replace(/\s+/g, ' ').trim().slice(0, max);

export function buildMetadata({ title, description, canonical = '/', image, index = true, type = 'website', keywords = [] }) {
  const url = absoluteUrl(canonical);
  const cleanDescription = stripText(description, 180);
  return {
    title,
    description: cleanDescription,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: url, languages: { 'uk-UA': url, 'x-default': url } },
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    openGraph: {
      title,
      description: cleanDescription,
      url,
      siteName: 'DOMERA',
      locale: 'uk_UA',
      type,
      images: image ? [{ url: absoluteUrl(image), alt: title }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: cleanDescription,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}

export function breadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function productSchema(p) {
  const availability = p.availability === 'in_stock' ? 'https://schema.org/InStock' : p.availability === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/PreOrder';
  const offer = {
    '@type': 'Offer',
    url: absoluteUrl(`/product/${p.slug}`),
    priceCurrency: 'UAH',
    price: Number(p.price || 0),
    availability,
    itemCondition: 'https://schema.org/NewCondition',
  };
  if (p.oldPrice > p.price) offer.priceSpecification = { '@type': 'UnitPriceSpecification', price: Number(p.price), priceCurrency: 'UAH' };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${absoluteUrl(`/product/${p.slug}`)}#product`,
    name: p.name,
    url: absoluteUrl(`/product/${p.slug}`),
    image: (p.images || []).filter(Boolean).map(absoluteUrl),
    description: stripText(p.fullDescription || p.shortDescription || p.seoDescription || '', 5000),
    sku: p.sku || undefined,
    mpn: p.sku || undefined,
    category: p.category || undefined,
    brand: { '@type': 'Brand', name: 'DOMERA' },
    offers: offer,
    aggregateRating: Number(p.reviewsCount) > 0 ? { '@type': 'AggregateRating', ratingValue: Number(p.rating || 5), reviewCount: Number(p.reviewsCount) } : undefined,
  };
}

export function collectionSchema({ name, description, url, products = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(url)}#collection`,
    name,
    description: stripText(description, 500),
    url: absoluteUrl(url),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/product/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

export function websiteSchema() {
  const base = siteUrl();
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: 'DOMERA',
      url: base,
      description: 'Український бренд ліжок, матраців та текстилю для спальні.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      url: base,
      name: 'DOMERA',
      inLanguage: 'uk-UA',
      publisher: { '@id': `${base}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${base}/catalog/beds?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}
