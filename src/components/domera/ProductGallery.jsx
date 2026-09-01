'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductImage from '@/components/domera/ProductImage';
import { track } from '@/lib/analytics';

const SLIDE_MS = 680;
const SLIDE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export default function ProductGallery({ images = [], videoUrl, salePercent, name, activeIndex = 0, onActiveChange }) {
  const slides = useMemo(() => [
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : []),
    ...images.filter(Boolean).map((url) => ({ type: 'image', url })),
  ], [images, videoUrl]);

  const hasGallery = slides.length > 1;
  const initialIndex = Math.max(0, Math.min(Number(activeIndex) || 0, Math.max(0, slides.length - 1)));
  const [active, setActive] = useState(initialIndex);
  const [trackIndex, setTrackIndex] = useState(hasGallery ? initialIndex + 1 : 0);
  const [animated, setAnimated] = useState(true);
  const [moving, setMoving] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(null);

  const renderedSlides = useMemo(() => {
    if (!hasGallery) return slides.map((slide, index) => ({ slide, originalIndex: index, clone: false }));
    return [
      { slide: slides[slides.length - 1], originalIndex: slides.length - 1, clone: true },
      ...slides.map((slide, index) => ({ slide, originalIndex: index, clone: false })),
      { slide: slides[0], originalIndex: 0, clone: true },
    ];
  }, [hasGallery, slides]);

  useEffect(() => {
    if (!slides.length) return;
    const index = Math.max(0, Math.min(Number(activeIndex) || 0, slides.length - 1));
    if (index === active) return;
    setZoom(false);
    setActive(index);
    setTrackIndex(hasGallery ? index + 1 : index);
  }, [activeIndex, active, hasGallery, slides.length]);

  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [animated]);

  if (slides.length === 0) return <div className="aspect-[4/5] bg-sand ui-radius-md skeleton" />;

  const current = slides[active] || slides[0];

  const changeTo = (nextActive, nextTrackIndex, action) => {
    if (!hasGallery || moving) return;
    setZoom(false);
    setMoving(true);
    setActive(nextActive);
    setTrackIndex(nextTrackIndex);
    onActiveChange?.(nextActive);
    if (action) track('gallery_interaction', { product_name: name, action, slide_index: nextActive + 1 });
  };

  const goNext = () => {
    const nextActive = (active + 1) % slides.length;
    changeTo(nextActive, trackIndex + 1, 'next');
  };

  const goPrev = () => {
    const nextActive = (active - 1 + slides.length) % slides.length;
    changeTo(nextActive, trackIndex - 1, 'previous');
  };

  const selectSlide = (index, slide) => {
    if (index === active || moving) return;
    setZoom(false);
    setMoving(true);
    setActive(index);
    setTrackIndex(index + 1);
    onActiveChange?.(index);
    track('gallery_interaction', {
      product_name: name,
      slide_index: index + 1,
      media_type: slide.type,
      action: 'thumbnail',
    });
  };

  const handleTransitionEnd = () => {
    if (!hasGallery) return;

    if (trackIndex === slides.length + 1) {
      setAnimated(false);
      setTrackIndex(1);
    } else if (trackIndex === 0) {
      setAnimated(false);
      setTrackIndex(slides.length);
    }

    setMoving(false);
  };

  const onMove = (event) => {
    if (current?.type !== 'image') return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX;
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (typeof endX !== 'number') return;
    const delta = endX - startX;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  return (
    <div>
      <div
        className="ui-radius-md relative aspect-[4/5] overflow-hidden border border-espresso/10 bg-sand shadow-soft outline-none group"
        onMouseEnter={() => current?.type === 'image' && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={hasGallery ? 0 : -1}
        aria-label={hasGallery ? 'Галерея товару. Використовуйте стрілки для перегляду фото.' : undefined}
      >
        <div className="h-full w-full overflow-hidden touch-pan-y">
          <div
            className="flex h-full will-change-transform"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(-${trackIndex * 100}%, 0, 0)`,
              transition: animated ? `transform ${SLIDE_MS}ms ${SLIDE_EASING}` : 'none',
            }}
          >
            {renderedSlides.map(({ slide, originalIndex, clone }, renderIndex) => (
              <div
                key={`${slide.type}-${slide.url}-${renderIndex}-${clone ? 'clone' : 'real'}`}
                className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"
              >
                {slide.type === 'video' ? (
                  <video
                    src={slide.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                    onPlay={() => track('gallery_interaction', { product_name: name, slide_index: originalIndex + 1, media_type: 'video', action: 'play' })}
                  />
                ) : (
                  <ProductImage
                    src={slide.url}
                    alt={!clone && originalIndex === active ? name : ''}
                    priority={!clone && originalIndex === 0}
                    loading="eager"
                    sizes="(max-width: 1023px) 100vw, 58vw"
                    quality={72}
                    className="h-full w-full"
                    style={{
                      transform: !clone && originalIndex === active && zoom ? 'scale(1.08)' : 'scale(1)',
                      transformOrigin: `${pos.x}% ${pos.y}%`,
                      transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {salePercent > 0 && <span className="product-sale-badge absolute left-4 top-4 z-20 pointer-events-none">−{salePercent}%</span>}

        {hasGallery && (
          <>
            <button
              type="button"
              aria-label="Попереднє фото"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/84 text-espresso shadow-[0_10px_30px_rgba(48,34,24,0.13)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] hover:bg-white md:left-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.45} />
            </button>
            <button
              type="button"
              aria-label="Наступне фото"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/84 text-espresso shadow-[0_10px_30px_rgba(48,34,24,0.13)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] hover:bg-white md:right-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.45} />
            </button>

            <span className="absolute bottom-4 right-4 z-20 rounded-full border border-white/35 bg-black/25 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-white backdrop-blur-xl">
              {active + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {hasGallery && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {slides.slice(0, 7).map((slide, index) => (
            <button
              key={`${slide.url}-${index}`}
              type="button"
              onClick={() => selectSlide(index, slide)}
              aria-label={`Відкрити ${slide.type === 'video' ? 'відео' : `фото ${index + 1}`}`}
              className={`ui-radius-sm h-[80px] w-[64px] min-w-[64px] overflow-hidden border-2 transition-[opacity,transform,border-color,box-shadow] duration-300 ${index === active ? 'scale-[1.02] border-espresso opacity-100 shadow-[0_6px_18px_rgba(48,34,24,0.10)]' : 'border-transparent opacity-65 hover:opacity-100'}`}
            >
              {slide.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-espresso text-[13px] text-milk">▶</div>
              ) : (
                <ProductImage src={slide.url} alt="" loading="eager" sizes="64px" quality={60} className="h-full w-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
