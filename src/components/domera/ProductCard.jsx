'use client';
import { useState } from 'react';
import { Link } from '@/lib/router';
import { Heart, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { track, buildItem } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { Image } from '@/components/ui/image';

function normalizeSize(size) {
  return String(size || '').replace(/см/gi, '').replace(/x/gi, '×').replace(/х/gi, '×').trim();
}

function uniqueSizes(sizes = []) {
  return [...new Set(sizes.map(normalizeSize).filter(Boolean))];
}

export default function ProductCard({ product, dark = false }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  const images = (product.images || []).filter(Boolean);
  const sizes = uniqueSizes(product.sizes || []);
  const [imageIndex, setImageIndex] = useState(0);
  const activeImage = images[imageIndex] || images[0];
  const hasGallery = images.length > 1;
  const saving = product.oldPrice > product.price ? product.oldPrice - product.price : 0;

  const frame = dark
    ? 'bg-espresso-soft border-milk/10'
    : 'bg-[#F2ECE4] border-espresso/10';
  const title = dark ? 'text-milk' : 'text-espresso';
  const muted = dark ? 'text-milk/55' : 'text-mocha';
  const price = dark ? 'text-milk' : 'text-espresso';
  const old = dark ? 'text-milk/40' : 'text-mocha/65';
  const divider = dark ? 'border-milk/10' : 'border-espresso/10';
  const surface = dark ? 'bg-espresso/75 text-milk' : 'bg-milk/90 text-espresso';
  const cta = dark
    ? 'bg-milk text-espresso hover:bg-champagne'
    : 'bg-espresso text-milk hover:bg-[#4A2F1C]';

  const goToImage = (next) => {
    if (!hasGallery) return;
    setImageIndex((current) => (current + next + images.length) % images.length);
  };

  return (
    <article className={`group relative overflow-hidden border ${divider} ${dark ? 'bg-espresso-soft' : 'bg-[#FBF8F4]'} transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(52,33,18,0.12)]`}>
      <div className={`relative overflow-hidden ${frame} aspect-[4/5]`}>
        <Link
          to={`/product/${product.slug}`}
          onClick={() => track('select_item', { items: [buildItem(product)] })}
          className="block h-full"
        >
          <Image
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.035]"
          />
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3.5 md:p-4 pointer-events-none">
          <div className="flex flex-wrap gap-2">
            {product.salePercent > 0 && (
              <span className="bg-espresso text-milk text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 font-semibold shadow-sm">
                −{product.salePercent}%
              </span>
            )}
            {product.availability === 'in_stock' && (
              <span className={`${surface} backdrop-blur-md text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 font-semibold shadow-sm`}>
                В наявності
              </span>
            )}
          </div>

          <button
            aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'}
            onClick={() => {
              toggle({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: images[0] });
              track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] });
            }}
            className={`${surface} pointer-events-auto w-10 h-10 flex items-center justify-center backdrop-blur-md shadow-sm transition-all hover:scale-105`}
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
              className={`${surface} absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center backdrop-blur-md shadow-sm transition-all flex md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0`}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Наступне фото"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(1); }}
              className={`${surface} absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center backdrop-blur-md shadow-sm transition-all flex md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0`}
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full bg-espresso/70 px-2.5 py-2 backdrop-blur-md">
              {images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Фото ${idx + 1}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageIndex(idx); }}
                  className={`h-1 rounded-full transition-all ${imageIndex === idx ? 'w-5 bg-milk' : 'w-1 bg-milk/55'}`}
                />
              ))}
              {images.length > 5 && <span className="ml-1 text-[9px] text-milk/80">+{images.length - 5}</span>}
            </div>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-espresso/20 to-transparent pointer-events-none" />
      </div>

      <div className="p-4.5 md:p-5 flex flex-col min-h-[245px]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`text-[9px] tracking-[0.2em] uppercase font-semibold ${muted}`}>
            DOMERA · Ліжко
          </span>
          {product.reviewsCount > 0 && (
            <span className={`text-[11px] ${muted} whitespace-nowrap`}>★ {product.rating} <span className="opacity-60">({product.reviewsCount})</span></span>
          )}
        </div>

        <Link to={`/product/${product.slug}`} className="block">
          <h3 className={`font-heading text-[22px] md:text-[24px] ${title} leading-[1.08] tracking-[-0.01em] transition-opacity group-hover:opacity-75`}>
            {product.name.replace(/^Ліжко\s+м['’]?яке\s+/i, '').replace(/^Homefort\s+/i, '')}
          </h3>
        </Link>

        <div className={`mt-4 pt-4 border-t ${divider}`}>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {sizes.length > 0 && (
              <span className={`text-[11px] ${muted}`}>
                <span className={`font-medium ${title}`}>{sizes.length}</span> розмірів
              </span>
            )}
            {images.length > 1 && (
              <span className={`text-[11px] ${muted}`}>
                <span className={`font-medium ${title}`}>{images.length}</span> фото
              </span>
            )}
            {product.productionTime && (
              <span className={`text-[11px] ${muted}`}>{product.productionTime}</span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="mt-3 flex gap-1.5 overflow-hidden">
              {sizes.slice(0, 3).map((size) => (
                <span key={size} className={`border ${divider} px-2.5 py-1.5 text-[10px] ${muted} whitespace-nowrap`}>
                  {size}
                </span>
              ))}
              {sizes.length > 3 && (
                <span className={`border ${divider} px-2.5 py-1.5 text-[10px] ${muted} whitespace-nowrap`}>
                  +{sizes.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                <span className={`font-heading text-[27px] ${price} font-medium leading-none`}>
                  {Number(product.price || 0).toLocaleString('uk-UA')} ₴
                </span>
                {product.oldPrice > 0 && (
                  <span className={`text-[12px] ${old} line-through`}>
                    {Number(product.oldPrice).toLocaleString('uk-UA')} ₴
                  </span>
                )}
              </div>
              {saving > 0 && (
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-clay font-semibold">
                  Економія {saving.toLocaleString('uk-UA')} ₴
                </p>
              )}
            </div>
          </div>

          <Link
            to={`/product/${product.slug}`}
            onClick={() => track('select_item', { items: [buildItem(product)] })}
            className={`mt-5 flex w-full items-center justify-between px-4 py-3.5 ${cta} text-[10px] tracking-[0.18em] uppercase font-semibold transition-all`}
          >
            <span>Обрати комплектацію</span>
            <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
