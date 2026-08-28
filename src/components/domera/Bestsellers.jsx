'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import ProductCard from './ProductCard';

function rankBestsellers(products = []) {
  return [...products]
    .filter((product) => product?.slug && product?.category === 'beds')
    .sort((a, b) => {
      const stockDiff = Number(b.availability === 'in_stock') - Number(a.availability === 'in_stock');
      if (stockDiff) return stockDiff;
      const imageDiff = Number(Boolean(b.images?.length)) - Number(Boolean(a.images?.length));
      if (imageDiff) return imageDiff;
      return Number(a.price || 0) - Number(b.price || 0);
    })
    .slice(0, 6)
    .map((product) => ({ ...product, id: product.id || `sheet:${product.slug}` }));
}

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/catalog/beds')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Spreadsheet catalog unavailable')))
      .then((data) => { if (active) setProducts(rankBestsellers(Array.isArray(data?.products) ? data.products : [])); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="bg-milk py-24 md:py-36 border-y border-espresso/10">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="flex items-end justify-between mb-14 md:mb-20 flex-wrap gap-6">
          <div><p className="text-[13px] tracking-[0.28em] uppercase text-mocha mb-4 font-semibold">Бестселери</p><h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.06] text-espresso">Обирають найчастіше</h2></div>
          <Link to="/catalog/beds" className="group inline-flex items-center gap-2 text-[13px] tracking-[0.18em] uppercase text-espresso border-b border-espresso/45 pb-1 font-semibold hover:border-espresso transition-colors">Весь каталог<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.6} /></Link>
        </Reveal>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-sand skeleton ui-radius-md" />)}</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">{products.map((product, index) => <Reveal key={product.id} delay={index * 90}><ProductCard product={product} /></Reveal>)}</div>
        ) : (
          <div className="border border-espresso/10 bg-ivory px-6 py-12 text-center"><p className="font-heading text-2xl text-espresso">Моделі тимчасово не завантажились</p><Link to="/catalog/beds" className="mt-4 inline-flex text-[13px] uppercase tracking-[0.16em] text-espresso border-b border-espresso/40">Відкрити каталог</Link></div>
        )}
      </div>
    </section>
  );
}
