'use client';

import { useEffect, useRef } from 'react';
import NextImage from 'next/image';

export default function ProductImage({
  src,
  alt = '',
  priority = false,
  loading = 'lazy',
  sizes = '(max-width: 768px) 50vw, 33vw',
  quality = 68,
  className = '',
  objectFit = 'cover',
  onError,
  style,
}) {
  const frameRef = useRef(null);
  const previousSrcRef = useRef(src);

  useEffect(() => {
    const previousSrc = previousSrcRef.current;
    previousSrcRef.current = src;
    if (!src || !previousSrc || previousSrc === src || !frameRef.current || typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    frameRef.current.getAnimations?.().forEach((animation) => animation.cancel());
    frameRef.current.animate(
      [
        { transform: 'translate3d(7px,0,0) scale(0.998)' },
        { transform: 'translate3d(0,0,0) scale(1)' },
      ],
      { duration: 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [src]);

  if (!src) return <div className={`skeleton ${className}`} aria-hidden="true" />;

  return (
    <span ref={frameRef} className={`relative block overflow-hidden ${className}`} style={style}>
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : loading}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectFit }}
        onError={onError}
      />
    </span>
  );
}
