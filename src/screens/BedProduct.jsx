'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { ShoppingBag, Check, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import ProductGallery from '@/components/domera/ProductGallery';
import ProductCard from '@/components/domera/ProductCard';
import { useCart } from '@/lib/CartContext';
import { track, buildItem, trackMeta } from '@/lib/analytics';
import { sizeMatches, sizeToSlug } from '@/lib/variant';

const DIMENSIONS = [
  { key: 'size', label: 'Розмір', query: 'size' },
  { key: 'priceCategory', label: 'Категорія', query: 'category' },
  { key: 'liftingMechanism', label: 'Підйомний механізм', query: 'lift' },
  { key: 'frameOption', label: 'Основа / каркас', query: 'frame' },
];

function normalizeSize(value = '') {
  const match = String(value).toLowerCase().replace(/см/g, '').match(/(\d{2,3})\s*[×хx]\s*(\d{2,3})/);
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

  const values = variants.map((variant) => normalizedValue(key, variant?.[key])).filter(Boolean);
  return [...new Set(values)];
}

function findSelectedVariant(product, selections) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const matches = variants.filter((variant) => DIMENSIONS.every(({ key }) => matchesValue(variant, key, selections?.[key])));
  return bestVariant(matches) || bestVariant(variants);
}

export default function BedProduct({ initialProduct, initialRelated = [] }) {
  const product = initialProduct;
  const { add, open } = useCart();
  const defaultVariant = useMemo(() => bestVariant(product?.variants || []), [product]);
  const [selections, setSelections] = useState(() => selectionFromVariant(defaultVariant));
  const [activeImage, setActiveImage] = useState(0);
  const selectedVariant = useMemo(() => findSelectedVariant(product, selections), [product, selections]);

  const price = Number(selectedVariant?.price || product?.price_current || product?.price || 0);
  const previousPrice = Number(selectedVariant?.oldPrice || product?.price_old || product?.oldPrice || 0);
  const discounted = previousPrice > price && price > 0;
  const salePercent = discounted ? Math.round((1 - price / previousPrice) * 100) : 0;
  const inStock = selectedVariant?.availability
    ? selectedVariant.availability === 'in_stock'
    : product?.availability === 'in_stock';
  const size = selections.size || '';

  const dimensionOptions = useMemo(
    () => DIMENSIONS.map((dimension, index) => ({ ...dimension, values: valuesForDimension(product, selections, index) })),
    [product, selections],
  );

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
        DIMENSIONS.slice(0, index + 1).every(({ key: previousKey }) => matchesValue(variant, previousKey, next[previousKey])),
      );
      const candidate = bestVariant(compatible);
      if (candidate) {
        DIMENSIONS.slice(index + 1).forEach(({ key: followingKey }) => {
          next[followingKey] = normalizedValue(followingKey, candidate[followingKey]);
        });
      }
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
    track('view_item', {
      value: price,
      currency: 'UAH',
      items: [buildItem({ ...product, price }, { variantSKU: selectedVariant.sku || selectedVariant.id, size, price })],
    });
    trackMeta('ViewContent', {
      currency: 'UAH',
      value: price,
      content_name: product.name,
      content_ids: [selectedVariant.sku || selectedVariant.id || product.sku],
      content_type: 'product',
    });
  }, [product?.id, selectedVariant?.id]);

  if (!product) return null;

  const selectDimension = (dimensionIndex, value) => {
    const key = DIMENSIONS[dimensionIndex].key;
    setSelections((current) => {
      const next = { ...current, [key]: value };
      const compatible = (product.variants || []).filter((variant) =>
        DIMENSIONS.slice(0, dimensionIndex + 1).every(({ key: previousKey }) => matchesValue(variant, previousKey, next[previousKey])),
      );
      const candidate = bestVariant(compatible);
      if (candidate) {
        DIMENSIONS.slice(dimensionIndex + 1).forEach(({ key: followingKey }) => {
          next[followingKey] = normalizedValue(followingKey, candidate[followingKey]);
        });
      }
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
      size,
      priceCategory: selections.priceCategory || null,
      liftingMechanism: selections.liftingMechanism || null,
      frameOption: selections.frameOption || null,
      qty: 1,
    });
    track('add_to_cart', {
      currency: 'UAH',
      value: price,
      items: [buildItem({ ...product, price }, { variantSKU, size, price, quantity: 1 })],
    });
    trackMeta('AddToCart', {
      currency: 'UAH',
      value: price,
      contents: [{ id: variantSKU, quantity: 1 }],
      content_type: 'product',
    });
    open?.();
  };

  return (
    <div className="bg-milk min-h-screen">
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-12 py-8 md:py-12">
          <nav className="text-[12px] text-mocha mb-6 flex gap-2 flex-wrap">
            <Link to="/">Головна</Link><span>/</span>
            <Link to="/catalog/beds">Ліжка</Link><span>/</span>
            <span className="text-espresso">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
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

            <div className="lg:col-span-5 lg:sticky lg:top-[104px]">
              <p className="text-[10px] tracking-[0.26em] uppercase text-mocha mb-3">DOMERA · HOMEFORT</p>
              <h1 className="font-heading text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] text-espresso">{product.name}</h1>

              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-2 text-[12px] px-3 py-2 border ${inStock ? 'border-espresso/15 text-espresso' : 'border-clay/30 text-clay'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-espresso' : 'bg-clay'}`} />
                  {inStock ? 'В наявності' : 'Немає в наявності'}
                </span>
                {selectedVariant?.sku && <span className="text-xs text-mocha">Артикул: {selectedVariant.sku}</span>}
              </div>

              <div className="mt-7">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className={`font-heading text-[42px] leading-none ${discounted ? 'text-[#C8643B]' : 'text-espresso'}`}>{price.toLocaleString('uk-UA')} ₴</span>
                  {discounted && <span className="text-lg text-mocha line-through">{previousPrice.toLocaleString('uk-UA')} ₴</span>}
                </div>
                {(product.variants || []).length > 1 && <p className="mt-2 text-sm text-mocha">Ціна автоматично змінюється відповідно до вибраної комплектації.</p>}
              </div>

              <div className="mt-8 space-y-7">
                {dimensionOptions.map((dimension, dimensionIndex) => {
                  if (!dimension.values.length) return null;
                  const currentValue = selections[dimension.key];
                  return (
                    <div key={dimension.key}>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-[11px] tracking-[0.2em] uppercase text-mocha">{dimension.label}</p>
                        {currentValue && <span className="text-sm text-espresso font-medium">{currentValue}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dimension.values.map((value) => {
                          const active = dimension.key === 'size'
                            ? Boolean(currentValue && sizeMatches(value, currentValue))
                            : currentValue === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => selectDimension(dimensionIndex, value)}
                              className={`ui-radius-sm min-h-12 px-4 py-2 border text-sm transition-all ${active ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 text-espresso hover:border-espresso/50'}`}
                            >
                              {dimension.key === 'priceCategory' ? `Категорія ${value}` : value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {size && (
                <Link to={`/catalog/beds/${sizeToSlug(size)}`} className="mt-5 inline-flex items-center gap-2 text-xs text-mocha underline underline-offset-4">
                  Дивитись усі ліжка {size} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <button
                type="button"
                onClick={addToCart}
                disabled={!price || !inStock}
                className="ui-action ui-radius-sm mt-8 w-full min-h-14 inline-flex items-center justify-center gap-3 text-[13px] uppercase tracking-[0.14em] font-semibold disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {inStock ? 'Додати у кошик' : 'Немає в наявності'}
              </button>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-px bg-espresso/10 border border-espresso/10">
                <div className="bg-milk px-4 py-4 flex gap-3 items-start"><Check className="w-4 h-4 mt-0.5 text-espresso"/><div><p className="text-xs font-semibold text-espresso">Точна ціна</p><p className="text-[11px] text-mocha mt-1">Для вибраного варіанта</p></div></div>
                <div className="bg-milk px-4 py-4 flex gap-3 items-start"><Truck className="w-4 h-4 mt-0.5 text-espresso"/><div><p className="text-xs font-semibold text-espresso">Доставка</p><p className="text-[11px] text-mocha mt-1">По Україні</p></div></div>
                <div className="bg-milk px-4 py-4 flex gap-3 items-start"><ShieldCheck className="w-4 h-4 mt-0.5 text-espresso"/><div><p className="text-xs font-semibold text-espresso">Homefort</p><p className="text-[11px] text-mocha mt-1">Оригінальна модель</p></div></div>
              </div>
            </div>
          </div>

          {(product.fullDescription || product.shortDescription) && (
            <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12 md:pt-16 grid lg:grid-cols-[0.65fr_1.35fr] gap-8 lg:gap-16">
              <div>
                <p className="text-[10px] tracking-[0.26em] uppercase text-mocha mb-3">Про модель</p>
                <h2 className="font-heading text-3xl md:text-4xl text-espresso">Характер і комфорт</h2>
              </div>
              <div className="text-mocha leading-relaxed whitespace-pre-line max-w-3xl">{product.fullDescription || product.shortDescription}</div>
            </section>
          )}

          {initialRelated.length > 0 && (
            <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12 md:pt-16">
              <div className="flex items-end justify-between gap-5 mb-10">
                <div>
                  <p className="text-[10px] tracking-[0.26em] uppercase text-mocha mb-3">Ще моделі</p>
                  <h2 className="font-heading text-3xl md:text-4xl text-espresso">Схожі ліжка</h2>
                </div>
                <Link to="/catalog/beds" className="text-xs uppercase tracking-[0.14em] text-espresso border-b border-espresso/30 pb-1">Усі ліжка</Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {initialRelated.map((item) => <ProductCard key={item.id || item.slug} product={item} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
