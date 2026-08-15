'use client';
import { useState } from 'react';
import { Image } from '@/components/ui/image';

export default function ProductGallery({ images = [], videoUrl, salePercent, name }) {
  const slides = [
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : []),
    ...images.map((u) => ({ type: 'image', url: u })),
  ];

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  if (slides.length === 0) return <div className="aspect-[4/5] bg-sand" />;
  const current = slides[active] || slides[0];

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div>
      <div
        className="relative overflow-hidden bg-sand border border-espresso/8 shadow-soft aspect-[4/5] lg:aspect-[5/6] group"
        onMouseEnter={() => current.type === 'image' && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        {current.type === 'video' ? (
          <video src={current.url} controls className="w-full h-full object-cover" />
        ) : (
          <Image
            src={current.url}
            alt={name}
            className={`w-full h-full animate-fade-in transition-transform duration-300 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            style={zoom ? { transform: 'scale(2)', transformOrigin: `${pos.x}% ${pos.y}%` } : {}}
          />
        )}
        {salePercent > 0 && (
          <span className="absolute top-5 left-5 bg-espresso text-milk text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 pointer-events-none">−{salePercent}%</span>
        )}
      </div>
      {slides.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide">
          {slides.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} className={`w-20 h-24 flex-shrink-0 overflow-hidden border-2 transition-colors ${i === active ? 'border-espresso' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              {s.type === 'video' ? (
                <div className="w-full h-full bg-espresso flex items-center justify-center text-milk text-[9px] tracking-[0.2em] uppercase">Відео</div>
              ) : (
                <Image src={s.url} alt="" className="w-full h-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}