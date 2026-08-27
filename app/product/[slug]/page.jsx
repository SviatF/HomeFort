import { notFound } from 'next/navigation';
import Product from '@/screens/Product';
import { getHomefortProductBySlug, getHomefortProducts } from '@/lib/homefort-static';
import { getHomefortFeedCategory } from '@/lib/homefort-feed-static';
import { buildMetadata, breadcrumbSchema, productSchema } from '@/lib/seo';

function normalizeSize(value = '') {
  const match = String(value).toLowerCase().replace(/см/g, '').match(/(\d{2,3})\s*[×хx]\s*(\d{2,3})/);
  return match ? `${match[1]}x${match[2]}` : '';
}

async function getProductData(slug) {
  const product = getHomefortProductBySlug(slug);
  if (!product) return { product: null, related: [], mattresses: [], crossSell: [] };

  const relatedAll = getHomefortProducts(product.category).filter((p) => p.indexable !== false && p.slug !== product.slug);
  const productSizes = new Set((product.sizes || []).map(normalizeSize).filter(Boolean));
  const mattresses = product.category === 'beds'
    ? getHomefortProducts('mattresses')
        .filter((m) => (m.sizes || []).some((size) => productSizes.has(normalizeSize(size))))
        .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
        .slice(0, 2)
    : [];

  return {
    product,
    related: relatedAll
      .sort((a, b) => Math.abs(Number(a.price || 0) - Number(product.price || 0)) - Math.abs(Number(b.price || 0) - Number(product.price || 0)))
      .slice(0, 3),
    mattresses,
    crossSell: [],
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await getProductData(slug);
  if (!product) return { title: 'Товар не знайдено', robots: { index: false, follow: false } };

  const price = Number(product.price_current || product.price || 0);
  const title = product.seoTitle || `${product.name} — купити від ${price.toLocaleString('uk-UA')} ₴ | DOMERA`;
  const description = product.seoDescription || product.shortDescription || product.fullDescription || `${product.name} у DOMERA. Ціна від ${price.toLocaleString('uk-UA')} ₴. Доставка по Україні.`;
  const canonical = product.canonicalUrl || `/product/${product.slug}`;
  const sizeKeywords = (product.sizes || []).slice(0, 6).map((s) => `${product.name} ${s}`);

  return buildMetadata({
    title,
    description,
    canonical,
    image: product.ogImage || product.images?.[0],
    index: product.indexable !== false,
    type: 'website',
    keywords: [product.name, `купити ${product.name.toLowerCase()}`, ...sizeKeywords],
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data.product) notFound();
  const p = data.product;
  const category = getHomefortFeedCategory(p.category);

  const schemas = [
    productSchema(p),
    breadcrumbSchema([
      { name: 'Головна', url: '/' },
      { name: category?.name || 'Каталог', url: `/catalog/${p.category}` },
      { name: p.name, url: `/product/${p.slug}` },
    ]),
  ];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    <Product initialProduct={p} initialRelated={data.related} initialMattresses={data.mattresses} initialCrossSell={data.crossSell} />
  </>;
}
