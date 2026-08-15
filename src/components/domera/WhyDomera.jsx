'use client';
import Reveal from './Reveal';

const reasons = [
  { n: '01', t: 'Власне виробництво', d: 'Контролюємо якість і терміни.' },
  { n: '02', t: 'Продуманий комфорт', d: 'Підбираємо не товар, а рішення для сну.' },
  { n: '03', t: 'Сертифіковані матеріали', d: 'Матеріали, яким можна довіряти.' },
  { n: '04', t: 'Гарантія', d: 'Відповідаємо за продукт після покупки.' },
  { n: '05', t: 'Доставка по Україні', d: 'Організуємо отримання просто.' },
];

export default function WhyDomera() {
  return (
    <section className="bg-graphite py-24 md:py-36 border-t border-milk/10">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">Чому DOMERA</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.08] text-milk">
            Пʼять причин довіряти нам свій сон
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-milk/10">
          {reasons.map((r, i) => (
            <Reveal key={r.n} delay={i * 70} className="bg-graphite p-8 md:p-9 lg:min-h-[260px] flex flex-col">
              <span className="text-[11px] tracking-[0.3em] text-champagne mb-5">{r.n}</span>
              <h3 className="font-heading text-2xl text-milk mb-3">{r.t}</h3>
              <p className="text-milk/70 leading-relaxed text-sm">{r.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}