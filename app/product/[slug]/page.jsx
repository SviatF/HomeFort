import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import BedProduct from '@/screens/BedProduct';
import VariantProduct from '@/screens/VariantProduct';
import BundleOfferPortal from '@/components/domera/BundleOfferPortal';
import { getHomefortBundleOffersForProduct, getHomefortLiveProductBySlug, getHomefortLiveProducts } from '@/lib/homefort-feed-live';
import { getHomefortFeedCategory } from '@/lib/homefort-feed-static';
import { buildMetadata, breadcrumbSchema, productSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function decodedSlug(value = '') {
  try {
    return decodeURIComponent(String(value));
  } catch {
    return String(value);
  }
}

const getProductData = cache(async (slug) => {
  const product = await getHomefortLiveProductBySlug(slug);
  if (!product) return { product: null, related: [], offers: [] };

  const relatedAll = (await getHomefortLiveProducts(product.category))
    .filter((item) => item.indexable !== false && item.slug !== product.slug);
  const offers = product.category === 'beds' ? await getHomefortBundleOffersForProduct(product.slug) : [];

  return {
    product,
    offers,
    related: relatedAll
      .sort((a, b) => Math.abs(Number(a.price || 0) - Number(product.price || 0)) - Math.abs(Number(b.price || 0) - Number(product.price || 0)))
      .slice(0, 3),
  };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await getProductData(slug);
  if (!product) return { title: 'Товар не знайдено', robots: { index: false, follow: false } };

  const price = Number(product.price_current || product.price || 0);
  const title = product.seoTitle || `${product.name} — купити від ${price.toLocaleString('uk-UA')} ₴ | DOMERA`;
  const description = product.seoDescription || product.shortDescription || `${product.name} у DOMERA. Доступні розміри та актуальні ціни.`;
  const canonical = product.canonicalUrl || `/product/${product.slug}`;
  const sizeKeywords = (product.sizes || []).slice(0, 8).map((size) => `${product.name} ${size}`);

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

  const requestedSlug = decodedSlug(slug);
  if (data.product.slug && data.product.slug !== requestedSlug) redirect(`/product/${data.product.slug}`);

  const product = data.product;
  const category = getHomefortFeedCategory(product.category);
  const categoryName = category?.name || 'Каталог';
  const categoryUrl = category?.canonicalUrl || `/catalog/${product.category}`;
  const schemas = [
    productSchema(product),
    breadcrumbSchema([
      { name: 'Головна', url: '/' },
      { name: categoryName, url: categoryUrl },
      { name: product.name, url: `/product/${product.slug}` },
    ]),
  ];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    {product.category === 'beds'
      ? <><BedProduct initialProduct={product} initialRelated={data.related} /><BundleOfferPortal offers={data.offers} /></>
      : <VariantProduct initialProduct={product} initialRelated={data.related} />}
  </>;
}
