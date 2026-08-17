import { notFound } from 'next/navigation';
import Product from '@/screens/Product';
import { filterEntity } from '@/lib/base44-server';
import { getHomefortBedBySlug, getHomefortBeds, mergeEditableProducts } from '@/lib/homefort-static';
import { buildMetadata, breadcrumbSchema, productSchema } from '@/lib/seo';

async function getProductData(slug) {
  const products = await filterEntity('Product', { slug });
  const editableProduct = products[0] || null;
  const staticProduct = getHomefortBedBySlug(slug);

  if (editableProduct?.category === 'beds' && !staticProduct) {
    return { product: null, related: [], mattresses: [], crossSell: [] };
  }

  const product = editableProduct ? { ...(staticProduct || {}), ...editableProduct } : staticProduct;
  if (!product) return { product: null, related: [], mattresses: [], crossSell: [] };

  const editableRelated = await filterEntity('Product', { category: product.category });
  const relatedAll = product.category === 'beds'
    ? mergeEditableProducts(getHomefortBeds(), editableRelated)
    : editableRelated;

  let mattresses = [], crossSell = [];
  if (product.category === 'beds') {
    const [mats, tops, bedding, pillows] = await Promise.all([
      filterEntity('Product', { category: 'mattresses' }),
      filterEntity('Product', { category: 'toppers' }),
      filterEntity('Product', { category: 'bedding' }),
      filterEntity('Product', { category: 'pillows' }),
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

  const title = product.seoTitle || `${product.name} — купити від ${Number(product.price || 0).toLocaleString('uk-UA')} ₴`;
  const description = product.seoDescription || product.shortDescription || product.fullDescription || `${product.name} DOMERA. Ціна від ${Number(product.price || 0).toLocaleString('uk-UA')} ₴. Доставка по Україні.`;
  const canonical = product.canonicalUrl || `/product/${product.slug}`;
  const sizeKeywords = (product.sizes || []).slice(0, 6).map((s) => `${product.name} ${s}`);

  return buildMetadata({
    title,
    description,
    canonical,
    image: product.ogImage || product.images?.[0],
    index: product.indexable !== false,
    type: 'website',
    keywords: [product.name, 'купити ліжко', 'ліжка DOMERA', ...sizeKeywords],
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);
  if (!data.product) notFound();
  const p = data.product;

  const schemas = [
    productSchema(p),
    breadcrumbSchema([
      { name: 'Головна', url: '/' },
      { name: p.category === 'beds' ? 'Ліжка' : 'Каталог', url: `/catalog/${p.category}` },
      { name: p.name, url: `/product/${p.slug}` },
    ]),
  ];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    <Product initialProduct={p} initialRelated={data.related} initialMattresses={data.mattresses} initialCrossSell={data.crossSell} />
  </>;
}
