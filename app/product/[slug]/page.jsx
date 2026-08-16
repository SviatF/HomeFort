import { notFound } from 'next/navigation';
import Product from '@/screens/Product';
import { filterEntity } from '@/lib/base44-server';
import { getHomefortBedBySlug, getHomefortBeds, mergeEditableProducts } from '@/lib/homefort-static';

async function getProductData(slug) {
  const products = await filterEntity('Product', { slug });
  const editableProduct = products[0] || null;
  const staticProduct = getHomefortBedBySlug(slug);
  const product = editableProduct ? { ...(staticProduct || {}), ...editableProduct } : staticProduct;
  if (!product) return { product: null, related: [], mattresses: [], crossSell: [] };

  const editableRelated = await filterEntity('Product', { category: product.category });
  const relatedAll = product.category === 'beds'
    ? mergeEditableProducts(getHomefortBeds(), editableRelated)
    : editableRelated;

  let mattresses = [], crossSell = [];
  if (product.category === 'beds') {
    const [mats, tops, bedding, pillows] = await Promise.all([
      filterEntity('Product', { category: 'mattresses' }), filterEntity('Product', { category: 'toppers' }),
      filterEntity('Product', { category: 'bedding' }), filterEntity('Product', { category: 'pillows' }),
    ]);
    mattresses = mats.slice(0, 4);
    crossSell = [...mats, ...tops, ...bedding, ...pillows].filter((p) => p.id !== product.id);
  }
  return { product, related: relatedAll.filter((p) => p.slug !== product.slug).slice(0, 3), mattresses, crossSell };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await getProductData(slug);
  if (!product) return { title: 'Товар не знайдено', robots: { index: false, follow: false } };
  const description = product.seoDescription || product.shortDescription || product.fullDescription || '';
  const canonical = product.canonicalUrl || `/product/${product.slug}`;
  return {
    title: product.seoTitle || `${product.name} — купити від ${Number(product.price || 0).toLocaleString('uk-UA')} ₴`,
    description,
    alternates: { canonical },
    robots: { index: product.indexable !== false, follow: true },
    openGraph: { title: product.seoTitle || product.name, description, images: product.ogImage || product.images?.[0] ? [product.ogImage || product.images[0]] : undefined, url: canonical, type: 'website' },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data.product) notFound();
  const p = data.product;
  const productLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: p.images, description: p.shortDescription || p.fullDescription || '', sku: p.sku,
    brand: { '@type': 'Brand', name: 'DOMERA' },
    offers: { '@type': 'Offer', url: `https://domera.shop/product/${p.slug}`, priceCurrency: 'UAH', price: p.price, availability: p.availability === 'in_stock' ? 'https://schema.org/InStock' : p.availability === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/PreOrder' },
    ...(p.reviewsCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewsCount } } : {}),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} /><Product initialProduct={p} initialRelated={data.related} initialMattresses={data.mattresses} initialCrossSell={data.crossSell} /></>;
}
