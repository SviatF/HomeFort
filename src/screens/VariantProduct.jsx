'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight, Check, Phone, ShieldCheck, Truck } from 'lucide-react';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import ProductGallery from '@/components/domera/ProductGallery';
import ProductCard from '@/components/domera/ProductCard';
import LeadModal from '@/components/domera/LeadModal';
import { BankInstallmentBlock, ConsultationMagnet } from '@/components/domera/ProductPromoExperience';
import { useCart } from '@/lib/CartContext';
import { buildItem, track, trackMeta } from '@/lib/analytics';
import { sizeMatches } from '@/lib/variant';

const CATEGORY_META = {
  mattresses: { name: 'Матраци', url: '/catalog/mattresses', sizeLabel: 'Розмір матраца' },
  pillows: { name: 'Подушки', url: '/catalog/pillows', sizeLabel: 'Розмір подушки' },
  duvets: { name: 'Ковдри', url: '/catalog/duvets', sizeLabel: 'Розмір ковдри' },
  toppers: { name: 'Наматрацники', url: '/catalog/toppers', sizeLabel: 'Розмір' },
};

const DIMENSIONS = [
  { key: 'size', label: 'Розмір', query: 'size' },
  { key: 'priceCategory', label: 'Категорія', query: 'category' },
  { key: 'liftingMechanism', label: 'Варіант', query: 'variant' },
  { key: 'frameOption', label: 'Комплектація', query: 'option' },
];

function normalizeSize(value = '') {
  const match = String(value || '').toLowerCase().replace(/см/g, '').match(/(\d{2,3})\s*[×хx]\s*(\d{2,3})/);
  return match ? `${Number(match[1])}×${Number(match[2])}` : String(value || '').trim();
}

function normalizedValue(key, value) {
  if (value === null || value === undefined) return '';
  return key === 'size' ? normalizeSize(value) : String(value).trim();
}

function matchesValue(variant, key, value) {
  if (!value) return true;
  if (key === 'size') return Boolean(variant?.size && sizeMatches(variant.size, value));
  return normalizedValue(key, variant?.[key]) === normalizedValue(key, value);
}

function bestVariant(variants = []) {
  if (!variants.length) return null;
  const stocked = variants.filter((variant) => variant.availability === 'in_stock');
  return [...(stocked.length ? stocked : variants)].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0] || null;
}

function selectionFromVariant(variant) {
  return Object.fromEntries(DIMENSIONS.map(({ key }) => [key, normalizedValue(key, variant?.[key])]));
}

function valuesForDimension(product, selections, dimensionIndex) {
  const { key } = DIMENSIONS[dimensionIndex];
  let variants = Array.isArray(product?.variants) ? product.variants : [];
  for (let index = 0; index < dimensionIndex; index += 1) {
    const previousKey = DIMENSIONS[index].key;
    const value = selections?.[previousKey];
    if (value) variants = variants.filter((variant) => matchesValue(variant, previousKey, value));
  }
  return [...new Set(variants.map((variant) => normalizedValue(key, variant?.[key])).filter(Boolean))];
}

function findSelectedVariant(product, selections) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const matches = variants.filter((variant) => DIMENSIONS.every(({ key }) => matchesValue(variant, key, selections?.[key])));
  return bestVariant(matches) || bestVariant(variants);
}

function useAnimatedNumber(value, duration = 360) {
  const target = Number(value || 0);
  const [displayValue, setDisplayValue] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    const next = Number(value || 0);
    const from = Number(displayRef.current || 0);
    if (from === next) {
      setDisplayValue(next);
      return undefined;
    }
    if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      displayRef.current = next;
      setDisplayValue(next);
      return undefined;
    }
    let frameId;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (next - from) * eased);
      displayRef.current = current;
      setDisplayValue(current);
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else {
        displayRef.current = next;
        setDisplayValue(next);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return displayValue;
}

export default function VariantProduct({ initialProduct, initialRelated = [] }) {
  const product = initialProduct;
  const meta = CATEGORY_META[product?.category] || { name: 'Каталог', url: `/catalog/${product?.category || ''}`, sizeLabel: 'Розмір' };
  const { add, open } = useCart();
  const defaultVariant = useMemo(() => bestVariant(product?.variants || []), [product]);
  const [selections, setSelections] = useState(() => selectionFromVariant(defaultVariant));
  const [activeImage, setActiveImage] = useState(0);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const selectedVariant = useMemo(() => findSelectedVariant(product, selections), [product, selections]);

  const price = Number(selectedVariant?.price || product?.price_current || product?.price || 0);
  const previousPrice = Number(selectedVariant?.oldPrice || product?.price_old || product?.oldPrice || 0);
  const animatedPrice = useAnimatedNumber(price);
  const animatedPreviousPrice = useAnimatedNumber(previousPrice);
  const discounted = previousPrice > price && price > 0;
  const salePercent = discounted ? Math.round((1 - price / previousPrice) * 100) : 0;
  const inStock = selectedVariant?.availability ? selectedVariant.availability === 'in_stock' : product?.availability === 'in_stock';

  const dimensionOptions = useMemo(() => DIMENSIONS.map((dimension, index) => ({
    ...dimension,
    label: dimension.key === 'size' ? meta.sizeLabel : dimension.label,
    values: valuesForDimension(product, selections, index),
  })), [product, selections, meta.sizeLabel]);

  const installmentProduct = useMemo(() => ({
    ...product,
    installment_enabled: true,
    monobank_enabled: true,
    privatbank_enabled: true,
    pumb_enabled: true,
  }), [product]);

  useEffect(() => {
    setSelections(selectionFromVariant(defaultVariant));
    setActiveImage(0);
  }, [product?.id, defaultVariant?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !product || !defaultVariant) return;
    const params = new URLSearchParams(window.location.search);
    let next = selectionFromVariant(defaultVariant);
    DIMENSIONS.forEach(({ key, query }, index) => {
      const raw = params.get(query);
      if (!raw) return;
      const value = normalizedValue(key, raw);
      const allowed = valuesForDimension(product, next, index);
      if (!allowed.some((candidate) => key === 'size' ? sizeMatches(candidate, value) : candidate === value)) return;
      next[key] = value;
      const compatible = (product.variants || []).filter((variant) =>
        DIMENSIONS.slice(0, index + 1).every(({ key: previousKey }) => matchesValue(variant, previousKey, next[previousKey]))
      );
      const candidate = bestVariant(compatible);
      if (candidate) DIMENSIONS.slice(index + 1).forEach(({ key: followingKey }) => {
        next[followingKey] = normalizedValue(followingKey, candidate[followingKey]);
      });
    });
    setSelections(next);
  }, [product?.id, defaultVariant?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !product) return;
    const url = new URL(window.location.href);
    DIMENSIONS.forEach(({ key, query }) => {
      const value = selections[key];
      if (value) url.searchParams.set(query, value);
      else url.searchParams.delete(query);
    });
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [selections, product?.id]);

  useEffect(() => {
    if (!product || !selectedVariant) return;
    const variantSKU = selectedVariant.sku || selectedVariant.id || product.sku;
    track('view_item', { value: price, currency: 'UAH', items: [buildItem({ ...product, price }, { variantSKU, size: selections.size, price })] });
    trackMeta('ViewContent', { currency: 'UAH', value: price, content_name: product.name, content_ids: [variantSKU], content_type: 'product' });
  }, [product?.id, selectedVariant?.id]);

  if (!product) return null;

  const selectDimension = (dimensionIndex, value) => {
    const key = DIMENSIONS[dimensionIndex].key;
    setSelections((current) => {
      const next = { ...current, [key]: value };
      const compatible = (product.variants || []).filter((variant) =>
        DIMENSIONS.slice(0, dimensionIndex + 1).every(({ key: previousKey }) => matchesValue(variant, previousKey, next[previousKey]))
      );
      const candidate = bestVariant(compatible);
      if (candidate) DIMENSIONS.slice(dimensionIndex + 1).forEach(({ key: followingKey }) => {
        next[followingKey] = normalizedValue(followingKey, candidate[followingKey]);
      });
      return next;
    });
  };

  const addToCart = () => {
    const variantSKU = selectedVariant?.sku || selectedVariant?.id || product.sku || product.id;
    add({
      productId: product.id,
      variantSKU,
      slug: product.slug,
      name: product.name,
      price,
      image: product.images?.[0],
      size: selections.size || null,
      priceCategory: selections.priceCategory || null,
      liftingMechanism: selections.liftingMechanism || null,
      frameOption: selections.frameOption || null,
      qty: 1,
    });
    track('add_to_cart', { currency: 'UAH', value: price, items: [buildItem({ ...product, price }, { variantSKU, size: selections.size, price, quantity: 1 })] });
    trackMeta('AddToCart', { currency: 'UAH', value: price, contents: [{ id: variantSKU, quantity: 1 }], content_type: 'product' });
    open?.();
  };

  const configuration = DIMENSIONS
    .map(({ key, label }) => selections[key] ? `${label}: ${selections[key]}` : '')
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="bg-milk min-h-screen pb-[82px]">
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-12 py-8 md:py-12">
          <nav className="text-[12px] text-mocha mb-6 flex gap-2 flex-wrap">
            <Link to="/">Головна</Link><span>/</span>
            <Link to={meta.url}>{meta.name}</Link><span>/</span>
            <span className="text-espresso">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-7">
              <ProductGallery
                key={product.id}
                images={product.images || []}
                name={product.imageAlt || product.name}
                salePercent={salePercent}
                activeIndex={activeImage}
                onActiveChange={setActiveImage}
              />
            </div>

            <div className="lg:col-span-5">
              {discounted && <div className="mb-4 inline-flex items-center bg-[#C8643B] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Акція −{salePercent}%</div>}
              <h1 className="font-heading text-[clamp(2.25rem,4vw,3.35rem)] leading-[0.98] tracking-[-0.02em] text-espresso">{product.name}</h1>
              {selectedVariant?.sku && <p className="mt-3 text-[12px] text-mocha">Артикул: {selectedVariant.sku}</p>}

              <div className="mt-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className={`font-heading text-[42px] font-semibold leading-none tabular-nums ${discounted ? 'text-[#C8643B]' : 'text-espresso'}`}>{animatedPrice.toLocaleString('uk-UA')} ₴</span>
                  {discounted && <span className="text-lg text-mocha line-through tabular-nums">{animatedPreviousPrice.toLocaleString('uk-UA')} ₴</span>}
                  {discounted && <span className="bg-[#C8643B]/10 px-2 py-1 text-[11px] font-semibold text-[#A34E2F]">−{salePercent}%</span>}
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-mocha">Ціна автоматично змінюється відповідно до вибраного розміру або варіанта.</p>
              </div>

              <BankInstallmentBlock product={installmentProduct} price={animatedPrice} />

              <div className="mt-8 space-y-7">
                {dimensionOptions.map((dimension, dimensionIndex) => {
                  if (!dimension.values.length) return null;
                  const currentValue = selections[dimension.key];
                  return (
                    <div key={dimension.key}>
                      <p className="mb-3 text-[11px] tracking-[0.22em] uppercase text-mocha">
                        <span className="mr-2 text-[#C08462]">{String(dimensionIndex + 1).padStart(2, '0')}</span>{dimension.label}
                      </p>
                      <div className={dimension.key === 'size' ? 'grid grid-cols-3 sm:grid-cols-4 gap-2' : 'flex flex-wrap gap-2'}>
                        {dimension.values.map((value) => {
                          const active = dimension.key === 'size' ? Boolean(currentValue && sizeMatches(value, currentValue)) : currentValue === value;
                          return <button key={value} type="button" onClick={() => selectDimension(dimensionIndex, value)} className={`ui-radius-sm min-h-11 px-3 py-2 border text-[13px] transition-all ${active ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 bg-white/30 text-espresso hover:border-espresso/50'}`}>{dimension.key === 'priceCategory' ? `Категорія ${value}` : value}</button>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7"><ConsultationMagnet onOpen={() => setConsultationOpen(true)} emphasis compact /></div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${inStock ? 'border-espresso/12 bg-[#F8F2E9] text-espresso' : 'border-clay/25 text-clay'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-espresso' : 'bg-clay'}`} />{inStock ? 'В наявності' : 'Немає в наявності'}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-px border-y border-espresso/10 bg-espresso/10">
                <div className="bg-milk px-4 py-4"><Check className="w-4 h-4 text-espresso"/><p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-mocha">Вибір</p><p className="mt-1 text-[12px] leading-relaxed text-espresso">Варіанти з актуального каталогу</p></div>
                <div className="bg-milk px-4 py-4"><ShieldCheck className="w-4 h-4 text-espresso"/><p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-mocha">Гарантія</p><p className="mt-1 text-[12px] leading-relaxed text-espresso">Умови підтверджуються при оформленні</p></div>
                <div className="bg-milk px-4 py-4"><Truck className="w-4 h-4 text-espresso"/><p className="mt-3 text-[10px] tracking-[0.2em] uppercase text-mocha">Доставка</p><p className="mt-1 text-[12px] leading-relaxed text-espresso">По Україні з узгодженням деталей</p></div>
              </div>
            </div>
          </div>

          {(product.fullDescription || product.shortDescription) && <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12 md:pt-16 grid lg:grid-cols-[0.65fr_1.35fr] gap-8 lg:gap-16"><div><p className="text-[10px] tracking-[0.26em] uppercase text-mocha mb-3">Про товар</p><h2 className="font-heading text-3xl md:text-4xl text-espresso">Характеристики та комфорт</h2></div><div className="text-mocha leading-relaxed whitespace-pre-line max-w-3xl">{product.fullDescription || product.shortDescription}</div></section>}

          {initialRelated.length > 0 && <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12 md:pt-16"><div className="flex items-end justify-between gap-5 mb-10"><div><p className="text-[10px] tracking-[0.26em] uppercase text-mocha mb-3">Ще варіанти</p><h2 className="font-heading text-3xl md:text-4xl text-espresso">Схожі товари</h2></div><Link to={meta.url} className="text-xs uppercase tracking-[0.14em] text-espresso border-b border-espresso/30 pb-1">Усі товари</Link></div><div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">{initialRelated.map((item) => <ProductCard key={item.id || item.slug} product={item} />)}</div></section>}
        </div>
      </main>

      <Footer />

      <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-espresso/10 bg-milk/95 shadow-[0_-10px_35px_rgba(52,33,18,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-12">
          <div className="hidden min-w-0 md:block"><p className="truncate text-[11px] text-mocha">{selections.size ? `${selections.size} · ` : ''}{product.name}</p><div className="mt-0.5 flex items-baseline gap-2"><span className={`font-heading text-[24px] font-semibold tabular-nums ${discounted ? 'text-[#C8643B]' : 'text-espresso'}`}>{animatedPrice.toLocaleString('uk-UA')} ₴</span>{discounted && <span className="text-[12px] text-mocha line-through tabular-nums">{animatedPreviousPrice.toLocaleString('uk-UA')} ₴</span>}</div></div>
          <div className="ml-auto grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:min-w-[360px]">
            <button type="button" onClick={() => setConsultationOpen(true)} className="ui-radius-sm min-h-11 border border-[#C8643B] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C8643B] inline-flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> Дзвінок</button>
            <button type="button" onClick={addToCart} disabled={!price || !inStock} className="ui-radius-sm min-h-11 bg-espresso px-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-milk inline-flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-45">Купити <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <LeadModal open={consultationOpen} onClose={() => setConsultationOpen(false)} leadType="consultation" product={product} context={{ variantSKU: selectedVariant?.sku || selectedVariant?.id || product.sku || product.id, configuration, price }} />
    </div>
  );
}
