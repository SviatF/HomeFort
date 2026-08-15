import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

export const metadata: Metadata = { title: 'Каталог', description: 'Каталог ліжок, матраців та домашнього текстилю DOMERA.' };

export default function CatalogPage() {
  return <main><Header /><section className="catalog-hero container"><div className="breadcrumbs">Головна / Каталог</div><p className="eyebrow">DOMERA COLLECTION</p><h1>Каталог <em>для вашого дому.</em></h1><p>Ліжка, матраци та текстиль у спокійній природній палітрі.</p></section><section className="catalog-toolbar container"><div className="filter-chips"><button className="active">Всі</button><button>Ліжка</button><button>Матраци</button><button>Текстиль</button><button>Подушки</button></div><button className="sort-button">Сортувати ↕</button></section><section className="catalog-grid container">{products.map(p => <ProductCard key={p.slug} product={p} />)}</section><Footer /></main>;
}
