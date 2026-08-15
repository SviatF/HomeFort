'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from './Reveal';
import ProductCard from './ProductCard';

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ featured: true })
      .then((res) => setProducts((res || []).slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-espresso-soft py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="flex items-end justify-between mb-14 md:mb-20 flex-wrap gap-6">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4 font-medium">Бестселери</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.06] text-milk">Обирають найчастіше</h2>
          </div>
          <Link to="/catalog/beds" className="group inline-flex items-center gap-2 text-[12px] tracking-[0.22em] uppercase text-milk border-b border-milk pb-1 font-medium hover:border-champagne hover:text-champagne transition-colors">
            Весь каталог
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.6} />
          </Link>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => <div key={i} className="aspect-[4/5] bg-espresso animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard product={p} dark />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}