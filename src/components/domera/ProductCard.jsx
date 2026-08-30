'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { Heart, ChevronLeft, ChevronRight, ArrowUpRight, GitCompare } from 'lucide-react';
import { track, buildItem } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { useCompare } from '@/lib/CompareContext';
import ProductImage from '@/components/domera/ProductImage';
import { DiscountBadge } from '@/components/domera/ProductPromoExperience';
import { currentPrice, isDiscountActive, oldPrice } from '@/lib/product-promo';

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

function AvailabilityBadge({ children }) {
  return (
    <span className="inline-flex min-h-[27px] items-center rounded-[8px] border border-[#ded2c5]/75 bg-[#fffdf9]/90 px-2.5 py-1 text-[10px] font-medium leading-none tracking-[0.015em] text-[#66594e] shadow-[0_2px_10px_rgba(53,37,26,0.035)] backdrop-blur-md md:text-[11px]">
      {children}
    </span>
  );
}

export default function ProductCard({ product, dark = false }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  const compare = useCompare();
  const inCompare = compare.has(product.id);
  const images = useMemo(() => (product.images || []).filter(Boolean), [product.images]);
  const [imageIndex, setImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const usableImages = useMemo(() => images.filter((src) => !failedImages.has(src)), [images, failedImages]);
  const activeImage = usableImages[imageIndex] || usableImages[0] || '';
  const hasGallery = usableImages.length > 1;
  const title = cleanName(product.name);
  const swatches = useMemo(() => fabricVisuals(product), [product]);
  const availability = product.availability === 'in_stock' ? 'В наявності' : product.productionTime ? `Виготовлення ${product.productionTime}` : 'Немає в наявності';
  const price = currentPrice(product);
  const previousPrice = oldPrice(product);
  const discounted = isDiscountActive(product);
  const savings = discounted && Number(previousPrice) > Number(price)
    ? Math.max(0, Math.round(Number(previousPrice) - Number(price)))
    : 0;

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

  const actionButtonBase = 'ui-radius-sm flex h-9 w-9 items-center justify-center border border-[#e8dfd6]/80 bg-[#fffdf9]/88 text-espresso shadow-[0_2px_10px_rgba(52,36,24,0.035)] backdrop-blur-md transition-all duration-300 hover:border-[#d9c9ba] hover:bg-white hover:shadow-[0_4px_14px_rgba(52,36,24,0.065)] md:h-9 md:w-9';

  return (
    <article className={`product-card-shell group relative border border-[#e8e0d7] bg-[#fffdfa] shadow-[0_8px_28px_rgba(48,34,24,0.045)] transition-[transform,box-shadow,border-color] duration-500 ease-out md:hover:-translate-y-[3px] md:hover:border-[#ded2c6] md:hover:shadow-[0_15px_38px_rgba(48,34,24,0.075)] ${dark ? 'text-milk' : 'text-espresso'}`}>
      <div className="product-card-media relative overflow-hidden">
        <Link to={`/product/${product.slug}`} onClick={() => { rememberScroll(); track('select_item', { items: [buildItem({ ...product, price })] }); }} className="block h-full" data-tap-target="true">
          {activeImage ? (
            <ProductImage src={activeImage} alt={product.imageAlt || product.name} sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 28vw" quality={60} className="h-full w-full transition-transform duration-700 ease-out md:group-hover:scale-[1.022] motion-reduce:transform-none" onError={handleImageError} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-sand text-[13px] text-mocha">Фото готується</div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
          <div className="flex max-w-[70%] flex-col items-start gap-2">
            {discounted ? <DiscountBadge product={product} compact /> : <AvailabilityBadge>{availability}</AvailabilityBadge>}
            {discounted && <AvailabilityBadge>{availability}</AvailabilityBadge>}
          </div>
          <div className="pointer-events-auto flex gap-2.5">
            <button type="button" aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ productId: product.id, slug: product.slug, name: product.name, price, image: usableImages[0] || images[0] }); track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem({ ...product, price })] }); }} className={actionButtonBase}><Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.3} /></button>
            <button type="button" aria-label="Порівняти" onClick={(e)=>{e.preventDefault();e.stopPropagation();compare.toggle({ ...product, price });track(inCompare?'compare_remove':'compare_add',{item_id:product.sku});}} className={`${actionButtonBase} ${inCompare ? '!border-espresso !bg-espresso !text-milk' : ''}`}><GitCompare className="h-4 w-4" strokeWidth={1.3}/></button>
          </div>
        </div>

        {hasGallery && <>
          <button type="button" aria-label="Попереднє фото" onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(-1); }} className="ui-radius-sm absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-[#e8dfd6]/75 bg-[#fffdf9]/88 text-espresso shadow-[0_2px_10px_rgba(52,36,24,0.035)] backdrop-blur-md transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"><ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.4} /></button>
          <button type="button" aria-label="Наступне фото" onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(1); }} className="ui-radius-sm absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-[#e8dfd6]/75 bg-[#fffdf9]/88 text-espresso shadow-[0_2px_10px_rgba(52,36,24,0.035)] backdrop-blur-md transition-all duration-300 md:opacity-0 md:group-hover:opacity-100"><ChevronRight className="h-3.5 w-3.5" strokeWidth={1.4} /></button>
        </>}
      </div>

      <div className="p-4 md:p-5">
        <Link to={`/product/${product.slug}`} className="block" data-tap-target="true">
          <h3 className="font-heading text-[22px] leading-[1.08] text-espresso md:text-[25px]">{title}</h3>
        </Link>
        {product.reviewsCount > 0 && <div className="mt-2 text-[13px] text-mocha">★ {product.rating || 5} · {product.reviewsCount}</div>}

        <div className="mt-3 flex min-h-[32px] flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className={`product-card-price font-heading ${discounted ? 'text-[#B44E2C]' : 'text-espresso'}`}>{product.priceFrom ? 'від ' : ''}{price.toLocaleString('uk-UA')} ₴</span>
          {discounted && previousPrice > price && <span className="text-[12px] text-mocha/80 line-through md:text-[13px]">{Number(previousPrice).toLocaleString('uk-UA')} ₴</span>}
        </div>

        {savings > 0 && (
          <div className="mt-2.5 inline-flex min-h-[27px] items-center rounded-[8px] border border-[#d5e5d1] bg-[#eef5eb] px-2.5 py-1.5 text-[10px] font-semibold leading-none tracking-[0.035em] text-[#456b49] md:text-[11px]">
            Економія {savings.toLocaleString('uk-UA')} ₴
          </div>
        )}

        {swatches.length > 0 && <div className="mt-3"><p className="mb-2 text-[13px] text-mocha">Тканини / кольори</p><div className="flex gap-2" aria-label="Доступні кольори тканини">{swatches.map((s, i) => <span key={`${s.name}-${i}`} title={s.name} className="fabric-dot" style={s.image ? { backgroundImage: `url(${s.image})`, backgroundSize: 'cover' } : { background: s.color }} />)}</div></div>}

        <Link to={`/product/${product.slug}`} onClick={() => { rememberScroll(); track('select_item', { items: [buildItem({ ...product, price })] }); }} className="ui-action ui-radius-sm group/cta mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2.5 px-5 py-3.5 text-[12px] font-medium uppercase tracking-[0.095em] transition-all duration-300 md:hover:shadow-[0_7px_18px_rgba(47,31,20,0.16)]" data-tap-target="true">
          <span>Обрати комплектацію</span><ArrowUpRight className="h-3.5 w-3.5 opacity-75 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" strokeWidth={1.35} />
        </Link>
      </div>
    </article>
  );
}
