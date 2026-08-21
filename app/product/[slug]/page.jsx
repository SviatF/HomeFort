import { notFound } from 'next/navigation';
import Product from '@/screens/Product';
import { filterEntity } from '@/lib/base44-server';
import { getHomefortBedBySlug, getHomefortBeds } from '@/lib/homefort-static';
import { buildMetadata, breadcrumbSchema, productSchema } from '@/lib/seo';

async function getProductData(slug) {
  const staticProduct = getHomefortBedBySlug(slug);

  if (staticProduct) {
    const allBeds = getHomefortBeds().filter((p) => p.indexable !== false);
    return {
      product: staticProduct,
      related: allBeds.filter((p) => p.slug !== staticProduct.slug).slice(0, 3),
      mattresses: [],
      crossSell: [],
    };
  }

  const products = await filterEntity('Product', { slug });
  const product = products[0] || null;
  if (!product || product.category === 'beds') return { product: null, related: [], mattresses: [], crossSell: [] };

  const relatedAll = await filterEntity('Product', { category: product.category });
  return {
    product,
    related: relatedAll.filter((p) => p.slug !== product.slug).slice(0, 3),
    mattresses: [],
    crossSell: [],
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await getProductData(slug);
  if (!product) return { title: 'Товар не знайдено', robots: { index: false, follow: false } };

  const title = product.seoTitle || `${product.name} — купити від ${Number(product.price || 0).toLocaleString('uk-UA')} ₴`;
  const description = product.seoDescription || product.shortDescription || product.fullDescription || `${product.name} у DOMERA. Ціна від ${Number(product.price || 0).toLocaleString('uk-UA')} ₴. Доставка по Україні.`;
  const canonical = product.canonicalUrl || `/product/${product.slug}`;
  const sizeKeywords = (product.sizes || []).slice(0, 6).map((s) => `${product.name} ${s}`);

  return buildMetadata({
    title,
    description,
    canonical,
    image: product.ogImage || product.images?.[0],
    index: product.indexable !== false,
    type: 'website',
    keywords: [product.name, 'купити ліжко', ...sizeKeywords],
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
