'use client';
import { useEffect, useMemo, useState } from 'react';
import { Image } from '@/components/ui/image';
import { track } from '@/lib/analytics';

export default function ProductGallery({ images = [], videoUrl, salePercent, name, activeIndex = 0, onActiveChange }) {
  const slides = useMemo(() => [
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : []),
    ...images.filter(Boolean).map((u) => ({ type: 'image', url: u })),
  ], [images, videoUrl]);
  const [active, setActive] = useState(Math.max(0, Math.min(activeIndex, slides.length - 1)));
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const index = Math.max(0, Math.min(Number(activeIndex) || 0, Math.max(0, slides.length - 1)));
    setActive(index);
  }, [activeIndex, slides.length]);

  if (slides.length === 0) return <div className="aspect-[4/5] bg-sand ui-radius-md skeleton" />;
  const current = slides[active] || slides[0];
  const onMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); };
  const selectSlide = (index, slide) => { setActive(index); onActiveChange?.(index); track('gallery_interaction', { product_name: name, slide_index: index + 1, media_type: slide.type }); };

  return (
    <div>
      <div className="ui-radius-md relative overflow-hidden bg-sand border border-espresso/10 shadow-soft aspect-[4/5] group" onMouseEnter={() => current.type === 'image' && setZoom(true)} onMouseLeave={() => setZoom(false)} onMouseMove={onMove}>
        {current.type === 'video' ? (
          <video src={current.url} controls playsInline preload="metadata" className="w-full h-full object-cover" onPlay={() => track('gallery_interaction', { product_name: name, slide_index: active + 1, media_type: 'video', action: 'play' })} />
        ) : (
          <Image src={current.url} alt={name} width="1200" height="1500" loading={active === 0 ? 'eager' : 'lazy'} fetchPriority={active === 0 ? 'high' : 'auto'} decoding="async" className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} style={zoom ? { transform: 'scale(1.7)', transformOrigin: `${pos.x}% ${pos.y}%` } : {}} />
        )}
        {salePercent > 0 && <span className="product-status-badge absolute top-4 left-4 pointer-events-none">−{salePercent}%</span>}
      </div>
      {slides.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {slides.slice(0, 7).map((s, i) => (
            <button key={`${s.url}-${i}`} type="button" onClick={() => selectSlide(i, s)} aria-label={`Відкрити ${s.type === 'video' ? 'відео' : `фото ${i + 1}`}`} className={`ui-radius-sm w-[64px] h-[80px] min-w-[64px] overflow-hidden border-2 ${i === active ? 'border-espresso' : 'border-transparent opacity-75 hover:opacity-100'}`}>
              {s.type === 'video' ? <div className="w-full h-full bg-espresso flex items-center justify-center text-milk text-[13px]">▶</div> : <Image src={s.url} alt="" width="128" height="160" loading="lazy" decoding="async" className="w-full h-full object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
