import { notFound, permanentRedirect } from 'next/navigation';
import Catalog from '@/screens/Catalog';
import { filterEntity } from '@/lib/base44-server';
import { getHomefortBeds } from '@/lib/homefort-static';
import { buildMetadata, breadcrumbSchema, collectionSchema, faqSchema } from '@/lib/seo';
import { BED_SEMANTIC_LANDINGS, getBedSemanticLanding, filterProductsForBedLanding } from '@/lib/bed-semantic-core';

const fallbackTitles = {
  beds: ['Ліжка', 'М’які ліжка Homefort у каталозі DOMERA. Різні розміри, тканини та комплектації. Доставка по Україні.'],
  mattresses: ['Матраци', 'Анатомічні та ортопедичні матраци DOMERA для комфортного сну. Різні розміри та рівні жорсткості.'],
  toppers: ['Наматрацники', 'Наматрацники DOMERA для додаткового комфорту, захисту матраца та покращення мікроклімату сну.'],
  pillows: ['Подушки', 'Подушки DOMERA для правильної підтримки голови та шиї, комфортного й здорового сну.'],
  duvets: ['Ковдри', 'Легкі та дихаючі ковдри DOMERA для комфортного сну протягом усього року.'],
  bedding: ['Постільна білизна', 'Постільна білизна DOMERA з натуральних тканин для м’якого, дихаючого та комфортного сну.'],
  'kids-mattresses': ['Дитячі матраци', 'Дитячі ортопедичні матраци DOMERA з безпечних та гіпоалергенних матеріалів.'],
};

function normalizePart(parts) { return Array.isArray(parts) ? parts[0] : parts || ''; }
function isSizeSlug(value = '') { return /^\d{2,3}(?:x|х|×)\d{2,3}$/i.test(String(value)); }
function canonicalSizeSlug(value = '') {
  const match = String(value).toLowerCase().match(/^(\d{2,3})(?:x|х|×)(\d{2,3})$/i);
  return match ? `${match[1]}x${match[2]}` : '';
}
function sizeLabel(value = '') { return canonicalSizeSlug(value).replace('x', '×'); }
function normalizeComparableSize(value = '') {
  const match = String(value).toLowerCase().replace(/см/g, '').match(/(\d{2,3})\s*[×хx]\s*(\d{2,3})/);
  return match ? `${match[1]}x${match[2]}` : '';
}
function availableSizeSlugs(products = []) {
  return new Set(products.flatMap((p) => (p.sizes || []).map(normalizeComparableSize)).filter(Boolean));
}
function safeRetailText(value = '') {
  return String(value || '')
    .replace(/ціни від виробника/gi, 'актуальні ціни')
    .replace(/власне виробництво/gi, 'перевірені моделі')
    .replace(/ліжка DOMERA/gi, 'ліжка у DOMERA')
    .replace(/ліжко DOMERA/gi, 'ліжко у DOMERA')
    .replace(/м’які ліжка DOMERA/gi, 'м’які ліжка у DOMERA')
    .replace(/двоспальні ліжка DOMERA/gi, 'двоспальні ліжка у DOMERA');
}
function safeLanding(landing, slug) {
  if (!landing) return null;
  return {
    ...landing,
    slug,
    title: safeRetailText(landing.title),
    description: safeRetailText(landing.description),
    intro: safeRetailText(landing.intro),
    faq: (landing.faq || []).map((item) => ({ ...item, a: safeRetailText(item.a) })),
  };
}

async function getData(category, landing = null) {
  if (category === 'beds') {
    const allProducts = getHomefortBeds().filter((p) => p.indexable !== false);
    const products = landing ? filterProductsForBedLanding(allProducts, landing) : allProducts;
    const fallback = fallbackTitles.beds;
    const baseCategory = {
      key: 'beds',
      name: 'Ліжка',
      h1: 'Ліжка',
      seoTitle: 'Ліжка купити в Україні — ціни та фото | DOMERA',
      seoDescription: fallback[1],
      seoIntro: fallback[1],
      canonicalUrl: '/catalog/beds',
      indexable: true,
    };
    const categoryEntity = landing
      ? {
          ...baseCategory,
          name: landing.h1,
          h1: landing.h1,
          seoTitle: landing.title,
          seoDescription: landing.description,
          seoIntro: landing.intro,
          canonicalUrl: `/catalog/beds/${landing.slug || ''}`,
          faq: landing.faq,
        }
      : baseCategory;
    return { products, categoryEntity, allProducts };
  }

  const [editableProducts, cats] = await Promise.all([
    filterEntity('Product', { category }),
    filterEntity('Category', { key: category }),
  ]);
  const products = landing ? filterProductsForBedLanding(editableProducts, landing) : editableProducts;
  return { products, categoryEntity: cats[0] || null, allProducts: editableProducts };
}

function resolveRoute(category, raw = '') {
  const part = normalizePart(raw);
  if (!part) return { size: '', landing: null, unknown: false };
  if (isSizeSlug(part)) return { size: canonicalSizeSlug(part), rawSize: part, landing: null, unknown: false };
  const landing = category === 'beds' ? getBedSemanticLanding(part) : null;
  if (landing) return { size: '', landing: safeLanding(landing, part), unknown: false };
  return { size: '', landing: null, unknown: true };
}

export function generateStaticParams() {
  const beds = getHomefortBeds().filter((p) => p.indexable !== false);
  const sizes = [...availableSizeSlugs(beds)];
  const semantic = Object.keys(BED_SEMANTIC_LANDINGS || {});
  return [
    { category: 'beds' },
    ...sizes.map((size) => ({ category: 'beds', size: [size] })),
    ...semantic.map((slug) => ({ category: 'beds', size: [slug] })),
  ];
}

export async function generateMetadata({ params }) {
  const { category, size: rawSize } = await params;
  const route = resolveRoute(category, rawSize);
  if (route.unknown) return buildMetadata({ title: 'Сторінку не знайдено', description: '', canonical: `/catalog/${category}/${normalizePart(rawSize)}`, index: false });

  const { categoryEntity, allProducts } = await getData(category, route.landing);
  const fallback = fallbackTitles[category] || ['Каталог', 'Каталог товарів DOMERA для комфортної спальні.'];

  if (route.size && !availableSizeSlugs(allProducts).has(route.size)) {
    return buildMetadata({ title: 'Сторінку не знайдено', description: '', canonical: `/catalog/${category}/${route.size}`, index: false });
  }

  if (route.landing) {
    return buildMetadata({
      title: route.landing.title,
      description: route.landing.description,
      canonical: `/catalog/${category}/${route.landing.slug}`,
      image: categoryEntity?.ogImage,
      index: true,
      keywords: [...route.landing.keywords, 'DOMERA'],
    });
  }

  const name = categoryEntity?.name || fallback[0];
  const label = route.size ? sizeLabel(route.size) : '';
  const description = categoryEntity?.seoDescription || categoryEntity?.seoIntro || fallback[1];
  const canonical = route.size ? `/catalog/${category}/${route.size}` : (categoryEntity?.canonicalUrl || `/catalog/${category}`);
  const title = route.size
    ? `${name} ${label} — купити в Україні, ціни`
    : (categoryEntity?.seoTitle || `${name} DOMERA — купити в Україні, ціни`);

  return buildMetadata({
    title,
    description: route.size ? `${description} Добірка моделей у розмірі ${label}.` : description,
    canonical,
    image: categoryEntity?.ogImage,
    index: categoryEntity?.indexable !== false,
    keywords: route.size
      ? [`${name.toLowerCase()} ${label}`, `купити ${name.toLowerCase()} ${label}`, 'DOMERA']
      : [name, `купити ${name.toLowerCase()}`, 'DOMERA'],
  });
}

export default async function Page({ params }) {
  const { category, size: rawSize } = await params;
  const route = resolveRoute(category, rawSize);
  if (route.unknown) notFound();

  if (route.size && route.rawSize && route.rawSize !== route.size) {
    permanentRedirect(`/catalog/${category}/${route.size}`);
  }

  const data = await getData(category, route.landing);
  if (route.size && !availableSizeSlugs(data.allProducts).has(route.size)) notFound();

  const fallback = fallbackTitles[category] || ['Каталог', 'Каталог DOMERA.'];
  const name = route.landing?.h1 || data.categoryEntity?.name || fallback[0];
  const label = route.size ? sizeLabel(route.size) : '';
  const description = route.landing?.description || data.categoryEntity?.seoDescription || data.categoryEntity?.seoIntro || fallback[1];
  const url = route.landing
    ? `/catalog/${category}/${route.landing.slug}`
    : route.size
      ? `/catalog/${category}/${route.size}`
      : `/catalog/${category}`;

  const filteredProducts = route.size
    ? data.products.filter((p) => (p.sizes || []).some((s) => normalizeComparableSize(s) === route.size))
    : data.products;

  if (route.size && filteredProducts.length === 0) notFound();

  const breadcrumbItems = [
    { name: 'Головна', url: '/' },
    ...(route.landing ? [{ name: 'Ліжка', url: '/catalog/beds' }] : []),
    { name: route.landing ? route.landing.h1 : (data.categoryEntity?.name || fallback[0]), url: route.landing ? url : `/catalog/${category}` },
    ...(route.size ? [{ name: label, url }] : []),
  ];

  const schemas = [
    collectionSchema({ name: route.size ? `${name} ${label}` : name, description, url, products: filteredProducts }),
    breadcrumbSchema(breadcrumbItems),
    ...(route.landing?.faq?.length ? [faqSchema(route.landing.faq)] : []),
  ].filter(Boolean);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    <Catalog initialProducts={data.products} initialCategory={data.categoryEntity} />
  </>;
}
