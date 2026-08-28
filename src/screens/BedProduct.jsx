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

function normalizeSize(value = '') {
  const match = String(value).toLowerCase().replace(/см/g, '').match(/(\d{2,3})\s*[×хx]\s*(\d{2,3})/);
  return match ? `${Number(match[1])}×${Number(match[2])}` : String(value || '').trim();
}

function uniqueSizes(product) {
  const values = [
    ...(product?.sizes || []),
    ...((product?.variants || []).map((variant) => variant?.size)),
  ]
    .map(normalizeSize)
    .filter(Boolean);
  return [...new Set(values)];
}

function variantForSize(product, size) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;
  if (!size) return variants.find((variant) => variant.availability === 'in_stock') || variants[0];
  const matched = variants.filter((variant) => variant?.size && sizeMatches(variant.size, size));
  return matched.find((variant) => variant.availability === 'in_stock') || matched[0] || null;
}

export default function BedProduct({ initialProduct, initialRelated = [] }) {
  const product = initialProduct;
  const { add, open } = useCart();
  const sizes = useMemo(() => uniqueSizes(product), [product]);
  const defaultVariant = useMemo(
    () => (product?.variants || []).find((variant) => variant.availability === 'in_stock') || product?.variants?.[0] || null,
    [product],
  );
  const [size, setSize] = useState(normalizeSize(defaultVariant?.size || sizes[0] || ''));
  const [activeImage, setActiveImage] = useState(0);
  const selectedVariant = useMemo(() => variantForSize(product, size) || defaultVariant, [product, size, defaultVariant]);

  const price = Number(selectedVariant?.price || product?.price_current || product?.price || 0);
  const previousPrice = Number(selectedVariant?.oldPrice || product?.price_old || product?.oldPrice || 0);
  const discounted = previousPrice > price && price > 0;
  const salePercent = discounted ? Math.round((1 - price / previousPrice) * 100) : 0;
  const inStock = selectedVariant?.availability
    ? selectedVariant.availability === 'in_stock'
    : product?.availability === 'in_stock';

  useEffect(() => {
    if (typeof window === 'undefined' || !product) return;
    const params = new URLSearchParams(window.location.search);
    const querySize = normalizeSize(params.get('size') || '');
    if (querySize && sizes.some((candidate) => sizeMatches(candidate, querySize))) setSize(querySize);
  }, [product?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !product) return;
    const url = new URL(window.location.href);
    if (size) url.searchParams.set('size', size);
    else url.searchParams.delete('size');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [size, product?.id]);

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

  const addToCart = () => {
    const variantSKU = selectedVariant?.sku || selectedVariant?.id || product.sku || product.id;
    add({
      productId: product.id,
      variantSKU,
      slug: product.slug,
      name: product.name,
      price,
      image: selectedVariant?.image || product.images?.[0],
      size,
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
                {sizes.length > 1 && <p className="mt-2 text-sm text-mocha">Ціна автоматично змінюється відповідно до вибраного розміру.</p>}
              </div>

              {sizes.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-[11px] tracking-[0.2em] uppercase text-mocha">Оберіть розмір</p>
                    {size && <span className="text-sm text-espresso font-medium">{size}</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sizes.map((candidate) => {
                      const variant = variantForSize(product, candidate);
                      const active = sizeMatches(candidate, size);
                      const unavailable = variant?.availability === 'out_of_stock';
                      return (
                        <button
                          key={candidate}
                          type="button"
                          onClick={() => {
                            setSize(candidate);
                            track('select_size', { item_id: product.sku || product.id, size: candidate, price: Number(variant?.price || 0) });
                          }}
                          className={`ui-radius-sm min-h-14 px-3 py-2 border text-sm text-left transition-all ${active ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 text-espresso hover:border-espresso/50'} ${unavailable ? 'opacity-50' : ''}`}
                        >
                          <span className="block font-medium">{candidate}</span>
                          {variant?.price > 0 && <span className={`block mt-1 text-xs ${active ? 'text-milk/70' : 'text-mocha'}`}>{Number(variant.price).toLocaleString('uk-UA')} ₴</span>}
                        </button>
                      );
                    })}
                  </div>
                  {size && (
                    <Link to={`/catalog/beds/${sizeToSlug(size)}`} className="mt-4 inline-flex items-center gap-2 text-xs text-mocha underline underline-offset-4">
                      Дивитись усі ліжка {size} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
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
                <div className="bg-milk px-4 py-4 flex gap-3 items-start"><Check className="w-4 h-4 mt-0.5 text-espresso"/><div><p className="text-xs font-semibold text-espresso">Актуальна ціна</p><p className="text-[11px] text-mocha mt-1">Для вибраного розміру</p></div></div>
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
