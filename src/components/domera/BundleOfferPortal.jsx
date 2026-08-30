'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Plus } from 'lucide-react';
import ProductImage from '@/components/domera/ProductImage';
import { useCart } from '@/lib/CartContext';
import { buildItem, track, trackMeta } from '@/lib/analytics';
import { sizeMatches } from '@/lib/variant';

function bestVariant(variants = [], preferredSize = '') {
  const pool = preferredSize
    ? variants.filter((variant) => variant.size && sizeMatches(variant.size, preferredSize))
    : variants;
  const candidates = pool.length ? pool : variants;
  const stocked = candidates.filter((variant) => variant.availability === 'in_stock');
  return [...(stocked.length ? stocked : candidates)].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0] || null;
}

function currentSizeFromUrl() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('size') || '';
}

function BundleOfferCard({ offer }) {
  const { add, open } = useCart();
  const [pageSize, setPageSize] = useState(() => currentSizeFromUrl());
  const [manualSize, setManualSize] = useState('');
  const sizes = useMemo(() => [...new Set((offer.variants || []).map((variant) => variant.size).filter(Boolean))], [offer]);
  const effectiveSize = manualSize || pageSize;
  const variant = useMemo(() => bestVariant(offer.variants || [], effectiveSize), [offer, effectiveSize]);
  const price = Number(variant?.price || offer.price || 0);
  const oldPrice = Number(variant?.oldPrice || offer.oldPrice || 0);
  const discounted = oldPrice > price && price > 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = currentSizeFromUrl();
      setPageSize((current) => current === next ? current : next);
    }, 400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!manualSize && pageSize && sizes.some((size) => sizeMatches(size, pageSize))) return;
    if (manualSize && sizes.some((size) => sizeMatches(size, manualSize))) return;
    if (pageSize && sizes.some((size) => sizeMatches(size, pageSize))) setManualSize('');
    else if (sizes.length) setManualSize(sizes[0]);
  }, [pageSize, sizes, manualSize]);

  const addOffer = () => {
    if (!variant || !price) return;
    const variantSKU = variant.sku || variant.id || offer.sku || offer.id;
    add({
      productId: offer.id,
      variantSKU,
      slug: offer.slug,
      name: offer.name,
      price,
      image: offer.images?.[0],
      size: variant.size || null,
      qty: 1,
      isBundleOffer: true,
    });
    track('add_to_cart', { currency: 'UAH', value: price, items: [buildItem({ ...offer, price }, { variantSKU, size: variant.size, price, quantity: 1 })] });
    trackMeta('AddToCart', { currency: 'UAH', value: price, contents: [{ id: variantSKU, quantity: 1 }], content_type: 'product' });
    open?.();
  };

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#C8643B]/20 bg-[#FBF6EF] shadow-[0_14px_40px_rgba(52,33,18,0.06)]">
      <div className="grid md:grid-cols-[260px_1fr]">
        <div className="relative min-h-[220px] bg-white">
          {offer.images?.[0] ? <ProductImage src={offer.images[0]} alt={offer.imageAlt || offer.name} sizes="260px" quality={70} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-sm text-mocha">Фото готується</div>}
          <div className="absolute left-4 top-4 rounded-full bg-espresso px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-milk">Комплект</div>
        </div>
        <div className="p-5 md:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B56B43]">Спеціальна пропозиція до цієї моделі</p>
          <h3 className="mt-2 font-heading text-[28px] leading-[1.05] text-espresso">{offer.name}</h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-mocha">Готовий комплект із сумісними складовими. Оберіть потрібний розмір — ціна підставиться з відповідного рядка таблиці.</p>

          {sizes.length > 1 && <div className="mt-5"><p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-mocha">Розмір комплекту</p><div className="flex flex-wrap gap-2">{sizes.map((size) => <button key={size} type="button" onClick={() => setManualSize(size)} className={`min-h-10 rounded-[10px] border px-3 text-[12px] transition-colors ${variant?.size && sizeMatches(variant.size, size) ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 bg-white text-espresso'}`}>{size}</button>)}</div></div>}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-espresso/10 pt-5">
            <div>
              <div className="flex items-baseline gap-2"><span className="font-heading text-[30px] font-semibold text-espresso">{price.toLocaleString('uk-UA')} ₴</span>{discounted && <span className="text-[13px] text-mocha line-through">{oldPrice.toLocaleString('uk-UA')} ₴</span>}</div>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-mocha"><Check className="h-3.5 w-3.5" />{variant?.availability === 'in_stock' ? 'В наявності' : 'Доступність уточнить менеджер'}</p>
            </div>
            <button type="button" onClick={addOffer} disabled={!price} className="ui-radius-sm inline-flex min-h-12 items-center justify-center gap-2 bg-espresso px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-milk disabled:opacity-40"><Plus className="h-4 w-4" /> Додати комплект</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function BundleOfferPortal({ offers = [] }) {
  const [host, setHost] = useState(null);

  useEffect(() => {
    if (!offers.length) return undefined;
    const container = document.querySelector('main > div');
    if (!container) return undefined;
    const node = document.createElement('div');
    node.setAttribute('data-bundle-offers', 'true');
    node.className = 'mt-20 md:mt-28 border-t border-espresso/10 pt-12 md:pt-16';
    container.appendChild(node);
    setHost(node);
    return () => {
      setHost(null);
      node.remove();
    };
  }, [offers.length]);

  if (!host || !offers.length) return null;
  return createPortal(
    <section>
      <div className="mb-8"><p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-[#B56B43]">Разом вигідніше</p><h2 className="font-heading text-3xl md:text-4xl text-espresso">Комплект до цієї моделі</h2></div>
      <div className="space-y-5">{offers.map((offer) => <BundleOfferCard key={offer.id || offer.slug} offer={offer} />)}</div>
    </section>,
    host,
  );
}
