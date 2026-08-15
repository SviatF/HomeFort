'use client';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

export default function Production() {
  return (
    <section className="bg-espresso py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">Власне виробництво</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1] text-milk">
            Від ескізу до вашої спальні
          </h2>
          <p className="mt-6 text-milk/70 text-lg leading-relaxed max-w-xl">
            DOMERA контролює ключові етапи виробництва — матеріали, конструкцію, пошиття, складання та перевірку готового виробу.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          <Reveal className="md:col-span-8" as="div">
            <div className="relative overflow-hidden aspect-[16/10] border border-milk/10">
              <Image src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/694ff8869_generated_577be602.png" alt="Робота майстра DOMERA" className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
              <div className="absolute bottom-5 left-5 text-milk">
                <p className="text-[10px] tracking-[0.3em] uppercase opacity-80">01 · Пошиття</p>
                <p className="font-heading text-xl">Рука майстра</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="md:col-span-4 flex flex-col gap-4 md:gap-5" delay={100}>
            <div className="border border-milk/15 bg-espresso-soft p-7 flex-1 flex flex-col justify-center">
              <p className="font-heading text-3xl text-milk">02</p>
              <p className="mt-2 text-milk/70">Підбір та контроль тканини на кожному етапі.</p>
            </div>
            <div className="border border-milk/15 bg-espresso-soft p-7 flex-1 flex flex-col justify-center">
              <p className="font-heading text-3xl text-milk">03</p>
              <p className="mt-2 text-milk/70">Перевірка готового виробу перед відправкою.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}