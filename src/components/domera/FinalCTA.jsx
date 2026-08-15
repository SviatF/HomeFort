'use client';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import Parallax from './Parallax';
import { Image } from '@/components/ui/image';

export default function FinalCTA() {
  return (
    <section className="relative w-full overflow-hidden bg-espresso">
      <Parallax speed={0.08} className="absolute inset-0 scale-110">
        <Image
          src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/d2368722d_generated_image.png"
          alt="Спокійна спальня DOMERA"
          className="w-full h-full"
        />
      </Parallax>
      <div className="absolute inset-0 bg-espresso/65" />
      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12 py-32 md:py-48 flex flex-col items-center text-center">
        <Reveal>
          <p className="text-[11px] tracking-[0.42em] uppercase text-milk/80 mb-6 font-medium">DOMERA</p>
          <h2 className="font-heading text-milk text-[clamp(2.4rem,6vw,5rem)] leading-[1.04] max-w-3xl text-balance" style={{ textShadow: '0 2px 24px rgba(18,11,5,0.5)' }}>
            Ваш комфорт починається тут
          </h2>
          <p className="mt-7 text-milk/85 text-lg leading-relaxed max-w-xl mx-auto" style={{ textShadow: '0 1px 12px rgba(18,11,5,0.45)' }}>
            Допоможемо підібрати ліжко, матрац і текстиль, які підходять саме вам.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog/beds" className="group inline-flex items-center justify-center gap-2 px-9 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase font-semibold hover:bg-white transition-colors shadow-elevated">
              Підібрати рішення <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.6} />
            </Link>
            <Link to="/catalog/beds" className="inline-flex items-center justify-center px-9 py-4 border border-milk/50 text-milk text-[12px] tracking-[0.22em] uppercase font-medium hover:border-milk hover:bg-milk/10 transition-all backdrop-blur-sm">
              Переглянути каталог
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}