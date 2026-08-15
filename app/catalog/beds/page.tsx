import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

export const metadata: Metadata = { title: 'Ліжка — купити м’яке ліжко DOMERA', description: 'М’які, двоспальні, односпальні, дитячі та преміальні ліжка DOMERA. Власне виробництво та доставка по Україні.', alternates: { canonical: '/catalog/beds' } };

export default function BedsPage() {
  return <main><Header /><section className="catalog-hero container"><div className="breadcrumbs">Головна / Каталог / Ліжка</div><p className="eyebrow">8 MODELS · MADE TO ORDER</p><h1>Ліжка <em>DOMERA.</em></h1><p>М’які форми, продумана конструкція та тканини, які хочеться торкатися.</p></section><section className="catalog-toolbar container"><div className="filter-chips"><button className="active">Всі ліжка</button><button>М’які</button><button>З механізмом</button><button>Двоспальні</button><button>Premium</button></div><button className="sort-button">Фільтри +</button></section><section className="catalog-grid container">{products.map(p => <ProductCard key={p.slug} product={p} />)}</section><section className="seo-copy container"><h2>Ліжка DOMERA — комфорт як частина інтер’єру</h2><p>DOMERA створює м’які ліжка для сучасних спалень: від компактних односпальних моделей до великих преміальних ліжок із підйомним механізмом. Кожна модель доступна у кількох розмірах і тканинах, щоб вписатися у ваш простір не лише функціонально, а й візуально.</p></section><Footer /></main>;
}
