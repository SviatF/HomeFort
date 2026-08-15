'use client';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

const tiles = [
  { img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/61289e39d_generated_e8c81686.png', label: '@interior.soul' },
  { img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/4e4baa3c5_generated_24d0f002.png', label: '@mira.home' },
  { img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/0bc6eff54_generated_6ca5af5c.png', label: '@linen.days' },
  { img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/e8cde0867_generated_b68255c5.png', label: '@sleep.studio' },
  { img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/0d9b0a79e_generated_81d13e86.png', label: '@texture.lab' },
  { img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/61289e39d_generated_e8c81686.png', label: '@calm.rooms' },
];

export default function UGCMosaic() {
  const [index, setIndex] = useState(0);
  const count = tiles.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="bg-espresso-soft py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="flex items-end justify-between mb-10 md:mb-12 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">Interior inspiration</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.08] text-milk">
              DOMERA у ваших інтерʼєрах
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] tracking-[0.22em] uppercase text-milk border-b border-milk pb-1 hover:text-champagne hover:border-champagne transition-colors"
          >
            Дивитися більше DOMERA
          </a>
        </Reveal>

        <div className="relative overflow-hidden border border-milk/10 shadow-card group">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {tiles.map((t, i) => (
              <div key={i} className="relative w-full shrink-0 aspect-[16/10] md:aspect-[21/9]">
                <Image
                  src={t.img}
                  alt={t.label}
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
                <span className="absolute bottom-5 left-5 text-milk text-sm tracking-[0.18em] uppercase">
                  {t.label}
                </span>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            aria-label="Попереднє"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-milk/10 backdrop-blur-md border border-milk/20 text-milk flex items-center justify-center hover:bg-milk/20 hover:text-champagne transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            aria-label="Наступне"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-milk/10 backdrop-blur-md border border-milk/20 text-milk flex items-center justify-center hover:bg-milk/20 hover:text-champagne transition-colors"
          >
            <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 right-5 flex gap-2">
            {tiles.map((_, i) => (
              <button
                key={i}
                aria-label={`Слайд ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-7 bg-champagne' : 'w-1.5 bg-milk/40 hover:bg-milk/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}