'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { Heart, ChevronLeft, ChevronRight, ArrowUpRight, GitCompare, Phone } from 'lucide-react';
import { track, buildItem } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { useCompare } from '@/lib/CompareContext';
import ProductImage from '@/components/domera/ProductImage';
import LeadModal from '@/components/domera/LeadModal';
import { DiscountBadge } from '@/components/domera/ProductPromoExperience';
import { currentPrice, isDiscountActive, oldPrice } from '@/lib/product-promo';
import { bankInstallmentOptions } from '@/lib/installment';

const BANK_LOGOS = {
  monobank: { src: '/mono.png', alt: 'monobank' },
  privatbank: { src: '/pryvat.png', alt: 'ПриватБанк' },
  pumb: { src: '/pymb.png', alt: 'ПУМБ' },
};

function cleanName(name = '') {
  return String(name)
    .replace(/^Ліжко\s+м['’]?яке\s+/i, '')
    .replace(/^Ліжко\s+/i, '')
    .replace(/^Homefort\s*/i, '')
    .trim();
}

function fabricVisuals(product) {
  const fabrics = Array.isArray(product.fabrics) ? product.fabrics : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const rich = fabrics.filter((f) => f && typeof f === 'object' && (f.image || f.color)).map((f) => ({
    name: f.name || f.label || 'Тканина', color: f.color || '', image: f.image || f.macroImage || '',
  }));
  if (rich.length) return rich.slice(0, 5);
  return colors.filter(Boolean).slice(0, 5).map((c) => ({ name: String(c), color: String(c), image: '' }));
}

export default function ProductCard({ product, dark = false }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  const compare = useCompare();
  const inCompare = compare.has(product.id);
  const images = useMemo(() => (product.images || []).filter(Boolean), [product.images]);
  const [imageIndex, setImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [consultationOpen, setConsultationOpen] = useState(false);
  const usableImages = useMemo(() => images.filter((src) => !failedImages.has(src)), [images, failedImages]);
  const activeImage = usableImages[imageIndex] || usableImages[0] || '';
  const hasGallery = usableImages.length > 1;
  const title = cleanName(product.name);
  const swatches = useMemo(() => fabricVisuals(product), [product]);
  const availability = product.availability === 'in_stock' ? 'В наявності' : product.productionTime ? `Виготовлення ${product.productionTime}` : 'Немає в наявності';
  const price = currentPrice(product);
  const previousPrice = oldPrice(product);
  const discounted = isDiscountActive(product);
  const savings = discounted && previousPrice > price ? Number(previousPrice) - Number(price) : 0;

  // Розстрочка має бути доступною на кожній картці. Для каталогу показуємо
  // всі три банки незалежно від того, чи були legacy-прапорці в імпортованому товарі.
  const installmentOptions = useMemo(() => bankInstallmentOptions({
    ...product,
    installment_enabled: true,
    monobank_enabled: true,
    privatbank_enabled: true,
    pumb_enabled: true,
  }, price), [product, price]);
  const monthlyValues = installmentOptions.map((bank) => Number(bank.monthly || 0)).filter((value) => value > 0);
  const monthValues = installmentOptions.map((bank) => Number(bank.months || 0)).filter((value) => value > 0);
  const monthlyFrom = monthlyValues.length ? Math.min(...monthlyValues) : 0;
  const maxMonths = monthValues.length ? Math.max(...monthValues) : 0;

  useEffect(() => {
    setFailedImages(new Set());
    setImageIndex(0);
  }, [product.id, product.slug]);

  useEffect(() => {
    if (imageIndex >= usableImages.length) setImageIndex(0);
  }, [imageIndex, usableImages.length]);

  const rememberScroll = () => {
    try { sessionStorage.setItem(`domera-scroll:${window.location.pathname}`, String(window.scrollY)); } catch {}
  };

  const goToImage = (step) => {
    if (!hasGallery) return;
    setImageIndex((current) => (current + step + usableImages.length) % usableImages.length);
  };

  const handleImageError = () => {
    if (!activeImage) return;
    setFailedImages((current) => {
      const next = new Set(current);
      next.add(activeImage);
      return next;
    });
    setImageIndex(0);
  };

  return (
    <>
      <article className={`product-card-shell group ${dark ? 'text-milk' : 'text-espresso'}`}>
        <div className="product-card-media relative overflow-hidden">
          <Link to={`/product/${product.slug}`} onClick={() => { rememberScroll(); track('select_item', { items: [buildItem({ ...product, price })] }); }} className="block h-full" data-tap-target="true">
            {activeImage ? (
              <ProductImage src={activeImage} alt={product.imageAlt || product.name} sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 28vw" quality={60} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.018]" onError={handleImageError} />
            ) : (
              <div className="w-full h-full bg-sand flex items-center justify-center text-[13px] text-mocha">Фото готується</div>
            )}
          </Link>

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
            <div className="flex flex-col items-start gap-1.5 max-w-[72%]">
              {discounted ? <DiscountBadge product={product} compact /> : <span className="product-status-badge">{availability}</span>}
              {discounted && <span className="product-status-badge">{availability}</span>}
            </div>
            <div className="pointer-events-auto flex gap-2">
              <button type="button" aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ productId: product.id, slug: product.slug, name: product.name, price, image: usableImages[0] || images[0] }); track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem({ ...product, price })] }); }} className="ui-radius-sm w-11 h-11 bg-milk/95 backdrop-blur-md flex items-center justify-center text-espresso"><Heart className="w-[18px] h-[18px]" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.45} /></button>
              <button type="button" aria-label="Порівняти" onClick={(e)=>{e.preventDefault();e.stopPropagation();compare.toggle({ ...product, price });track(inCompare?'compare_remove':'compare_add',{item_id:product.sku});}} className={`ui-radius-sm w-11 h-11 backdrop-blur-md flex items-center justify-center ${inCompare ? 'bg-espresso text-milk' : 'bg-milk/95 text-espresso'}`}><GitCompare className="w-[18px] h-[18px]" strokeWidth={1.45}/></button>
            </div>
          </div>

          {hasGallery && <>
            <button type="button" aria-label="Попереднє фото" onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(-1); }} className="ui-radius-sm absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-milk/92 text-espresso flex items-center justify-center md:opacity-0 md:group-hover:opacity-100"><ChevronLeft className="w-4 h-4" /></button>
            <button type="button" aria-label="Наступне фото" onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(1); }} className="ui-radius-sm absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-milk/92 text-espresso flex items-center justify-center md:opacity-0 md:group-hover:opacity-100"><ChevronRight className="w-4 h-4" /></button>
          </>}
        </div>

        <div className="p-3.5 md:p-5">
          <Link to={`/product/${product.slug}`} className="block" data-tap-target="true">
            <h3 className="font-heading text-[22px] md:text-[25px] leading-[1.08] text-espresso">{title}</h3>
          </Link>
          {product.reviewsCount > 0 && <div className="mt-2 text-[13px] text-mocha">★ {product.rating || 5} · {product.reviewsCount}</div>}

          <div className={`mt-3 ${discounted ? 'rounded-[16px] border border-[#C8643B]/20 bg-[#C8643B]/[0.055] px-3 py-2.5' : ''}`}>
            {discounted && <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A34E2F]"><span>Акційна ціна</span>{savings > 0 && <span>Економія {savings.toLocaleString('uk-UA')} ₴</span>}</div>}
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
              <span className={`product-card-price font-heading ${discounted ? 'text-[#B44E2C]' : 'text-espresso'}`}>{product.priceFrom ? 'від ' : ''}{price.toLocaleString('uk-UA')} ₴</span>
              {discounted && previousPrice > price && <span className="text-[13px] line-through text-mocha">{Number(previousPrice).toLocaleString('uk-UA')} ₴</span>}
            </div>
          </div>

          {installmentOptions.length > 0 && (
            <div className="mt-3 rounded-[16px] border border-espresso/[0.09] bg-[#FBF8F3] px-3 py-3" aria-label="Оплата частинами">
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9A6A50]">Розстрочка</p>
                  {monthlyFrom > 0 && <p className="mt-0.5 whitespace-nowrap text-[13px] font-semibold leading-tight text-espresso">від {monthlyFrom.toLocaleString('uk-UA')} ₴/міс</p>}
                </div>
                {maxMonths > 0 && <span className="shrink-0 text-[10px] text-mocha">до {maxMonths} платежів</span>}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5" aria-label="Банки-партнери">
                {installmentOptions.map((bank) => {
                  const logo = BANK_LOGOS[bank.id];
                  if (!logo) return null;
                  return (
                    <div key={bank.id} className="flex h-8 min-w-0 items-center justify-center rounded-[9px] border border-espresso/[0.07] bg-white px-1.5">
                      <img src={logo.src} alt={logo.alt} loading="lazy" className="max-h-[18px] max-w-full w-auto object-contain" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {swatches.length > 0 && <div className="mt-3"><p className="text-[13px] text-mocha mb-2">Тканини / кольори</p><div className="flex gap-2" aria-label="Доступні кольори тканини">{swatches.map((s, i) => <span key={`${s.name}-${i}`} title={s.name} className="fabric-dot" style={s.image ? { backgroundImage: `url(${s.image})`, backgroundSize: 'cover' } : { background: s.color }} />)}</div></div>}

          <button type="button" onClick={() => { setConsultationOpen(true); track('consultation_open', { item_id: product.sku || product.id, source: 'product_card' }); }} className="mt-3 flex w-full items-center justify-between gap-2 rounded-[13px] border border-espresso/[0.10] px-3 py-2.5 text-left transition-colors hover:border-[#C8643B]/35 hover:bg-[#C8643B]/[0.045]" data-tap-target="true">
            <span className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C8643B]/10 text-[#B44E2C]"><Phone className="h-3.5 w-3.5" strokeWidth={1.6} /></span><span className="min-w-0"><span className="block text-[11px] font-semibold leading-tight text-espresso">Потрібна консультація?</span><span className="mt-0.5 block text-[10px] leading-tight text-mocha">Допоможемо з розміром і комплектацією</span></span></span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-mocha" strokeWidth={1.5} />
          </button>

          <Link to={`/product/${product.slug}`} onClick={() => { rememberScroll(); track('select_item', { items: [buildItem({ ...product, price })] }); }} className="ui-action ui-radius-sm mt-3 w-full inline-flex items-center justify-center gap-2 px-4 text-[13px] uppercase tracking-[0.12em] font-semibold" data-tap-target="true">
            <span>Обрати комплектацію</span><ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </article>

      <LeadModal
        open={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        leadType="consultation"
        product={product}
        context={{ price }}
      />
    </>
  );
}
