'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';

const words = ['Простір,', 'у', 'якому', 'хочеться', 'залишатися'];

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const fade = Math.max(0, 1 - scrollY / 560);

  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden bg-espresso">
      <Image
        src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/6f83b826c_generated_image.png"
        alt="Спальня DOMERA в ранковому світлі"
        className="absolute inset-0 w-full h-full hero-zoom"
        fetchPriority="high"
      />

      {/* Layered legibility: deep bottom gradient + soft left vignette — keeps premium feel, lifts text */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(31,20,8,0.05) 0%, rgba(31,20,8,0.12) 38%, rgba(31,20,8,0.55) 78%, rgba(31,20,8,0.78) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 18% 92%, rgba(31,20,8,0.62) 0%, rgba(31,20,8,0.30) 34%, rgba(31,20,8,0.06) 62%, transparent 78%)',
        }}
      />

      <div
        className="relative h-full mx-auto max-w-[1440px] px-10 lg:px-20 xl:px-32 flex items-end pb-[19vh]"
        style={{ opacity: fade, transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <div className="max-w-2xl">
          <p className="hidden sm:block text-[11px] tracking-[0.42em] uppercase text-milk/85 mb-6 animate-fade-in font-medium">
            DOMERA — Home Textile &amp; Living
          </p>
          <h1
            className="font-heading text-milk text-[clamp(1.8rem,4.2vw,3.6rem)] leading-[1.06] font-medium"
            style={{ textShadow: '0 2px 24px rgba(18,11,5,0.45)' }}
          >
            {words.map((w, i) => (
              <span key={i} className="inline-block align-bottom mr-[0.22em]">
                <span className="inline-block animate-fade-up" style={{ animationDelay: `${120 + i * 90}ms` }}>
                  {w}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="mt-7 max-w-md text-milk/90 text-base md:text-lg leading-relaxed font-body animate-fade-up"
            style={{ animationDelay: '620ms', textShadow: '0 1px 12px rgba(18,11,5,0.4)' }}
          >
            Ліжка, матраци та текстиль від власного виробництва DOMERA. Продуманий комфорт для вашої спальні.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '760ms' }}>
            <Link
              to="/catalog/beds"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase font-semibold hover:bg-white transition-colors shadow-elevated"
            >
              Обрати ліжко
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.6} />
            </Link>
            <Link
              to="/catalog/beds"
              className="group inline-flex items-center justify-center gap-2 px-9 py-4 border border-milk/60 text-milk text-[12px] tracking-[0.22em] uppercase font-medium hover:border-milk hover:bg-milk/10 transition-all backdrop-blur-sm"
            >
              Переглянути каталог
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-milk/60" style={{ opacity: fade }}>
        <span className="text-[9px] tracking-[0.32em] uppercase">Scroll</span>
        <span className="w-px h-10 bg-milk/40" />
      </div>
    </section>
  );
}