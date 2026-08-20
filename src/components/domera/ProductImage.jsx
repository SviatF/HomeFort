'use client';
import NextImage from 'next/image';

export default function ProductImage({ src, alt = '', priority = false, sizes = '(max-width: 768px) 50vw, 33vw', quality = 68, className = '', objectFit = 'cover', onError }) {
  if (!src) return <div className={`skeleton ${className}`} aria-hidden="true" />;
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectFit }}
        onError={onError}
      />
    </span>
  );
}
