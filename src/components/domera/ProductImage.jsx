'use client';
import { useEffect, useRef } from 'react';
import NextImage from 'next/image';

export default function ProductImage({ src, alt = '', priority = false, sizes = '(max-width: 768px) 50vw, 33vw', quality = 68, className = '', objectFit = 'cover', onError }) {
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
        { opacity: 0.28, transform: 'scale(0.992)', filter: 'blur(1.5px)' },
        { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
      ],
      { duration: 430, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [src]);

  if (!src) return <div className={`skeleton ${className}`} aria-hidden="true" />;
  return (
    <span ref={frameRef} className={`relative block overflow-hidden ${className}`}>
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
