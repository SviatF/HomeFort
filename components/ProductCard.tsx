import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';
import { HeartIcon } from './Icons';

const money = (value: number) => new Intl.NumberFormat('uk-UA').format(value) + ' ₴';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-media">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="product-heart" aria-label="Додати в обране"><HeartIcon /></button>
        <Image src={product.image} alt={`${product.name} — ${product.subtitle}`} fill sizes="(max-width: 768px) 50vw, 25vw" />
        <span className="quick-buy">Переглянути</span>
      </Link>
      <div className="product-meta">
        <div>
          <p className="eyebrow">DOMERA</p>
          <Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
          <p className="product-subtitle">{product.subtitle}</p>
        </div>
        <div className="product-price">
          <strong>{money(product.price)}</strong>
          {product.oldPrice && <del>{money(product.oldPrice)}</del>}
        </div>
      </div>
    </article>
  );
}
