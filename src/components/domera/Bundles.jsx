'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, buildItem } from '@/lib/analytics';
import { useCart } from '@/lib/CartContext';
import Reveal from '@/components/domera/Reveal';
import { Image } from '@/components/ui/image';

export default function Bundles() {
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    Promise.all([
      base44.entities.Bundle.filter({ active: true }),
      base44.entities.Product.list('-created_date', 200),
    ])
      .then(([bs, ps]) => {
        setBundles(bs || []);
        const map = {};
        (ps || []).forEach((p) => { map[p.id] = p; });
        setProducts(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || bundles.length === 0) return null;

  const now = new Date();
  const visible = bundles.filter((b) => {
    if (b.startDate && new Date(b.startDate) > now) return false;
    if (b.endDate && new Date(b.endDate) < now) return false;
    return true;
  });
  if (visible.length === 0) return null;

  const compute = (b) => {
    const items = (b.products || [])
      .map((pp) => ({ ...products[pp.productId], qty: pp.qty || 1 }))
      .filter((p) => p && p.id);
    if (items.length === 0) return null;
    const itemsTotal = items.reduce((s, p) => s + p.price * (p.qty || 1), 0);
    const discount = b.discountType === 'fixed' ? (b.discountValue || 0) : (itemsTotal * (b.discountValue || 0) / 100);
    const bundlePrice = Math.max(0, Math.round(itemsTotal - discount));
    const savings = itemsTotal - bundlePrice;
    return { items, itemsTotal, bundlePrice, savings };
  };

  const addBundle = (b, c) => {
    c.items.forEach((p) => {
      add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images?.[0], qty: p.qty || 1 });
    });
    track('add_to_cart', { value: c.bundlePrice, items: c.items.map((p) => buildItem(p, { quantity: p.qty || 1 })) });
  };

  return (
    <section className="py-20 md:py-28 bg-espresso">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal>
          <p className="text-[10px] tracking-[0.32em] uppercase text-champagne mb-4">Комплекти</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] text-milk mb-12">Зберіть спальню комплектом</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {visible.map((b) => {
            const c = compute(b);
            if (!c) return null;
            return (
              <div key={b.id} className="bg-espresso-soft border border-milk/10 flex flex-col">
                {b.image && <div className="aspect-[4/3] overflow-hidden bg-espresso"><Image src={b.image} alt={b.name} className="w-full h-full" /></div>}
                <div className="p-7 flex flex-col flex-1">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-champagne mb-2">{b.tier}</span>
                  <h3 className="font-heading text-2xl text-milk mb-2">{b.name}</h3>
                  {b.description && <p className="text-sm text-milk/60 mb-4">{b.description}</p>}
                  <ul className="space-y-1.5 mb-5 text-sm text-milk/70">
                    {c.items.map((p) => (
                      <li key={p.id} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-champagne" /> {p.name}{p.qty > 1 ? ` ×${p.qty}` : ''}</li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {c.savings > 0 && <p className="text-xs text-champagne mb-1">Економія {c.savings.toLocaleString('uk-UA')} ₴</p>}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-heading text-3xl text-milk">{c.bundlePrice.toLocaleString('uk-UA')} ₴</span>
                      {c.savings > 0 && <span className="text-sm text-milk/45 line-through">{c.itemsTotal.toLocaleString('uk-UA')} ₴</span>}
                    </div>
                    <button onClick={() => addBundle(b, c)} className="group w-full py-3.5 bg-milk text-espresso text-[11px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-champagne transition-colors">
                      Додати комплект <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}