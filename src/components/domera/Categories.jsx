'use client';
import { Link } from '@/lib/router';
import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

const cats = [
  {
    n: '01', title: 'Ліжка', to: '/catalog/beds', img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/4e4baa3c5_generated_24d0f002.png',
    span: 'md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[640px]',
  },
  {
    n: '02', title: 'Матраци', to: '/catalog/mattresses', img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/e8cde0867_generated_b68255c5.png',
    span: 'md:col-span-5 aspect-[4/3]',
  },
  {
    n: '03', title: 'Постільна білизна', to: '/catalog/textile', img: 'https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/0bc6eff54_generated_6ca5af5c.png',
    span: 'md:col-span-5 aspect-[4/3]',
  },
];

const mini = [
  { n: '04', title: 'Наматрацники', to: '/catalog/toppers' },
  { n: '05', title: 'Подушки', to: '/catalog/pillows' },
  { n: '06', title: 'Ковдри', to: '/catalog/duvets' },
  { n: '07', title: 'Дитячі матраци', to: '/catalog/kids-mattresses' },
];

export default function Categories() {
  return (
    <section className="bg-ivory py-24 md:py-36 text-espresso">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4 font-medium">Категорії</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.06] text-espresso">
            Створіть спальню навколо себе
          </h2>
          <p className="mt-5 text-mocha text-lg leading-relaxed">
            Від основи вашого сну до деталей, які створюють відчуття дому.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 auto-rows-auto">
          {cats.map((c, i) => (
            <Reveal
              key={c.title}
              as={Link}
              to={c.to}
              delay={i * 80}
              className={`group relative overflow-hidden border border-espresso/10 shadow-soft hover:shadow-card transition-shadow duration-500 ${c.span}`}
            >
              <Image
                src={c.img}
                alt={c.title}
                className="absolute inset-0 w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/88 via-espresso/24 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8 min-h-[inherit]">
                <span className="text-[10px] tracking-[0.32em] uppercase text-champagne mb-2 font-medium">{c.n}</span>
                <div className="flex items-end justify-between">
                  <h3 className="font-heading text-milk text-3xl md:text-4xl">{c.title}</h3>
                  <ArrowUpRight className="w-6 h-6 text-milk/80 -translate-y-1 transition-all duration-500 group-hover:translate-y-0 group-hover:text-champagne" strokeWidth={1.4} />
                </div>
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-milk/90 border-b border-milk/45 pb-0.5 self-start group-hover:border-champagne group-hover:text-champagne transition-colors">
                  Обрати
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mt-4 md:mt-5">
          {mini.map((m, i) => (
            <Reveal
              key={m.title}
              as={Link}
              to={m.to}
              delay={i * 60}
              className="group flex items-center justify-between border-b border-espresso/15 pb-4 hover:border-espresso transition-colors"
            >
              <span className="flex items-baseline gap-3">
                <span className="text-[10px] tracking-[0.3em] text-champagne font-medium">{m.n}</span>
                <span className="font-heading text-xl text-espresso group-hover:text-mocha transition-colors">{m.title}</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-mocha group-hover:text-espresso transition-colors" strokeWidth={1.5} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
