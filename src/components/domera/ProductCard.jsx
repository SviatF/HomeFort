'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { Heart, ChevronLeft, ChevronRight, ArrowUpRight, GitCompare } from 'lucide-react';
import { track, buildItem } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { useCompare } from '@/lib/CompareContext';
import ProductImage from '@/components/domera/ProductImage';

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
  const usableImages = useMemo(() => images.filter((src) => !failedImages.has(src)), [images, failedImages]);
  const activeImage = usableImages[imageIndex] || usableImages[0] || '';
  const hasGallery = usableImages.length > 1;
  const title = cleanName(product.name);
  const swatches = useMemo(() => fabricVisuals(product), [product]);
  const availability = product.availability === 'in_stock' ? 'В наявності' : product.productionTime ? `Виготовлення ${product.productionTime}` : 'Під замовлення';

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
    <article className={`product-card-shell group ${dark ? 'text-milk' : 'text-espresso'}`}>
      <div className="product-card-media relative overflow-hidden">
        <Link to={`/product/${product.slug}`} onClick={() => { rememberScroll(); track('select_item', { items: [buildItem(product)] }); }} className="block h-full" data-tap-target="true">
          {activeImage ? (
            <ProductImage src={activeImage} alt={product.imageAlt || product.name} sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 28vw" quality={60} className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.018]" onError={handleImageError} />
          ) : (
            <div className="w-full h-full bg-sand flex items-center justify-center text-[13px] text-mocha">Фото готується</div>
          )}
        </Link>

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col items-start gap-1.5 max-w-[72%]">
            <span className="product-status-badge">{availability}</span>
            {product.salePercent > 0 && <span className="product-sale-badge">−{product.salePercent}%</span>}
          </div>
          <div className="pointer-events-auto flex gap-2">
            <button type="button" aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: usableImages[0] || images[0] }); track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] }); }} className="ui-radius-sm w-11 h-11 bg-milk/95 backdrop-blur-md flex items-center justify-center text-espresso"><Heart className="w-[18px] h-[18px]" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.45} /></button>
            <button type="button" aria-label="Порівняти" onClick={(e)=>{e.preventDefault();e.stopPropagation();compare.toggle(product);track(inCompare?'compare_remove':'compare_add',{item_id:product.sku});}} className={`ui-radius-sm w-11 h-11 backdrop-blur-md flex items-center justify-center ${inCompare ? 'bg-espresso text-milk' : 'bg-milk/95 text-espresso'}`}><GitCompare className="w-[18px] h-[18px]" strokeWidth={1.45}/></button>
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

        <div className="mt-3 flex items-baseline flex-wrap gap-x-2">
          <span className="product-card-price font-heading text-espresso">{Number(product.price || 0).toLocaleString('uk-UA')} ₴</span>
          {product.oldPrice > product.price && <span className="text-[13px] line-through text-mocha">{Number(product.oldPrice).toLocaleString('uk-UA')} ₴</span>}
        </div>

        {swatches.length > 0 && <div className="mt-3"><p className="text-[13px] text-mocha mb-2">Тканини / кольори</p><div className="flex gap-2" aria-label="Доступні кольори тканини">{swatches.map((s, i) => <span key={`${s.name}-${i}`} title={s.name} className="fabric-dot" style={s.image ? { backgroundImage: `url(${s.image})`, backgroundSize: 'cover' } : { background: s.color }} />)}</div></div>}

        <Link to={`/product/${product.slug}`} onClick={() => { rememberScroll(); track('select_item', { items: [buildItem(product)] }); }} className="ui-action ui-radius-sm mt-4 w-full inline-flex items-center justify-center gap-2 px-4 text-[13px] uppercase tracking-[0.12em] font-semibold" data-tap-target="true">
          <span>Купити</span><ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    </article>
  );
}
