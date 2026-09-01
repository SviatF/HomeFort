'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductImage from '@/components/domera/ProductImage';
import { track } from '@/lib/analytics';

export default function ProductGallery({ images = [], videoUrl, salePercent, name, activeIndex = 0, onActiveChange }) {
  const slides = useMemo(() => [
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : []),
    ...images.filter(Boolean).map((url) => ({ type: 'image', url })),
  ], [images, videoUrl]);

  const [viewportRef, emblaApi] = useEmblaCarousel({
    loop: slides.length > 1,
    align: 'start',
    duration: 34,
    dragFree: false,
    skipSnaps: false,
    watchDrag: slides.length > 1,
  });

  const [active, setActive] = useState(Math.max(0, Math.min(Number(activeIndex) || 0, Math.max(0, slides.length - 1))));
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const syncSelected = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setActive(index);
    onActiveChange?.(index);
  }, [emblaApi, onActiveChange]);

  useEffect(() => {
    if (!emblaApi) return undefined;
    syncSelected();
    emblaApi.on('select', syncSelected);
    emblaApi.on('reInit', syncSelected);
    return () => {
      emblaApi.off('select', syncSelected);
      emblaApi.off('reInit', syncSelected);
    };
  }, [emblaApi, syncSelected]);

  useEffect(() => {
    if (!emblaApi || !slides.length) return;
    const index = Math.max(0, Math.min(Number(activeIndex) || 0, slides.length - 1));
    if (emblaApi.selectedScrollSnap() !== index) emblaApi.scrollTo(index, true);
  }, [activeIndex, emblaApi, slides.length]);

  useEffect(() => {
    setZoom(false);
  }, [active]);

  if (slides.length === 0) return <div className="aspect-[4/5] bg-sand ui-radius-md skeleton" />;

  const hasGallery = slides.length > 1;
  const current = slides[active] || slides[0];

  const onMove = (event) => {
    if (current?.type !== 'image') return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const selectSlide = (index, slide) => {
    if (!emblaApi) return;
    setZoom(false);
    emblaApi.scrollTo(index);
    track('gallery_interaction', {
      product_name: name,
      slide_index: index + 1,
      media_type: slide.type,
      action: 'thumbnail',
    });
  };

  const goPrev = () => {
    if (!emblaApi || !hasGallery) return;
    setZoom(false);
    emblaApi.scrollPrev();
    track('gallery_interaction', { product_name: name, action: 'previous' });
  };

  const goNext = () => {
    if (!emblaApi || !hasGallery) return;
    setZoom(false);
    emblaApi.scrollNext();
    track('gallery_interaction', { product_name: name, action: 'next' });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <div>
      <div
        className="ui-radius-md relative aspect-[4/5] overflow-hidden border border-espresso/10 bg-sand shadow-soft outline-none group"
        onMouseEnter={() => current?.type === 'image' && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        onKeyDown={handleKeyDown}
        tabIndex={hasGallery ? 0 : -1}
        aria-label={hasGallery ? 'Галерея товару. Використовуйте стрілки для перегляду фото.' : undefined}
      >
        <div ref={viewportRef} className="h-full overflow-hidden touch-pan-y">
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div key={`${slide.type}-${slide.url}-${index}`} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden">
                {slide.type === 'video' ? (
                  <video
                    src={slide.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                    onPlay={() => track('gallery_interaction', { product_name: name, slide_index: index + 1, media_type: 'video', action: 'play' })}
                  />
                ) : (
                  <ProductImage
                    src={slide.url}
                    alt={index === active ? name : ''}
                    priority={index === 0}
                    sizes="(max-width: 1023px) 100vw, 58vw"
                    quality={72}
                    className="h-full w-full"
                    style={{
                      transform: index === active && zoom ? 'scale(1.12)' : 'scale(1)',
                      transformOrigin: `${pos.x}% ${pos.y}%`,
                      transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                      willChange: 'transform',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/[0.08] to-transparent" />
        {salePercent > 0 && <span className="product-sale-badge absolute left-4 top-4 z-20 pointer-events-none">−{salePercent}%</span>}

        {hasGallery && (
          <>
            <button
              type="button"
              aria-label="Попереднє фото"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/82 text-espresso shadow-[0_10px_30px_rgba(48,34,24,0.13)] backdrop-blur-xl transition-[opacity,transform,background-color,box-shadow] duration-300 hover:scale-[1.04] hover:bg-white hover:shadow-[0_12px_34px_rgba(48,34,24,0.18)] md:left-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.45} />
            </button>
            <button
              type="button"
              aria-label="Наступне фото"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/82 text-espresso shadow-[0_10px_30px_rgba(48,34,24,0.13)] backdrop-blur-xl transition-[opacity,transform,background-color,box-shadow] duration-300 hover:scale-[1.04] hover:bg-white hover:shadow-[0_12px_34px_rgba(48,34,24,0.18)] md:right-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.45} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/35 bg-black/20 px-2.5 py-2 backdrop-blur-xl">
              {slides.slice(0, 8).map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  aria-label={`Фото ${index + 1}`}
                  onClick={(event) => { event.stopPropagation(); selectSlide(index, slides[index]); }}
                  className={`h-1.5 rounded-full bg-white transition-[width,opacity] duration-500 ${index === active ? 'w-5 opacity-100' : 'w-1.5 opacity-55 hover:opacity-90'}`}
                />
              ))}
            </div>

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
              className={`ui-radius-sm h-[80px] w-[64px] min-w-[64px] overflow-hidden border-2 transition-[opacity,transform,border-color,box-shadow] duration-500 ${index === active ? 'scale-[1.025] border-espresso opacity-100 shadow-[0_7px_20px_rgba(48,34,24,0.11)]' : 'border-transparent opacity-62 hover:scale-[1.02] hover:opacity-100'}`}
            >
              {slide.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-espresso text-[13px] text-milk">▶</div>
              ) : (
                <ProductImage src={slide.url} alt="" sizes="64px" quality={60} className="h-full w-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
