import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ArrowIcon, HeartIcon } from '@/components/Icons';
import { products } from '@/data/products';

export function generateStaticParams() { return products.map(p => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const { slug } = await params; const p = products.find(x => x.slug === slug); if (!p) return {};
  return { title: `${p.name} — ${p.subtitle}`, description: `${p.name} від DOMERA. ${p.description}`, alternates: { canonical: `/product/${p.slug}` }, openGraph: { images: [p.image] } };
}

const money = (n:number) => new Intl.NumberFormat('uk-UA').format(n) + ' ₴';

export default async function ProductPage({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params; const product = products.find(p => p.slug === slug); if (!product) notFound();
  const related = products.filter(p => p.slug !== product.slug).slice(0,4);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: product.gallery, sku: product.sku, brand: { '@type':'Brand', name:'DOMERA' }, offers: { '@type':'Offer', priceCurrency:'UAH', price: product.price, availability:'https://schema.org/InStock', url:`https://domera.shop/product/${product.slug}` }, aggregateRating: { '@type':'AggregateRating', ratingValue: product.rating, reviewCount: 24 } };
  return <main><Header /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="product-page container-wide">
      <div className="product-gallery">{product.gallery.map((img,i)=><div className={`gallery-item ${i===0?'gallery-main':''}`} key={img}><Image src={img} alt={`${product.name} фото ${i+1}`} fill priority={i===0} sizes="(max-width:900px) 100vw, 55vw" /></div>)}</div>
      <aside className="product-buybox"><div className="breadcrumbs">Каталог / Ліжка / {product.name}</div><p className="eyebrow">{product.category} · {product.sku}</p><h1>{product.name}</h1><p className="buybox-subtitle">{product.subtitle}</p><div className="rating">★★★★★ <span>{product.rating} · 24 відгуки</span></div><div className="buybox-price"><strong>{money(product.price)}</strong>{product.oldPrice&&<del>{money(product.oldPrice)}</del>}</div><div className="installment">від {money(Math.round(product.price/6))} / міс · Оплата частинами</div>
        <div className="option-group"><div className="option-title"><span>Розмір</span><button>Як обрати?</button></div><div className="size-options">{product.sizes.map((s,i)=><button className={i===1?'selected':''} key={s}>{s}</button>)}</div></div>
        <div className="option-group"><div className="option-title"><span>Тканина / колір</span><button>Палітра</button></div><div className="color-options">{product.colors.map((c,i)=><button key={c}><i style={{opacity:1-(i*.12)}} />{c}</button>)}</div></div>
        <div className="stock-line"><span>● Виготовимо під замовлення</span><span>14–21 день</span></div>
        <div className="buy-actions"><Link href="/cart" className="button button-dark">Додати у кошик <ArrowIcon /></Link><button className="wishlist-large"><HeartIcon /></button></div>
        <div className="upsell-box"><p>Доповнити спальню</p>{[['Матрац Balance Pro','+21 500 ₴'],['Наматрацник SoftGuard','+2 490 ₴'],['2 × Cloud Pillow','+3 580 ₴']].map(([n,p])=><label key={n}><input type="checkbox"/><span>{n}</span><b>{p}</b></label>)}</div>
        <div className="buybox-details"><details open><summary>Про модель</summary><p>{product.description}</p></details><details><summary>Характеристики</summary><p>Каркас: дерево / фанера. Матеріал: {product.material}. Висота узголів’я та габарити залежать від вибраного розміру.</p></details><details><summary>Доставка та оплата</summary><p>Доставка по Україні. Оплата онлайн, частинами або за погодженням із менеджером.</p></details><details><summary>Гарантія</summary><p>Гарантія виробника на каркас і механізми. Детальні умови в гарантійному розділі.</p></details></div>
      </aside>
    </section>
    <section className="section related-section container"><div className="section-head"><div><div className="section-label">Можливо, вам сподобається</div><h2>Доповніть <em>спальню.</em></h2></div></div><div className="catalog-grid compact-grid">{related.map(p=><ProductCard product={p} key={p.slug}/>)}</div></section><Footer /></main>;
}
