'use client';
import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

const models = ['Lino', 'Cloud', 'Stone', 'Velvet'];
const sizes = ['140×200', '160×200', '180×200', '200×220'];
const fabrics = [
  { name: 'Boucle', color: '#E4D1BD' },
  { name: 'Linen', color: '#D2BDA8' },
  { name: 'Velvet', color: '#937C68' },
  { name: 'Terra', color: '#755A44' },
];
const steps = ['Модель', 'Розмір', 'Тканина', 'Колір', 'Механізм', 'Матрац'];

export default function Configurator() {
  const [step, setStep] = useState(2);
  const [model, setModel] = useState('Lino');
  const [size, setSize] = useState('160×200');
  const [fabric, setFabric] = useState('Boucle');
  const [lifting, setLifting] = useState(true);

  const fabricObj = fabrics.find((f) => f.name === fabric);

  const chip = (on) => on
    ? 'border-milk bg-milk text-espresso'
    : 'border-milk/25 text-milk hover:border-milk';

  return (
    <section className="bg-graphite py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">Конфігуратор</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.08] text-milk">
            Створіть своє ліжко DOMERA
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <Reveal className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative overflow-hidden aspect-[4/3] bg-espresso-soft border border-milk/10">
              <Image src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/4c132e407_generated_24c0ce0d.png" alt="Попередній перегляд ліжка" className="w-full h-full transition-all duration-700" style={{ filter: `sepia(0.05) hue-rotate(${fabric === 'Velvet' ? -8 : fabric === 'Terra' ? 6 : 0}deg)` }} />
              <div className="absolute top-5 left-5 text-milk">
                <p className="text-[10px] tracking-[0.3em] uppercase text-champagne">Превʼю</p>
                <p className="font-heading text-2xl">DOMERA {model}</p>
              </div>
              <div className="absolute bottom-5 right-5 flex items-center gap-2 bg-espresso/70 backdrop-blur px-3 py-2 border border-milk/15">
                <span className="w-4 h-4 rounded-full border border-milk/25" style={{ background: fabricObj.color }} />
                <span className="text-sm text-milk">{fabric}</span>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5 order-1 lg:order-2" delay={100}>
            {/* Steps */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
              {steps.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(i)}
                  className={`text-[11px] tracking-[0.18em] uppercase pb-1 border-b-2 transition-colors ${
                    i === step ? 'border-milk text-milk' : 'border-transparent text-milk/50 hover:text-milk'
                  }`}
                >
                  <span className="opacity-50">0{i + 1}</span> {s}
                </button>
              ))}
            </div>

            {step >= 0 && (
              <div className="mb-7">
                <p className="text-[11px] tracking-[0.22em] uppercase text-champagne mb-3">Модель</p>
                <div className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <button key={m} onClick={() => setModel(m)} className={`px-4 py-2.5 border text-sm transition-all ${chip(model === m)}`}>{m}</button>
                  ))}
                </div>
              </div>
            )}

            {step >= 1 && (
              <div className="mb-7">
                <p className="text-[11px] tracking-[0.22em] uppercase text-champagne mb-3">Розмір</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={`px-4 py-2.5 border text-sm transition-all ${chip(size === s)}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {step >= 2 && (
              <div className="mb-7">
                <p className="text-[11px] tracking-[0.22em] uppercase text-champagne mb-3">Тканина</p>
                <div className="grid grid-cols-4 gap-3">
                  {fabrics.map((f) => (
                    <button key={f.name} onClick={() => setFabric(f.name)} className={`group text-left ${fabric === f.name ? 'ring-1 ring-milk' : ''}`}>
                      <span className="block aspect-square mb-2 transition-transform group-hover:scale-[1.03]" style={{ background: f.color }} />
                      <span className="text-xs text-milk/70">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step >= 4 && (
              <div className="mb-7">
                <p className="text-[11px] tracking-[0.22em] uppercase text-champagne mb-3">Підйомний механізм</p>
                <div className="flex gap-2">
                  <button onClick={() => setLifting(true)} className={`flex-1 px-4 py-3 border text-sm flex items-center justify-between ${chip(lifting)}`}>
                    З механізмом {lifting && <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setLifting(false)} className={`flex-1 px-4 py-3 border text-sm ${chip(!lifting)}`}>
                    Без механізму {!lifting && <Check className="w-4 h-4 inline" />}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-milk/15 pt-6 mt-8">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-champagne">Ваша конфігурація</p>
                  <p className="font-heading text-2xl text-milk mt-1">{model} · {size} · {fabric}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-champagne">Від</p>
                  <p className="font-heading text-3xl text-milk">{lifting ? '34 800' : '32 400'} ₴</p>
                </div>
              </div>
              <button className="group w-full py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-champagne transition-colors">
                Додати в кошик <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}