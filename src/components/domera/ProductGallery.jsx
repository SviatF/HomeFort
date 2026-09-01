'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductImage from '@/components/domera/ProductImage';
import { track } from '@/lib/analytics';

export default function ProductGallery({ images = [], videoUrl, salePercent, name, activeIndex = 0, onActiveChange }) {
  const slides = useMemo(() => [
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : []),
    ...images.filter(Boolean).map((u) => ({ type: 'image', url: u })),
  ], [images, videoUrl]);
  const [active, setActive] = useState(Math.max(0, Math.min(activeIndex, slides.length - 1)));
  const [direction, setDirection] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(null);

  useEffect(() => {
    const index = Math.max(0, Math.min(Number(activeIndex) || 0, Math.max(0, slides.length - 1)));
    if (index !== active) setDirection(index > active ? 1 : -1);
    setActive(index);
  }, [activeIndex, slides.length]);

  if (slides.length === 0) return <div className="aspect-[4/5] bg-sand ui-radius-md skeleton" />;
  const current = slides[active] || slides[0];
  const hasGallery = slides.length > 1;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const setSlide = (index, slide, nextDirection) => {
    setZoom(false);
    setDirection(nextDirection || (index >= active ? 1 : -1));
    setActive(index);
    onActiveChange?.(index);
    track('gallery_interaction', { product_name: name, slide_index: index + 1, media_type: slide.type });
  };

  const selectSlide = (index, slide) => setSlide(index, slide, index >= active ? 1 : -1);

  const goToSlide = (step) => {
    if (!hasGallery) return;
    const next = (active + step + slides.length) % slides.length;
    setSlide(next, slides[next], step > 0 ? 1 : -1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(1);
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX;
    if (typeof endX !== 'number') return;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 42) return;
    goToSlide(delta < 0 ? 1 : -1);
  };

  const animationName = direction > 0 ? 'domera-gallery-next' : 'domera-gallery-prev';

  return (
    <div>
      <style>{`
        @keyframes domera-gallery-next {
          0% { opacity: .2; transform: translate3d(18px,0,0) scale(.992); filter: blur(1.5px); }
          55% { opacity: 1; }
          100% { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); }
        }
        @keyframes domera-gallery-prev {
          0% { opacity: .2; transform: translate3d(-18px,0,0) scale(.992); filter: blur(1.5px); }
          55% { opacity: 1; }
          100% { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .domera-gallery-motion { animation: none !important; }
        }
      `}</style>

      <div
        className="ui-radius-md relative overflow-hidden bg-sand border border-espresso/10 shadow-soft aspect-[4/5] group outline-none"
        onMouseEnter={() => current.type === 'image' && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={hasGallery ? 0 : -1}
        aria-label={hasGallery ? 'Галерея товару. Використовуйте стрілки для перегляду фото.' : undefined}
      >
        <div
          key={`${current.type}-${current.url}-${active}`}
          className="domera-gallery-motion absolute inset-0 will-change-transform"
          style={{ animation: `${animationName} 520ms cubic-bezier(0.22, 1, 0.36, 1) both` }}
        >
          {current.type === 'video' ? (
            <video src={current.url} controls playsInline preload="metadata" className="w-full h-full object-cover" onPlay={() => track('gallery_interaction', { product_name: name, slide_index: active + 1, media_type: 'video', action: 'play' })} />
          ) : (
            <ProductImage
              src={current.url}
              alt={name}
              priority={active === 0}
              sizes="(max-width: 1023px) 100vw, 58vw"
              quality={72}
              className={`w-full h-full transition-transform duration-500 ease-out ${zoom ? 'scale-[1.7] cursor-zoom-out' : 'cursor-zoom-in'}`}
              style={{ transformOrigin: `${pos.x}% ${pos.y}%` }}
            />
          )}
        </div>

        {salePercent > 0 && <span className="product-sale-badge absolute top-4 left-4 z-20 pointer-events-none">−{salePercent}%</span>}

        {hasGallery && (
          <>
            <button
              type="button"
              aria-label="Попереднє фото"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); goToSlide(-1); }}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/78 text-espresso shadow-[0_8px_24px_rgba(48,34,24,0.12)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white md:left-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Наступне фото"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); goToSlide(1); }}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/78 text-espresso shadow-[0_8px_24px_rgba(48,34,24,0.12)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white md:right-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <span className="absolute bottom-4 right-4 z-20 rounded-full border border-white/45 bg-espresso/55 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-white backdrop-blur-md">
              {active + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {hasGallery && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {slides.slice(0, 7).map((s, i) => (
            <button
              key={`${s.url}-${i}`}
              type="button"
              onClick={() => selectSlide(i, s)}
              aria-label={`Відкрити ${s.type === 'video' ? 'відео' : `фото ${i + 1}`}`}
              className={`ui-radius-sm w-[64px] h-[80px] min-w-[64px] overflow-hidden border-2 transition-[opacity,transform,border-color,box-shadow] duration-300 ${i === active ? 'border-espresso scale-[1.02] shadow-[0_5px_16px_rgba(48,34,24,0.10)]' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]'}`}
            >
              {s.type === 'video' ? <div className="w-full h-full bg-espresso flex items-center justify-center text-milk text-[13px]">▶</div> : <ProductImage src={s.url} alt="" sizes="64px" quality={60} className="w-full h-full transition-transform duration-500 hover:scale-[1.04]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
