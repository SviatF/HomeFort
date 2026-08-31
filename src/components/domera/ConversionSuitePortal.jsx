'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, Plus, Phone, Sparkles, X } from 'lucide-react';
import { Link } from '@/lib/router';
import ProductImage from '@/components/domera/ProductImage';
import LeadModal from '@/components/domera/LeadModal';
import { useCart } from '@/lib/CartContext';
import { buildItem, track, trackMeta } from '@/lib/analytics';
import { sizeMatches } from '@/lib/variant';

const CATEGORY_META = {
  beds: { label: 'Ліжко', plural: 'Ліжка' },
  mattresses: { label: 'Матрац', plural: 'Матраци' },
  toppers: { label: 'Наматрацник', plural: 'Наматрацники' },
  pillows: { label: 'Подушки', plural: 'Подушки' },
  duvets: { label: 'Ковдра', plural: 'Ковдри' },
};

const SIZE_CRITICAL = new Set(['beds', 'mattresses', 'toppers']);
const POPUP_KEY = 'domera_cro_consultation_seen_v2';
const DAY = 24 * 60 * 60 * 1000;

const money = (value) => Number(value || 0).toLocaleString('uk-UA');

function currentSizeFromUrl() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('size') || '';
}

function bestVariant(product = {}, preferredSize = '') {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;

  const exact = preferredSize
    ? variants.filter((variant) => variant.size && sizeMatches(variant.size, preferredSize))
    : [];

  if (preferredSize && SIZE_CRITICAL.has(product.category) && !exact.length) return null;

  const pool = exact.length ? exact : variants;
  const stocked = pool.filter((variant) => variant.availability === 'in_stock');
  return [...(stocked.length ? stocked : pool)]
    .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0] || null;
}

function buildSmartItems(recommendations = {}, pageSize = '') {
  return Object.entries(recommendations)
    .map(([category, products]) => {
      for (const product of products || []) {
        const variant = bestVariant(product, pageSize);
        if (variant && Number(variant.price || product.price || 0) > 0) return { category, product, variant };
      }
      return null;
    })
    .filter(Boolean);
}

function itemHref(item, pageSize) {
  const size = item.variant?.size || '';
  const shouldCarrySize = pageSize && size && sizeMatches(size, pageSize);
  return `/product/${item.product.slug}${shouldCarrySize ? `?size=${encodeURIComponent(size)}` : ''}`;
}

function CrossSellCard({ item, selected, onToggle, pageSize }) {
  const { product, variant, category } = item;
  const price = Number(variant.price || product.price || 0);
  const oldPrice = Number(variant.oldPrice || product.oldPrice || 0);
  const discounted = oldPrice > price && price > 0;
  const label = CATEGORY_META[category]?.label || 'До комплекту';

  return (
    <article className={`group overflow-hidden rounded-[22px] border bg-white/75 transition-all duration-300 ${selected ? 'border-[#C8643B]/55 shadow-[0_16px_45px_rgba(52,33,18,0.09)]' : 'border-espresso/10 hover:border-espresso/25'}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F3ED]">
        {product.images?.[0]
          ? <ProductImage src={product.images[0]} alt={product.imageAlt || product.name} sizes="(max-width: 768px) 80vw, 330px" quality={72} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
          : <div className="flex h-full items-center justify-center text-[12px] text-mocha">Фото готується</div>}
        <span className="absolute left-3 top-3 rounded-full bg-milk/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-espresso shadow-sm">{label}</span>
        <button type="button" onClick={() => onToggle(item)} aria-label={selected ? 'Прибрати з комплекту' : 'Додати до комплекту'} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all ${selected ? 'border-[#C8643B] bg-[#C8643B] text-white' : 'border-espresso/10 bg-milk/95 text-espresso'}`}>
          {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="p-4 md:p-5">
        <Link to={itemHref(item, pageSize)} onClick={() => track('upsell_product_click', { item_id: variant.sku || variant.id || product.id, item_category: category })} className="block">
          <h3 className="font-heading text-[22px] leading-[1.08] text-espresso transition-opacity group-hover:opacity-75">{product.name}</h3>
        </Link>
        {variant.size && <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-mocha">{variant.size}{pageSize && sizeMatches(variant.size, pageSize) ? ' · сумісний розмір' : ''}</p>}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-heading text-[25px] font-semibold text-espresso">{money(price)} ₴</span>
          {discounted && <span className="text-[12px] text-mocha line-through">{money(oldPrice)} ₴</span>}
        </div>
        <button type="button" onClick={() => onToggle(item)} className={`mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-[11px] border px-4 text-[10px] font-semibold uppercase tracking-[0.13em] transition-colors ${selected ? 'border-[#C8643B]/30 bg-[#C8643B]/8 text-[#A95432]' : 'border-espresso/12 text-espresso hover:bg-espresso hover:text-milk'}`}>
          {selected ? <><Check className="h-3.5 w-3.5" /> У комплекті</> : <><Plus className="h-3.5 w-3.5" /> Додати</>}
        </button>
      </div>
    </article>
  );
}

function CrossSellSection({ product, items, pageSize, onConsult }) {
  const { add, open } = useCart();
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (!items.length) return;
    track('upsell_view', {
      source_item_id: product.sku || product.id,
      source_category: product.category,
      selected_size: pageSize || undefined,
      items: items.map(({ product: item, variant }) => buildItem({ ...item, price: variant.price }, { variantSKU: variant.sku || variant.id, size: variant.size, price: variant.price })),
    });
  }, [product.id, pageSize, items.map(({ product: item }) => item.id).join('|')]);

  const toggle = (item) => {
    const key = item.product.id || item.product.slug;
    setSelected((current) => {
      const nextValue = !current[key];
      track('upsell_select', { item_id: item.variant.sku || item.variant.id || key, selected: nextValue, source_category: product.category });
      return { ...current, [key]: nextValue };
    });
  };

  const chosen = items.filter(({ product: item }) => selected[item.id || item.slug]);
  const extraTotal = chosen.reduce((sum, item) => sum + Number(item.variant.price || item.product.price || 0), 0);

  const addChosen = () => {
    if (!chosen.length) return;
    const analyticsItems = [];
    chosen.forEach(({ product: item, variant }) => {
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
        qty: 1,
      });
      analyticsItems.push(buildItem({ ...item, price }, { variantSKU, size: variant.size, price, quantity: 1 }));
      trackMeta('AddToCart', { currency: 'UAH', value: price, contents: [{ id: variantSKU, quantity: 1 }], content_type: 'product' });
    });
    track('upsell_add', { value: extraTotal, source_item_id: product.sku || product.id, source_category: product.category, items: analyticsItems });
    setSelected({});
    open?.();
  };

  if (!items.length) return null;

  const isBed = product.category === 'beds';
  const title = isBed ? 'Зберіть готове спальне місце' : 'Доповніть покупку';
  const eyebrow = isBed ? 'Розумний комплект' : 'Разом з цим товаром';
  const subtitle = isBed
    ? `Ми підібрали товари, які логічно доповнюють ваше ліжко${pageSize ? ` у розмірі ${pageSize}` : ''}. Нічого зайвого — лише сумісні або універсальні позиції.`
    : `До ${product.name} підібрали товари з суміжних категорій${pageSize ? ` з урахуванням розміру ${pageSize}` : ''}.`;

  return (
    <section>
      <div className="grid gap-7 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B56B43]">{eyebrow}</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[0.98] text-espresso">{title}</h2>
          <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-mocha">{subtitle}</p>
        </div>
        <div className="rounded-[18px] border border-espresso/10 bg-[#F6F0E7] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#C8643B]"><Phone className="h-4 w-4" /></div>
            <div><p className="text-[13px] font-semibold text-espresso">Не хочете підбирати вручну?</p><p className="mt-1 text-[11px] leading-relaxed text-mocha">Менеджер збере повний комплект під розмір, бюджет і ваші побажання.</p></div>
          </div>
          <button type="button" onClick={onConsult} className="mt-4 min-h-10 w-full rounded-[11px] border border-[#C8643B]/35 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A95432] transition-colors hover:bg-[#C8643B] hover:text-white">Підібрати комплект</button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => <CrossSellCard key={item.product.id || item.product.slug} item={item} pageSize={pageSize} selected={Boolean(selected[item.product.id || item.product.slug])} onToggle={toggle} />)}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-espresso/10 bg-white/55 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-mocha">Вибрано позицій: <strong className="text-espresso">{chosen.length}</strong></p>
          {chosen.length > 0 && <p className="mt-1 font-heading text-[24px] font-semibold text-espresso">Додатково {money(extraTotal)} ₴</p>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSelected(Object.fromEntries(items.map(({ product: item }) => [item.id || item.slug, true])))} className="min-h-11 rounded-[11px] border border-espresso/15 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-espresso">Вибрати все</button>
          <button type="button" onClick={addChosen} disabled={!chosen.length} className="min-h-11 rounded-[11px] bg-espresso px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-milk disabled:cursor-not-allowed disabled:opacity-35">Додати вибране</button>
        </div>
      </div>
    </section>
  );
}

function PostAddUpsell({ product, items, openState, onClose }) {
  const { add, open } = useCart();
  const [added, setAdded] = useState({});
  if (!openState || !items.length) return null;

  const addItem = (item) => {
    const { product: upsell, variant } = item;
    const key = upsell.id || upsell.slug;
    if (added[key]) return;
    const variantSKU = variant.sku || variant.id || upsell.sku || upsell.id;
    const price = Number(variant.price || upsell.price || 0);
    add({ productId: upsell.id, variantSKU, slug: upsell.slug, name: upsell.name, price, image: upsell.images?.[0], size: variant.size || null, qty: 1 });
    track('post_add_upsell_add', { value: price, source_item_id: product.sku || product.id, items: [buildItem({ ...upsell, price }, { variantSKU, size: variant.size, price, quantity: 1 })] });
    trackMeta('AddToCart', { currency: 'UAH', value: price, contents: [{ id: variantSKU, quantity: 1 }], content_type: 'product' });
    setAdded((current) => ({ ...current, [key]: true }));
  };

  const headline = product.category === 'beds' ? 'Ліжко вже в кошику. Доповнимо спальне місце?' : 'Товар уже в кошику. Додати те, що часто потрібно разом?';

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-espresso/50 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] bg-milk shadow-2xl sm:max-w-[900px] sm:rounded-[26px]">
        <button type="button" onClick={onClose} aria-label="Закрити" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-espresso shadow-sm"><X className="h-4 w-4" /></button>
        <div className="border-b border-espresso/10 p-5 pr-16 sm:p-7 sm:pr-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B56B43]">Наступний крок</p>
          <h3 className="mt-2 font-heading text-[30px] leading-[1.02] text-espresso sm:text-[38px]">{headline}</h3>
          <p className="mt-3 text-[13px] text-mocha">Ми вже врахували вибраний розмір там, де це критично для сумісності.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
          {items.slice(0, 3).map((item) => {
            const key = item.product.id || item.product.slug;
            const price = Number(item.variant.price || item.product.price || 0);
            return <div key={key} className="flex gap-3 rounded-[16px] border border-espresso/10 bg-white/65 p-3 sm:block">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] bg-[#F6F0E7] sm:h-36 sm:w-full">{item.product.images?.[0] && <ProductImage src={item.product.images[0]} alt={item.product.name} sizes="240px" quality={68} className="h-full w-full object-cover" />}</div>
              <div className="min-w-0 flex-1 sm:mt-3"><p className="text-[9px] uppercase tracking-[0.16em] text-mocha">{CATEGORY_META[item.category]?.label}</p><p className="mt-1 line-clamp-2 font-heading text-[18px] leading-[1.05] text-espresso">{item.product.name}</p><p className="mt-2 text-[13px] font-semibold text-espresso">{money(price)} ₴</p><button type="button" onClick={() => addItem(item)} className={`mt-2 min-h-9 rounded-[10px] px-3 text-[9px] font-semibold uppercase tracking-[0.1em] ${added[key] ? 'bg-[#E9E3DA] text-espresso' : 'bg-espresso text-milk'}`}>{added[key] ? 'Додано ✓' : '+ Додати'}</button></div>
            </div>;
          })}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-espresso/10 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-[11px] border border-espresso/15 px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-espresso">Продовжити покупки</button>
          <button type="button" onClick={() => { onClose(); open?.(); }} className="min-h-11 rounded-[11px] bg-espresso px-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-milk">Перейти до кошика <ArrowRight className="ml-2 inline h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

function BehavioralConsultationPopup({ product, openState, onClose, onConsult }) {
  if (!openState) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-espresso/55 p-3 backdrop-blur-md sm:p-6">
      <div className="relative grid max-h-[94vh] w-full max-w-[1040px] overflow-hidden rounded-[26px] bg-milk shadow-[0_35px_100px_rgba(25,15,8,0.35)] md:grid-cols-[0.9fr_1.1fr]">
        <button type="button" onClick={onClose} aria-label="Закрити" className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-milk/90 text-espresso shadow-sm"><X className="h-4 w-4" /></button>
        <div className="relative hidden min-h-[520px] bg-[#EDE6DD] md:block">
          {product.images?.[0] ? <ProductImage src={product.images[0]} alt={product.name} sizes="460px" quality={75} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white"><p className="text-[10px] uppercase tracking-[0.22em] opacity-80">Homefort · персональний підбір</p><p className="mt-2 font-heading text-3xl leading-none">{product.name}</p></div>
        </div>
        <div className="flex min-h-[520px] flex-col justify-center p-6 sm:p-9 md:p-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C8643B]/10 text-[#C8643B]"><Sparkles className="h-5 w-5" /></div>
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B56B43]">Безкоштовна консультація</p>
          <h3 className="mt-3 font-heading text-[clamp(2.25rem,5vw,4rem)] leading-[0.92] text-espresso">Допомогти з вибором?</h3>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mocha">Менеджер допоможе підібрати розмір, комплектацію та суміжні товари під ваш бюджет. Без випадкових рекомендацій і без зобов’язання купувати.</p>
          <div className="mt-6 grid gap-2 text-[13px] text-espresso sm:grid-cols-2">
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-[#C8643B]" /> Підбір сумісних товарів</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-[#C8643B]" /> Розрахунок комплекту</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-[#C8643B]" /> Уточнення наявності</p>
            <p className="flex items-center gap-2"><Check className="h-4 w-4 text-[#C8643B]" /> Варіанти оплати</p>
          </div>
          <button type="button" onClick={onConsult} className="mt-8 flex min-h-13 w-full items-center justify-center gap-3 rounded-[13px] bg-[#C8643B] px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Отримати підбір <ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={onClose} className="mt-3 min-h-10 text-[10px] uppercase tracking-[0.12em] text-mocha">Продовжити перегляд</button>
        </div>
      </div>
    </div>
  );
}

export default function ConversionSuitePortal({ product, recommendations = {} }) {
  const { close } = useCart();
  const [host, setHost] = useState(null);
  const [pageSize, setPageSize] = useState(() => currentSizeFromUrl());
  const [leadOpen, setLeadOpen] = useState(false);
  const [postAddOpen, setPostAddOpen] = useState(false);
  const [consultPopupOpen, setConsultPopupOpen] = useState(false);

  const smartItems = useMemo(() => buildSmartItems(recommendations, pageSize), [recommendations, pageSize]);

  useEffect(() => {
    const container = document.querySelector('main > div');
    if (!container) return undefined;
    const node = document.createElement('div');
    node.setAttribute('data-conversion-suite', 'true');
    node.className = 'mt-16 md:mt-24 border-t border-espresso/10 pt-12 md:pt-16';
    const hero = container.children?.[1];
    if (hero?.after) hero.after(node);
    else container.appendChild(node);
    setHost(node);
    return () => { setHost(null); node.remove(); };
  }, [product.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = currentSizeFromUrl();
      setPageSize((current) => current === next ? current : next);
    }, 350);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!smartItems.length) return undefined;
    const onCartAdd = (event) => {
      const detail = event?.detail || {};
      if (String(detail.productId || '') !== String(product.id || '')) return;
      window.setTimeout(() => close?.(), 0);
      setPostAddOpen(true);
      track('post_add_upsell_view', {
        source_item_id: product.sku || product.id,
        source_category: product.category,
        selected_size: pageSize || undefined,
        items: smartItems.slice(0, 3).map(({ product: item, variant }) => buildItem({ ...item, price: variant.price }, { variantSKU: variant.sku || variant.id, size: variant.size, price: variant.price })),
      });
    };
    window.addEventListener('domera:cart-add', onCartAdd);
    return () => window.removeEventListener('domera:cart-add', onCartAdd);
  }, [product.id, pageSize, smartItems, close]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const seen = Number(localStorage.getItem(POPUP_KEY) || 0);
    if (seen && Date.now() - seen < DAY) return undefined;

    let shown = false;
    const show = (source) => {
      if (shown) return;
      shown = true;
      localStorage.setItem(POPUP_KEY, String(Date.now()));
      setConsultPopupOpen(true);
      track('consultation_popup_view', { item_id: product.sku || product.id, item_category: product.category, source });
    };

    const timer = window.setTimeout(() => show('time_23s'), 23000);
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY / max >= 0.65) show('scroll_65');
    };
    const onMouseOut = (event) => {
      if (window.innerWidth >= 900 && event.clientY <= 3 && !event.relatedTarget) show('exit_intent');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseOut);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [product.id]);

  const openConsult = (source) => {
    setConsultPopupOpen(false);
    setLeadOpen(true);
    track('consultation_open', { item_id: product.sku || product.id, item_category: product.category, source, selected_size: pageSize || undefined });
  };

  return (
    <>
      {host && smartItems.length > 0 && createPortal(<CrossSellSection product={product} items={smartItems} pageSize={pageSize} onConsult={() => openConsult('cross_sell_suite')} />, host)}
      <PostAddUpsell product={product} items={smartItems} openState={postAddOpen} onClose={() => setPostAddOpen(false)} />
      <BehavioralConsultationPopup product={product} openState={consultPopupOpen && !postAddOpen && !leadOpen} onClose={() => setConsultPopupOpen(false)} onConsult={() => openConsult('behavioral_popup')} />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} leadType="consultation" product={product} context={{ source: 'conversion-suite', size: pageSize || null }} />
    </>
  );
}
