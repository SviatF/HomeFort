'use client';
import { Link } from '@/lib/router';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

const audience = ['Дизайнери', 'Меблеві магазини', 'Готелі', 'Апартаменти', 'Забудовники', 'Інтерʼєрні студії', 'Дропшипінг-партнери'];
const benefits = ['Оптові умови', 'Власне виробництво', 'Контроль якості', 'Прогнозовані поставки', 'Підтримка менеджера', 'Dropshipping', 'Матеріали для дизайнерів', 'Довгострокові умови'];

export default function B2BSection() {
  return (
    <section className="bg-espresso text-milk py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-5">Для бізнесу</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1]">
              DOMERA для бізнесу та професіоналів
            </h2>
            <p className="mt-6 text-milk/75 text-lg leading-relaxed max-w-md">
              Стабільний продукт для продажу та реалізації проєктів — напряму від виробника.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {audience.map((a) => (
                <span key={a} className="px-4 py-2 border border-milk/20 text-sm text-milk/80">{a}</span>
              ))}
            </div>

            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link to="/partners" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase hover:bg-champagne transition-colors">
                Стати партнером <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </Link>
              <Link to="/partners" className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-milk/30 text-milk text-[12px] tracking-[0.22em] uppercase hover:border-milk transition-colors">
                Отримати B2B-пропозицію
              </Link>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
            <div className="grid grid-cols-2 gap-px bg-milk/10">
              {benefits.map((b, i) => (
                <div key={b} className="bg-espresso p-6 md:p-7">
                  <span className="text-[10px] tracking-[0.3em] text-champagne">0{i + 1}</span>
                  <p className="font-heading text-lg mt-2 leading-snug">{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}