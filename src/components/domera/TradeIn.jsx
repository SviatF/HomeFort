'use client';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function TradeIn() {
  return (
    <section id="trade-in" className="bg-espresso py-24 md:py-32 border-y border-milk/10 scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">DOMERA Trade-In</p>
            <h2 className="font-heading text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.1] text-milk">
              Старий матрац — на користь нового комфорту
            </h2>
            <p className="mt-6 text-milk/70 text-lg leading-relaxed max-w-xl">
              Обміняйте старий матрац та отримайте −10% на новий матрац DOMERA разом із професійним підбором.
            </p>
            <button className="group mt-8 inline-flex items-center gap-2 px-7 py-4 border border-milk text-milk text-[12px] tracking-[0.22em] uppercase hover:bg-milk hover:text-espresso transition-colors">
              Дізнатися умови <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
            </button>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="border-l-2 border-champagne pl-6">
              <p className="font-heading text-6xl text-milk leading-none">−10%</p>
              <p className="mt-3 text-sm text-milk/60 leading-relaxed">
                Пропозиція діє на визначені моделі та протягом обмеженого періоду.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
