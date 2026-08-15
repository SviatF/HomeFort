'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Reveal from './Reveal';

const faqs = [
  { q: 'Як обрати правильний матрац?', a: 'Ми підбираємо матрац під вашу вагу, звички сну та переваги за жорсткістю. Консультант допоможе визначити анатомічну модель, а в шоурумі можна протестувати відчуття наживо.' },
  { q: 'Чи можна змінити тканину ліжка?', a: 'Так. У конфігураторі ви обираєте тканину та колір із сертифікованої палітри DOMERA — від льону до boucle та велюру.' },
  { q: 'Які розміри доступні?', a: 'Від 140×200 до 200×220. Доступні нестандартні розміри під ваш простір за індивідуальним замовленням.' },
  { q: 'Скільки триває виготовлення?', a: 'Стандартні моделі — 5–10 робочих днів. Індивідуальні конфігурації — до 20 днів залежно від тканини та комплекту.' },
  { q: 'Чи є гарантія?', a: 'Так. На каркас — 5 років, на матраци — до 10 років, на механізми — 2 роки. Ми відповідаємо за продукт після покупки.' },
  { q: 'Як працює доставка?', a: 'Доставка по Україні через Нову Пошту або власною логістикою DOMERA. У містах-миллионниках доступна збірка та підйом.' },
  { q: 'Чи можна оплатити частинами?', a: 'Так. Доступна оплата частинами без переплат на 3–6 платежів та розстрочка через LiqPay / WayForPay.' },
  { q: 'Як працює Trade-In?', a: 'Обміняйте старий матрац на знижку −10% на новий матрац DOMERA. Пропозиція діє на визначені моделі.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-espresso-soft py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">FAQ</p>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] text-milk">
              Часті питання
            </h2>
            <p className="mt-5 text-milk/70 leading-relaxed">
              Не знайшли відповідь? Напишіть нам — відповімо протягом дня.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-7 lg:col-start-6" delay={100}>
            <div className="border-t border-milk/15">
              {faqs.map((f, i) => (
                <div key={f.q} className="border-b border-milk/15">
                  <button
                    onClick={() => setOpen(open === i ? -1 : i)}
                    className="w-full flex items-center justify-between py-5 text-left gap-6"
                  >
                    <span className="font-heading text-xl md:text-2xl text-milk">{f.q}</span>
                    <span className="flex-shrink-0 text-milk">
                      {open === i ? <Minus className="w-5 h-5" strokeWidth={1.4} /> : <Plus className="w-5 h-5" strokeWidth={1.4} />}
                    </span>
                  </button>
                  <div className={`grid transition-all duration-500 ease-out ${open === i ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <p className="overflow-hidden text-milk/70 leading-relaxed pr-8">{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}