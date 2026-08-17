import Catalog from '@/screens/Catalog';
import { filterEntity } from '@/lib/base44-server';
import { getHomefortBeds, mergeEditableProducts } from '@/lib/homefort-static';
import { buildMetadata, breadcrumbSchema, collectionSchema } from '@/lib/seo';

const fallbackTitles = {
  beds: ['Ліжка', 'М’які ліжка, моделі з підйомним механізмом та преміум-рішення DOMERA. Різні розміри, тканини та комплектації. Доставка по Україні.'],
  mattresses: ['Матраци', 'Анатомічні та ортопедичні матраци DOMERA для комфортного сну. Різні розміри та рівні жорсткості.'],
  toppers: ['Наматрацники', 'Наматрацники DOMERA для додаткового комфорту, захисту матраца та покращення мікроклімату сну.'],
  pillows: ['Подушки', 'Подушки DOMERA для правильної підтримки голови та шиї, комфортного й здорового сну.'],
  duvets: ['Ковдри', 'Легкі та дихаючі ковдри DOMERA для комфортного сну протягом усього року.'],
  bedding: ['Постільна білизна', 'Постільна білизна DOMERA з натуральних тканин для м’якого, дихаючого та комфортного сну.'],
  'kids-mattresses': ['Дитячі матраци', 'Дитячі ортопедичні матраци DOMERA з безпечних та гіпоалергенних матеріалів.'],
};

function normalizeSize(parts) { return Array.isArray(parts) ? parts[0] : parts || ''; }
function sizeLabel(value = '') { return String(value).replace(/-/g, '×').replace(/x/gi, '×'); }

async function getData(category) {
  const [editableProducts, cats] = await Promise.all([
    filterEntity('Product', { category }),
    filterEntity('Category', { key: category }),
  ]);
  const products = category === 'beds'
    ? mergeEditableProducts(getHomefortBeds(), editableProducts)
    : editableProducts;
  return { products, categoryEntity: cats[0] || null };
}

export async function generateMetadata({ params }) {
  const { category, size: rawSize } = await params;
  const size = normalizeSize(rawSize);
  const { categoryEntity } = await getData(category);
  const fallback = fallbackTitles[category] || ['Каталог', 'Каталог товарів DOMERA для комфортної спальні.'];
  const name = categoryEntity?.name || fallback[0];
  const label = size ? sizeLabel(size) : '';
  const description = categoryEntity?.seoDescription || categoryEntity?.seoIntro || fallback[1];
  const canonical = size ? `/catalog/${category}/${size}` : (categoryEntity?.canonicalUrl || `/catalog/${category}`);
  const title = size
    ? `${name} ${label} — купити в Україні, ціни`
    : (categoryEntity?.seoTitle || `${name} DOMERA — купити в Україні, ціни`);

  return buildMetadata({
    title,
    description: size ? `${description} Добірка моделей у розмірі ${label}.` : description,
    canonical,
    image: categoryEntity?.ogImage,
    index: categoryEntity?.indexable !== false,
    keywords: size
      ? [`${name.toLowerCase()} ${label}`, `купити ${name.toLowerCase()} ${label}`, 'DOMERA']
      : [name, `купити ${name.toLowerCase()}`, 'DOMERA'],
  });
}

export default async function Page({ params }) {
  const { category, size: rawSize } = await params;
  const size = normalizeSize(rawSize);
  const data = await getData(category);
  const fallback = fallbackTitles[category] || ['Каталог', 'Каталог DOMERA.'];
  const name = data.categoryEntity?.name || fallback[0];
  const label = size ? sizeLabel(size) : '';
  const description = data.categoryEntity?.seoDescription || data.categoryEntity?.seoIntro || fallback[1];
  const url = size ? `/catalog/${category}/${size}` : `/catalog/${category}`;

  const filteredProducts = size
    ? data.products.filter((p) => (p.sizes || []).some((s) => String(s).toLowerCase().replace(/[×хx\sсм]/g, '') === String(label).toLowerCase().replace(/[×хx\sсм]/g, '')))
    : data.products;

  const schemas = [
    collectionSchema({ name: size ? `${name} ${label}` : name, description, url, products: filteredProducts }),
    breadcrumbSchema([
      { name: 'Головна', url: '/' },
      { name, url: `/catalog/${category}` },
      ...(size ? [{ name: label, url }] : []),
    ]),
  ];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
    <Catalog initialProducts={data.products} initialCategory={data.categoryEntity} />
  </>;
}
