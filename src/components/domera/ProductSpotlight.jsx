'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '@/lib/CartContext';
import { track, buildItem } from '@/lib/analytics';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

const availText = {
  in_stock: 'В наявності',
  made_to_order: 'Під замовлення',
  out_of_stock: 'Немає в наявності',
};

export default function ProductSpotlight() {
  const [product, setProduct] = useState(null);
  const { add, open } = useCart();

  useEffect(() => {
    base44.entities.Product.filter({ featured: true })
      .then((res) => {
        const list = res || [];
        setProduct(list.find((p) => p.images?.length) || list[0] || null);
      })
      .catch(() => setProduct(null));
  }, []);

  if (!product) return null;

  const specs = [
    { label: 'Матеріал', value: product.material },
    { label: 'Сп. місце', value: product.sleepingWidth || product.dimensions },
    { label: 'Наявність', value: availText[product.availability] || product.availability },
  ].filter((s) => s.value);

  const addToCart = () => {
    add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] });
    track('add_to_cart', { value: product.price, items: [buildItem(product)] });
    open();
  };

  return (
    <section className="bg-graphite py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative overflow-hidden aspect-[4/5] bg-espresso-soft border border-milk/10 shadow-card">
              <Image src={product.images?.[0]} alt={product.name} className="w-full h-full" />
              {product.salePercent > 0 && (
                <span className="absolute top-5 left-5 bg-champagne text-espresso text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
                  −{product.salePercent}%
                </span>
              )}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6 order-1 lg:order-2" delay={100}>
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4 font-medium">Рекомендуємо</p>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.4rem)] leading-[1.06] text-milk">{product.name}</h2>
            {product.shortDescription && (
              <p className="mt-5 text-milk/70 text-lg leading-relaxed max-w-md">{product.shortDescription}</p>
            )}

            {specs.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-px bg-milk/10 border border-milk/10">
                {specs.map((s) => (
                  <div key={s.label} className="bg-graphite px-4 py-5">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-champagne mb-2">{s.label}</p>
                    <p className="text-sm text-milk leading-snug">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-end gap-4">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-champagne mb-1">Ціна</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-4xl text-milk">{product.price?.toLocaleString('uk-UA')} ₴</span>
                  {product.oldPrice > 0 && (
                    <span className="text-lg text-milk/45 line-through">{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={addToCart}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase font-semibold hover:bg-champagne transition-colors"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.6} /> У кошик
              </button>
              <Link
                to={`/product/${product.slug}`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-milk/40 text-milk text-[12px] tracking-[0.22em] uppercase hover:border-milk transition-colors"
              >
                Детальніше <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}