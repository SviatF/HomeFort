import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import BedProduct from '@/screens/BedProduct';
import VariantProduct from '@/screens/VariantProduct';
import BundleOfferPortal from '@/components/domera/BundleOfferPortal';
import ConversionSuitePortal from '@/components/domera/ConversionSuitePortal';
import PdpConversionRailPortal from '@/components/domera/PdpConversionRailPortal';
import { getHomefortBundleOffersForProduct, getHomefortLiveProductBySlug, getHomefortLiveProducts } from '@/lib/homefort-feed-live';
import { getHomefortFeedCategory } from '@/lib/homefort-feed-static';
import { compactCatalogProduct } from '@/lib/catalog-compact';
import { buildMetadata, breadcrumbSchema, productSchema } from '@/lib/seo';

export const dynamic = 'force-static';
export const revalidate = 3600;

const CRO_CATEGORY_MATRIX = {
  beds: ['mattresses', 'toppers', 'pillows', 'duvets'],
  mattresses: ['beds', 'toppers', 'pillows', 'duvets'],
  toppers: ['mattresses', 'pillows', 'duvets'],
  pillows: ['duvets', 'toppers', 'mattresses'],
  duvets: ['pillows', 'toppers', 'mattresses'],
};

function decodedSlug(value = '') {
  try {
    return decodeURIComponent(String(value));
  } catch {
    return String(value);
  }
}

function overlapScore(source = {}, candidate = {}) {
  const sourceSizes = new Set((source.sizes || []).map(String));
  return (candidate.sizes || []).reduce((score, size) => score + (sourceSizes.has(String(size)) ? 1 : 0), 0);
}

function compactRecommendation(product = {}) {
  const bySize = new Map();
  const variants = Array.isArray(product.variants) ? product.variants : [];

  for (const variant of variants) {
    const key = variant.size || '__default__';
    const existing = bySize.get(key);
    if (!existing) {
      bySize.set(key, variant);
      continue;
    }
    const variantStock = variant.availability === 'in_stock' ? 1 : 0;
    const existingStock = existing.availability === 'in_stock' ? 1 : 0;
    if (variantStock > existingStock || (variantStock === existingStock && Number(variant.price || 0) < Number(existing.price || 0))) {
      bySize.set(key, variant);
    }
  }

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    category: product.category,
    images: (product.images || []).slice(0, 1),
    imageAlt: product.imageAlt,
    price: product.price,
    oldPrice: product.oldPrice,
    availability: product.availability,
    sizes: product.sizes || [],
    variants: [...bySize.values()].map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size || null,
      price: Number(variant.price || 0),
      oldPrice: Number(variant.oldPrice || 0) || null,
      availability: variant.availability,
    })),
  };
}

async function getConversionRecommendations(product) {
  const categories = CRO_CATEGORY_MATRIX[product?.category] || [];
  const entries = await Promise.all(categories.map(async (category) => {
    const all = (await getHomefortLiveProducts(category))
      .filter((item) => item.indexable !== false && item.slug !== product.slug)
      .sort((a, b) => {
        const overlapDiff = overlapScore(product, b) - overlapScore(product, a);
        if (overlapDiff) return overlapDiff;
        const stockDiff = Number(b.availability === 'in_stock') - Number(a.availability === 'in_stock');
        if (stockDiff) return stockDiff;
        return Number(a.price || 0) - Number(b.price || 0);
      })
      .slice(0, 12)
      .map(compactRecommendation);

    return [category, all];
  }));

  return Object.fromEntries(entries);
}

const getProductData = cache(async (slug) => {
  const product = await getHomefortLiveProductBySlug(slug);
  if (!product) return { product: null, related: [], offers: [], recommendations: {} };

  const [relatedAll, offers, recommendations] = await Promise.all([
    getHomefortLiveProducts(product.category),
    product.category === 'beds' ? getHomefortBundleOffersForProduct(product.slug) : Promise.resolve([]),
    getConversionRecommendations(product),
  ]);

  return {
    product,
    offers,
    recommendations,
    related: relatedAll
      .filter((item) => item.indexable !== false && item.slug !== product.slug)
      .sort((a, b) => Math.abs(Number(a.price || 0) - Number(product.price || 0)) - Math.abs(Number(b.price || 0) - Number(product.price || 0)))
      .slice(0, 3)
      .map(compactCatalogProduct),
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
      ? <BedProduct initialProduct={product} initialRelated={data.related} />
      : <VariantProduct initialProduct={product} initialRelated={data.related} />}
    <PdpConversionRailPortal product={product} recommendations={data.recommendations} />
    <ConversionSuitePortal product={product} recommendations={data.recommendations} />
    {product.category === 'beds' && <BundleOfferPortal offers={data.offers} />}
  </>;
}
