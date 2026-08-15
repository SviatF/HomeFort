'use client';
import { Link } from '@/lib/router';
import { Heart } from 'lucide-react';
import { track, buildItem } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { Image } from '@/components/ui/image';

export default function ProductCard({ product, dark = false }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);

  const frame = dark
    ? 'bg-espresso-soft border-milk/10'
    : 'bg-sand border-espresso/8';
  const saleBadge = dark ? 'bg-champagne text-espresso' : 'bg-espresso text-milk';
  const wishBtn = dark
    ? `bg-espresso/60 ${inWishlist ? 'text-champagne' : 'text-milk hover:bg-espresso-soft'}`
    : `bg-milk/85 ${inWishlist ? 'text-clay' : 'text-espresso hover:bg-milk'}`;
  const cta = dark
    ? 'bg-milk text-espresso hover:bg-champagne'
    : 'bg-espresso text-milk hover:bg-espresso-soft';
  const title = dark ? 'text-milk' : 'text-espresso';
  const desc = dark ? 'text-milk/60' : 'text-mocha';
  const price = dark ? 'text-milk' : 'text-espresso';
  const old = dark ? 'text-milk/45' : 'text-mocha';
  const stars = dark ? 'text-champagne' : 'text-mocha';
  const dotBorder = dark ? 'border-milk/20' : 'border-espresso/15';

  return (
    <div className="group">
      <div className={`relative overflow-hidden ${frame} aspect-[4/5] border shadow-soft transition-shadow duration-500 group-hover:shadow-card`}>
        <Link to={`/product/${product.slug}`} onClick={() => track('select_item', { items: [buildItem(product)] })}>
          <Image
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {product.salePercent > 0 && (
          <span className={`absolute top-4 left-4 ${saleBadge} text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 font-medium`}>
            −{product.salePercent}%
          </span>
        )}

        <button
          aria-label="Додати в обране"
          onClick={() => {
            toggle({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] });
            track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] });
          }}
          className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center backdrop-blur transition-all ${wishBtn}`}
        >
          <Heart className="w-[17px] h-[17px]" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hidden md:block">
          <Link
            to={`/product/${product.slug}`}
            className={`block w-full py-3.5 ${cta} text-[11px] tracking-[0.22em] uppercase text-center font-medium transition-colors`}
          >
            Переглянути
          </Link>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-heading text-xl ${title} leading-tight`}>{product.name}</h3>
          {product.reviewsCount > 0 && (
            <span className={`text-xs ${stars} whitespace-nowrap mt-1`}>★ {product.rating}</span>
          )}
        </div>
        <p className={`text-sm ${desc} mt-1.5 leading-snug`}>{product.shortDescription}</p>
        <div className="flex items-end justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className={`font-heading text-2xl ${price} font-medium`}>{product.price.toLocaleString('uk-UA')} ₴</span>
            {product.oldPrice > 0 && (
              <span className={`text-sm ${old} line-through`}>{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
            )}
          </div>
          <div className="flex gap-1.5">
            {(product.colors || []).slice(0, 4).map((c) => (
              <span key={c} className={`w-3.5 h-3.5 rounded-full border ${dotBorder}`} style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}