import Catalog from '@/screens/Catalog';
import { filterEntity } from '@/lib/base44-server';

const fallbackTitles = {
  beds: ['Ліжка', 'М’які ліжка, моделі з підйомним механізмом та преміум-рішення від власного виробництва DOMERA.'],
  mattresses: ['Матраци', 'Анатомічні та ортопедичні матраци з незалежним пружинним блоком та memory foam.'],
  toppers: ['Наматрацники', 'Наматрацники, що пом’якшують поверхню та покращують мікроклімат вашого сну.'],
  pillows: ['Подушки', 'Подушки з натуральним наповненням та льняними чохлами для правильної підтримки.'],
  duvets: ['Ковдри', 'Легкі всесезонні ковдри з дихаючим наповненням та натуральним льоном.'],
  bedding: ['Постільна білизна', 'Льняна постільна білизна з попередньою декатировкою — м’яка та дихаюча.'],
  'kids-mattresses': ['Дитячі матраци', 'Ортопедичні матраці для дітей з гіпоалергенних матеріалів.'],
};

function normalizeSize(parts) { return Array.isArray(parts) ? parts[0] : parts || ''; }

async function getData(category) {
  const [products, cats] = await Promise.all([
    filterEntity('Product', { category }),
    filterEntity('Category', { key: category }),
  ]);
  return { products, categoryEntity: cats[0] || null };
}

export async function generateMetadata({ params }) {
  const { category, size: rawSize } = await params;
  const size = normalizeSize(rawSize);
  const { categoryEntity } = await getData(category);
  const fallback = fallbackTitles[category] || ['Каталог', 'Каталог DOMERA.'];
  const name = categoryEntity?.name || fallback[0];
  const description = categoryEntity?.seoDescription || categoryEntity?.seoIntro || fallback[1];
  const canonical = size ? `/catalog/${category}/${size}` : (categoryEntity?.canonicalUrl || `/catalog/${category}`);
  return {
    title: size ? `${name} ${size} купити — ціни` : (categoryEntity?.seoTitle || `${name} купити — ціни`),
    description: size ? `${description} Розмір ${size}.` : description,
    alternates: { canonical },
    robots: { index: categoryEntity?.indexable !== false, follow: true },
    openGraph: { title: categoryEntity?.ogTitle || categoryEntity?.seoTitle || name, description: categoryEntity?.ogDescription || description, images: categoryEntity?.ogImage ? [categoryEntity.ogImage] : undefined, url: canonical },
  };
}

export default async function Page({ params }) {
  const { category } = await params;
  const data = await getData(category);
  const listLd = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: data.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `https://domera.shop/product/${p.slug}` })),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} /><Catalog initialProducts={data.products} initialCategory={data.categoryEntity} /></>;
}
