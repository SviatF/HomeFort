'use client';
import { useState } from 'react';
import { Link } from '@/lib/router';
import { Heart, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { track, buildItem } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { Image } from '@/components/ui/image';

function cleanName(name = '') {
  return String(name)
    .replace(/^Ліжко\s+м['’]?яке\s+/i, '')
    .replace(/^Ліжко\s+/i, '')
    .replace(/^Homefort\s*/i, '')
    .trim();
}

export default function ProductCard({ product, dark = false }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  const images = (product.images || []).filter(Boolean);
  const [imageIndex, setImageIndex] = useState(0);
  const activeImage = images[imageIndex] || images[0];
  const hasGallery = images.length > 1;
  const saving = product.oldPrice > product.price ? product.oldPrice - product.price : 0;
  const title = cleanName(product.name);

  const goToImage = (step) => {
    if (!hasGallery) return;
    setImageIndex((current) => (current + step + images.length) % images.length);
  };

  return (
    <article className={`group ${dark ? 'text-milk' : 'text-espresso'}`}>
      <div className={`relative overflow-hidden ${dark ? 'bg-espresso-soft' : 'bg-[#F2ECE5]'} aspect-[4/5]`}>
        <Link
          to={`/product/${product.slug}`}
          onClick={() => track('select_item', { items: [buildItem(product)] })}
          className="block h-full"
        >
          <Image
            src={activeImage}
            alt={product.imageAlt || product.name}
            className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.025]"
          />
        </Link>

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between gap-3 pointer-events-none">
          <div className="flex flex-wrap gap-2">
            {product.salePercent > 0 && (
              <span className="bg-espresso text-milk px-3 py-2 text-[10px] leading-none tracking-[0.18em] uppercase font-semibold">
                −{product.salePercent}%
              </span>
            )}
            {product.availability === 'in_stock' && (
              <span className="bg-milk/90 text-espresso px-3 py-2 text-[9px] leading-none tracking-[0.14em] uppercase font-semibold backdrop-blur-md">
                В наявності
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: images[0] });
              track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] });
            }}
            className="pointer-events-auto w-10 h-10 bg-milk/92 backdrop-blur-md flex items-center justify-center text-espresso transition-transform hover:scale-105"
          >
            <Heart className="w-[17px] h-[17px]" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.45} />
          </button>
        </div>

        {hasGallery && (
          <>
            <button
              type="button"
              aria-label="Попереднє фото"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(-1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-milk/90 text-espresso backdrop-blur-md flex items-center justify-center transition-all md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.4} />
            </button>
            <button
              type="button"
              aria-label="Наступне фото"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-milk/90 text-espresso backdrop-blur-md flex items-center justify-center transition-all md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.4} />
            </button>
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 rounded-full bg-espresso/70 backdrop-blur-md px-3 py-2 flex items-center gap-1.5">
              {images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Фото ${idx + 1}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageIndex(idx); }}
                  className={`h-1 rounded-full transition-all ${imageIndex === idx ? 'w-4 bg-milk' : 'w-1 bg-milk/55'}`}
                />
              ))}
              {images.length > 5 && <span className="ml-0.5 text-[9px] text-milk/80">+{images.length - 5}</span>}
            </div>
          </>
        )}
      </div>

      <div className="pt-4 md:pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-[9px] uppercase tracking-[0.2em] font-semibold ${dark ? 'text-milk/50' : 'text-mocha/70'}`}>
              DOMERA COLLECTION
            </p>
            <Link to={`/product/${product.slug}`} className="block mt-1.5">
              <h3 className={`font-heading text-[24px] md:text-[26px] leading-none tracking-[-0.015em] ${dark ? 'text-milk' : 'text-espresso'} transition-opacity group-hover:opacity-70`}>
                {title}
              </h3>
            </Link>
          </div>
          {product.reviewsCount > 0 && (
            <span className={`pt-0.5 text-[11px] whitespace-nowrap ${dark ? 'text-milk/55' : 'text-mocha'}`}>
              ★ {product.rating || 5}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-espresso/10 pt-4">
          <div>
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
              <span className={`font-heading text-[27px] md:text-[29px] leading-none font-medium ${dark ? 'text-milk' : 'text-espresso'}`}>
                {Number(product.price || 0).toLocaleString('uk-UA')} ₴
              </span>
              {product.oldPrice > 0 && (
                <span className={`text-[12px] line-through ${dark ? 'text-milk/40' : 'text-mocha/60'}`}>
                  {Number(product.oldPrice).toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>
            {saving > 0 ? (
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-clay font-semibold">
                Ви економите {saving.toLocaleString('uk-UA')} ₴
              </p>
            ) : (
              <p className={`mt-1.5 text-[11px] ${dark ? 'text-milk/50' : 'text-mocha'}`}>
                Доступні різні розміри та тканини
              </p>
            )}
          </div>
        </div>

        <Link
          to={`/product/${product.slug}`}
          onClick={() => track('select_item', { items: [buildItem(product)] })}
          className={`mt-4 group/cta inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.17em] font-semibold border-b pb-1 ${dark ? 'border-milk/40 text-milk' : 'border-espresso/35 text-espresso'} hover:border-current transition-colors`}
        >
          <span>Переглянути модель</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" strokeWidth={1.5} />
        </Link>
      </div>
    </article>
  );
}
