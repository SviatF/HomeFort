'use client';
import { useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

const hotspots = [
  { id: 'bed', label: 'Ліжко', x: 50, y: 62, sub: 'Lino · Boucle' },
  { id: 'mattress', label: 'Матрац', x: 50, y: 78, sub: 'Soft Cloud' },
  { id: 'pillow', label: 'Подушки', x: 38, y: 48, sub: 'Натуральні' },
  { id: 'duvet', label: 'Ковдра', x: 58, y: 50, sub: 'Льон' },
  { id: 'linen', label: 'Постіль', x: 50, y: 70, sub: 'Pre-washed' },
];

export default function SleepSystem() {
  const [active, setActive] = useState('bed');
  const current = hotspots.find((h) => h.id === active);

  return (
    <section className="bg-graphite text-milk py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-5">Sleep System</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1]">
              Все для вашого сну — в одному рішенні
            </h2>
            <p className="mt-6 text-milk/75 text-lg leading-relaxed max-w-md">
              Ліжко, матрац, наматрацник, подушки та постільна білизна — підібрані як єдина система комфорту.
            </p>

            <div className="mt-9 space-y-3">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  onMouseEnter={() => setActive(h.id)}
                  onClick={() => setActive(h.id)}
                  className={`w-full flex items-center justify-between py-3 border-b transition-colors ${
                    active === h.id ? 'border-champagne text-champagne' : 'border-milk/15 text-milk/80 hover:text-milk'
                  }`}
                >
                  <span className="font-heading text-xl">{h.label}</span>
                  <span className="text-sm">{h.sub}</span>
                </button>
              ))}
            </div>

            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link to="/catalog/beds" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase hover:bg-champagne transition-colors">
                Зібрати комплект <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </Link>
              <span className="inline-flex items-center px-2 text-sm text-milk/60">економія до 15% комплектом</span>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={120}>
            <div className="relative overflow-hidden aspect-[16/11] border border-milk/10">
              <Image src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/59323c4b0_generated_2d968b41.png" alt="Комплектація сну DOMERA" className="w-full h-full" />
              <div className="absolute inset-0 bg-espresso/25" />
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  onMouseEnter={() => setActive(h.id)}
                  onClick={() => setActive(h.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  aria-label={h.label}
                >
                  <span className={`block w-4 h-4 rounded-full transition-all duration-300 ${active === h.id ? 'bg-champagne scale-150' : 'bg-milk/90'}`} />
                  <span className="absolute left-1/2 -translate-x-1/2 top-6 whitespace-nowrap text-[10px] tracking-[0.2em] uppercase text-milk opacity-0 hover:opacity-100 transition-opacity">
                    {h.label}
                  </span>
                </button>
              ))}
              <div className="absolute bottom-5 left-5 bg-espresso/70 backdrop-blur px-5 py-3 border border-milk/10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-champagne">{current.sub}</p>
                <p className="font-heading text-xl text-milk">{current.label}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}