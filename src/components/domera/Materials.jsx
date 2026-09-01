'use client';
import { useState } from 'react';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

const materials = [
  { name: 'Льон', comp: '100% натуральний льон', props: 'Дихаючий, гіпоалергенний', care: 'Прати 30°C', color: '#D2BDA8' },
  { name: 'Boucle', comp: 'Бавовна + поліестер', props: 'Тактильний, обʼємний', care: 'Суха чистка', color: '#E4D1BD' },
  { name: 'Velvet', comp: 'Мікровелюр', props: 'М’який, благородний блик', care: 'Прати делікатно', color: '#937C68' },
  { name: 'Terra', comp: 'Змішана тканина', props: 'Стійкий, щільний', care: 'Прати 40°C', color: '#755A44' },
];

export default function Materials() {
  const [active, setActive] = useState(0);
  const m = materials[active];

  return (
    <section id="materials" className="bg-espresso-soft py-24 md:py-36 scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">Матеріали</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.08] text-milk">
            Матеріали, які хочеться торкатися
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal className="lg:col-span-6">
            <div className="relative overflow-hidden aspect-square bg-espresso border border-milk/10">
              <Image src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/9b3a8ac1a_generated_e25635c3.png" alt={m.name} className="w-full h-full transition-opacity duration-500" key={active} />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="font-heading text-3xl text-milk">{m.name}</span>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={100}>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {materials.map((mat, i) => (
                <button key={mat.name} onClick={() => setActive(i)} className={`group text-left ${i === active ? 'ring-1 ring-milk' : ''}`}>
                  <span className="block aspect-square mb-2 transition-transform group-hover:scale-[1.04]" style={{ background: mat.color }} />
                  <span className="text-xs text-milk/70">{mat.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-5 border-t border-milk/15 pt-6">
              <div className="flex justify-between gap-6">
                <span className="text-[11px] tracking-[0.22em] uppercase text-champagne">Склад</span>
                <span className="text-right text-milk">{m.comp}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-[11px] tracking-[0.22em] uppercase text-champagne">Властивості</span>
                <span className="text-right text-milk">{m.props}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-[11px] tracking-[0.22em] uppercase text-champagne">Догляд</span>
                <span className="text-right text-milk">{m.care}</span>
              </div>
            </div>
            <p className="mt-8 text-milk/70 leading-relaxed">
              Усі тканини сертифіковані Oeko-Tex Standard 100 та проходять попередню декатировку, щоб зберегти форму та колір роками.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
