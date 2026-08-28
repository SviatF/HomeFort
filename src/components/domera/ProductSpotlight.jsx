'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import ProductImage from '@/components/domera/ProductImage';

export default function ProductSpotlight() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    let active = true;
    fetch('/api/catalog/beds')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Spreadsheet catalog unavailable')))
      .then((data) => {
        if (!active) return;
        const products = Array.isArray(data?.products) ? data.products : [];
        const chosen = products.find((item) => item.availability === 'in_stock' && item.images?.length) || products.find((item) => item.images?.length) || products[0] || null;
        setProduct(chosen);
      })
      .catch(() => { if (active) setProduct(null); });
    return () => { active = false; };
  }, []);

  if (!product) return null;

  const specs = [
    { label: 'Розміри', value: product.sizes?.length ? `${product.sizes.length} варіантів` : null },
    { label: 'Комплектації', value: product.variants?.length ? `${product.variants.length} варіантів` : null },
    { label: 'Наявність', value: product.availability === 'in_stock' ? 'В наявності' : 'Немає в наявності' },
  ].filter((spec) => spec.value);

  return (
    <section className="bg-graphite py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-6 order-2 lg:order-1">
            <Link to={`/product/${product.slug}`} className="relative block overflow-hidden aspect-[4/5] bg-espresso-soft border border-milk/10 shadow-card">
              {product.images?.[0] ? <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-milk/50">Фото готується</div>}
            </Link>
          </Reveal>

          <Reveal className="lg:col-span-6 order-1 lg:order-2" delay={100}>
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4 font-medium">Рекомендуємо</p>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.4rem)] leading-[1.06] text-milk">{product.name}</h2>
            {product.shortDescription && <p className="mt-5 text-milk/70 text-lg leading-relaxed max-w-md">{product.shortDescription}</p>}

            {specs.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-px bg-milk/10 border border-milk/10">
                {specs.map((spec) => <div key={spec.label} className="bg-graphite px-4 py-5"><p className="text-[10px] tracking-[0.2em] uppercase text-champagne mb-2">{spec.label}</p><p className="text-sm text-milk leading-snug">{spec.value}</p></div>)}
              </div>
            )}

            <div className="mt-8">
              <p className="text-[11px] tracking-[0.22em] uppercase text-champagne mb-1">{product.priceFrom ? 'Ціна від' : 'Ціна'}</p>
              <span className="font-heading text-4xl text-milk">{Number(product.price || 0).toLocaleString('uk-UA')} ₴</span>
            </div>

            <div className="mt-8">
              <Link to={`/product/${product.slug}`} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase font-semibold hover:bg-champagne transition-colors">
                Обрати розмір і комплектацію <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
