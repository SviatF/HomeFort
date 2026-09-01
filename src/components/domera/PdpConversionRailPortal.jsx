'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, MapPin, PackageCheck, Phone, Truck } from 'lucide-react';
import LeadModal from '@/components/domera/LeadModal';
import { useCart } from '@/lib/CartContext';
import { buildItem, track, trackMeta, trackPromotion } from '@/lib/analytics';
import { sizeMatches } from '@/lib/variant';

const money = (value) => Number(value || 0).toLocaleString('uk-UA');
const SIZE_CRITICAL = new Set(['beds', 'mattresses', 'toppers']);

function selectedVariantFromSearch(product = {}, search = '') {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;

  const params = new URLSearchParams(search || '');
  const wanted = {
    size: params.get('size') || '',
    priceCategory: params.get('category') || '',
    liftingMechanism: params.get('lift') || '',
    frameOption: params.get('frame') || '',
  };

  const matches = variants.filter((variant) => {
    if (wanted.size && (!variant.size || !sizeMatches(variant.size, wanted.size))) return false;
    if (wanted.priceCategory && String(variant.priceCategory || '') !== String(wanted.priceCategory)) return false;
    if (wanted.liftingMechanism && String(variant.liftingMechanism || '') !== String(wanted.liftingMechanism)) return false;
    if (wanted.frameOption && String(variant.frameOption || '') !== String(wanted.frameOption)) return false;
    return true;
  });

  const pool = matches.length ? matches : variants;
  const stocked = pool.filter((variant) => variant.availability === 'in_stock');
  return [...(stocked.length ? stocked : pool)].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0] || null;
}

function bestAccessoryVariant(product = {}, preferredSize = '') {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;

  const exact = preferredSize
    ? variants.filter((variant) => variant.size && sizeMatches(variant.size, preferredSize))
    : [];

  if (preferredSize && SIZE_CRITICAL.has(product.category) && !exact.length) return null;
  const pool = exact.length ? exact : variants;
  const stocked = pool.filter((variant) => variant.availability === 'in_stock');
  return [...(stocked.length ? stocked : pool)].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0] || null;
}

function firstCompatible(products = [], preferredSize = '') {
  for (const product of products || []) {
    const variant = bestAccessoryVariant(product, preferredSize);
    if (variant && Number(variant.price || product.price || 0) > 0) return { product, variant };
  }
  return null;
}

function configurationText(variant = {}) {
  return [
    variant.size ? `Розмір: ${variant.size}` : '',
    variant.priceCategory ? `Категорія: ${variant.priceCategory}` : '',
    variant.liftingMechanism ? `ПМ: ${variant.liftingMechanism}` : '',
    variant.frameOption ? `Основа: ${variant.frameOption}` : '',
  ].filter(Boolean).join(' · ');
}

function BundleRow({ label, item }) {
  if (!item) return null;
  const { product, variant } = item;
  const price = Number(variant.price || product.price || 0);
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[9px] bg-[#F3ECE3]">
        {product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-mocha">{label}</p>
        <p className="truncate text-[12px] font-medium text-espresso">{product.name}</p>
        {variant.size && <p className="mt-0.5 text-[10px] text-mocha">{variant.size}</p>}
      </div>
      <span className="shrink-0 text-[12px] font-semibold text-espresso">{money(price)} ₴</span>
    </div>
  );
}

export default function PdpConversionRailPortal({ product, recommendations = {} }) {
  const { add, open } = useCart();
  const [host, setHost] = useState(null);
  const [search, setSearch] = useState(() => (typeof window !== 'undefined' ? window.location.search : ''));
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [city, setCity] = useState('');
  const [deliveryResult, setDeliveryResult] = useState('');

  useEffect(() => {
    const column = document.querySelector('main .lg\\:col-span-5');
    if (!column) return undefined;
    const node = document.createElement('div');
    node.setAttribute('data-pdp-conversion-rail', 'true');
    node.className = 'mt-5';
    const installment = column.querySelector('section[aria-label="Оплата частинами"]');
    if (installment?.after) installment.after(node);
    else column.prepend(node);
    setHost(node);
    return () => {
      setHost(null);
      node.remove();
    };
  }, [product?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = window.location.search;
      setSearch((current) => current === next ? current : next);
    }, 300);
    return () => window.clearInterval(timer);
  }, []);

  const selectedVariant = useMemo(() => selectedVariantFromSearch(product, search), [product, search]);
  const selectedSize = selectedVariant?.size || new URLSearchParams(search || '').get('size') || '';
  const currentPrice = Number(selectedVariant?.price || product?.price_current || product?.price || 0);
  const currentOldPrice = Number(selectedVariant?.oldPrice || product?.price_old || product?.oldPrice || 0);
  const currentSku = selectedVariant?.sku || selectedVariant?.id || product?.sku || product?.id;
  const configuration = configurationText(selectedVariant || {});

  const mattress = useMemo(() => firstCompatible(recommendations.mattresses || [], selectedSize), [recommendations.mattresses, selectedSize]);
  const topper = useMemo(() => firstCompatible(recommendations.toppers || [], selectedSize), [recommendations.toppers, selectedSize]);

  const sourceItem = useMemo(() => ({
    product,
    variant: {
      ...(selectedVariant || {}),
      sku: currentSku,
      price: currentPrice,
      oldPrice: currentOldPrice,
      size: selectedSize || selectedVariant?.size || null,
    },
  }), [product, selectedVariant, currentSku, currentPrice, currentOldPrice, selectedSize]);

  const bundleAccessories = useMemo(() => [mattress, topper].filter(Boolean), [mattress, topper]);
  const bundleItems = useMemo(() => [sourceItem, ...bundleAccessories], [sourceItem, bundleAccessories]);
  const bundleTotal = bundleItems.reduce((sum, item) => sum + Number(item.variant?.price || item.product?.price || 0), 0);
  const bundleOldTotal = bundleItems.reduce((sum, item) => {
    const price = Number(item.variant?.price || item.product?.price || 0);
    const old = Number(item.variant?.oldPrice || item.product?.oldPrice || 0);
    return sum + (old > price ? old : price);
  }, 0);
  const bundleSavings = Math.max(0, Math.round(bundleOldTotal - bundleTotal));

  useEffect(() => {
    if (!host || product?.category !== 'beds' || !bundleAccessories.length) return;
    track('view_promotion', {
      promotion_id: 'pdp_smart_bundle',
      promotion_name: 'Комплект під ваше ліжко',
      creative_slot: 'pdp_buybox',
      value: bundleTotal,
      items: bundleItems.map(({ product: item, variant }) => buildItem({ ...item, price: variant.price, oldPrice: variant.oldPrice }, {
        variantSKU: variant.sku || variant.id,
        size: variant.size,
        price: variant.price,
        oldPrice: variant.oldPrice,
      })),
    });
  }, [host, product?.id, selectedSize, bundleAccessories.length]);

  const addBundle = () => {
    if (!bundleItems.length || !currentPrice) return;
    const analyticsItems = bundleItems.map(({ product: item, variant }) => {
      const variantSKU = variant.sku || variant.id || item.sku || item.id;
      const price = Number(variant.price || item.price || 0);
      add({
        productId: item.id,
        variantSKU,
        slug: item.slug,
        name: item.name,
        price,
        image: item.images?.[0],
        size: variant.size || null,
        priceCategory: variant.priceCategory || null,
        liftingMechanism: variant.liftingMechanism || null,
        frameOption: variant.frameOption || null,
        qty: 1,
        suppressUpsell: true,
      });
      return buildItem({ ...item, price, oldPrice: variant.oldPrice }, {
        variantSKU,
        size: variant.size,
        price,
        oldPrice: variant.oldPrice,
        quantity: 1,
      });
    });

    trackPromotion({
      id: 'pdp_smart_bundle',
      name: 'Комплект під ваше ліжко',
      locationId: 'pdp_buybox',
      items: analyticsItems,
      value: bundleTotal,
    });
    track('add_to_cart', { value: bundleTotal, items: analyticsItems });
    trackMeta('AddToCart', {
      currency: 'UAH',
      value: bundleTotal,
      contents: analyticsItems.map((item) => ({ id: item.item_id, quantity: item.quantity || 1 })),
      content_type: 'product',
    });
    open?.();
  };

  const calculateDelivery = (event) => {
    event.preventDefault();
    const normalizedCity = city.trim();
    if (!normalizedCity) return;
    const freeDelivery = currentPrice >= 30000;
    setDeliveryResult(
      freeDelivery
        ? `Для замовлень від 30 000 ₴ на сайті діє безкоштовна доставка. Спосіб доставки до ${normalizedCity} підтвердить менеджер.`
        : `До ${normalizedCity} доставляємо Новою Поштою або погодженою логістикою. Точну вартість і термін менеджер підтвердить перед оформленням.`,
    );
    track('delivery_calculator', {
      city: normalizedCity,
      item_id: currentSku,
      item_category: product?.category,
      value: currentPrice,
      free_delivery_threshold_reached: freeDelivery,
    });
  };

  const leadContext = {
    variantSKU: currentSku,
    configuration,
    price: currentPrice,
  };

  const consultationContext = {
    ...leadContext,
    configuration: [configuration, city.trim() ? `Доставка: ${city.trim()}` : ''].filter(Boolean).join(' · '),
  };

  if (!host) return null;

  return createPortal(
    <>
      <div className="rounded-[20px] border border-espresso/10 bg-white/65 p-4 shadow-[0_8px_28px_rgba(52,33,18,0.045)] md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B56B43]">Швидке оформлення</p>
            <p className="mt-1.5 text-[13px] font-semibold text-espresso">Без довгих форм і реєстрації</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5E4D1]/70 text-[#A95432]"><Phone className="h-4 w-4" /></div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => { setOneClickOpen(true); track('one_click_open', { item_id: currentSku, value: currentPrice }); }} className="ui-radius-sm flex min-h-12 items-center justify-center gap-2 bg-[#C8643B] px-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#B65734]">
            Купити в 1 клік <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setDeliveryOpen((current) => !current)} className="ui-radius-sm flex min-h-12 items-center justify-center gap-2 border border-espresso/15 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-espresso transition-colors hover:border-espresso/35">
            <MapPin className="h-3.5 w-3.5" /> Розрахувати доставку
          </button>
        </div>

        {deliveryOpen && (
          <form onSubmit={calculateDelivery} className="mt-4 rounded-[14px] border border-espresso/8 bg-[#F8F3EC] p-3.5">
            <label className="text-[9px] font-semibold uppercase tracking-[0.16em] text-mocha">Ваше місто</label>
            <div className="mt-2 flex gap-2">
              <input value={city} onChange={(e) => { setCity(e.target.value); setDeliveryResult(''); }} placeholder="Наприклад, Львів" autoComplete="address-level2" className="min-w-0 flex-1 rounded-[10px] border border-espresso/12 bg-white px-3 py-2.5 text-[12px] text-espresso outline-none focus:border-espresso/35" />
              <button type="submit" disabled={!city.trim()} className="rounded-[10px] bg-espresso px-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-milk disabled:opacity-35">Порахувати</button>
            </div>
            {deliveryResult && (
              <div className="mt-3 border-t border-espresso/8 pt-3">
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-mocha"><Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A95432]" />{deliveryResult}</p>
                <button type="button" onClick={() => setConsultOpen(true)} className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A95432] underline underline-offset-4">Уточнити у менеджера</button>
              </div>
            )}
          </form>
        )}
      </div>

      {product?.category === 'beds' && bundleAccessories.length > 0 && (
        <div className="mt-3 rounded-[20px] border border-[#d9c7b8] bg-[#F8F3EC] p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B56B43]">Smart bundle</p>
              <h3 className="mt-1 font-heading text-[22px] leading-tight text-espresso">Комплект під ваше ліжко</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-mocha">Підібрано під {selectedSize || 'обрану комплектацію'}.</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#A95432]"><PackageCheck className="h-4 w-4" /></div>
          </div>

          <div className="mt-3 divide-y divide-espresso/8">
            <BundleRow label="Ліжко" item={sourceItem} />
            <BundleRow label="Матрац" item={mattress} />
            <BundleRow label="Наматрацник" item={topper} />
          </div>

          <div className="mt-3 flex items-end justify-between gap-4 border-t border-espresso/10 pt-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.14em] text-mocha">Комплект разом</p>
              <p className="mt-1 font-heading text-[25px] font-semibold text-espresso">{money(bundleTotal)} ₴</p>
              {bundleSavings > 0 && <p className="mt-0.5 text-[10px] font-semibold text-[#456b49]">Економія за поточними акціями {money(bundleSavings)} ₴</p>}
            </div>
            <span className="hidden items-center gap-1.5 text-[10px] text-mocha sm:flex"><Check className="h-3.5 w-3.5 text-[#456b49]" /> сумісний розмір</span>
          </div>

          <button type="button" onClick={addBundle} className="ui-radius-sm mt-4 flex min-h-12 w-full items-center justify-center gap-2 bg-espresso px-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-milk transition-colors hover:bg-espresso-soft">
            Додати комплект у кошик <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <LeadModal open={oneClickOpen} onClose={() => setOneClickOpen(false)} leadType="one_click" product={product} context={leadContext} />
      <LeadModal open={consultOpen} onClose={() => setConsultOpen(false)} leadType="consultation" product={product} context={consultationContext} />
    </>,
    host,
  );
}
