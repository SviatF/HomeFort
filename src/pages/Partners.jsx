'use client';
import { Link } from '@/lib/router';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Reveal from '@/components/domera/Reveal';
import Seo from '@/components/Seo';
import { Image } from '@/components/ui/image';

const audiences = [
  { n: '01', t: 'Дизайнерам та студіям', d: 'Матеріали, зразки та оперативний підбір рішень під проєкти.' },
  { n: '02', t: 'Меблевим магазинам', d: 'Стабільне постачання продукту від виробника без власного цеху.' },
  { n: '03', t: 'Готелям та апартаментам', d: 'Серійне виробництво ліжок та текстилю з прогнозованими термінами.' },
  { n: '04', t: 'Забудовникам', d: 'Комплектація інтерʼєрів під ключ — від спальню до цілої черги.' },
];

const workflow = ['Заявка та брифінг', 'Підбір асортименту', 'Оптовий прайс', 'Зразки матеріалів', 'Контракт та план постачання', 'Виробництво та відвантаження'];

export default function Partners() {
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-[#342112] text-[#FAF7F2]">
      <Seo
        title="DOMERA для партнерів — опт, дропшипінг, B2B | Виробництво ліжок та матраців"
        description="Співпраця з DOMERA для дизайнерів, меблевих магазинів, готелів та забудовників: опт, дропшипінг, серійне виробництво ліжок, матраців та текстилю від власного цеху."
        canonical="/partners"
      />
      <Header />

      {/* Hero */}
      <section className="relative pt-[120px] pb-20 md:pt-44 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/694ff8869_generated_577be602.png" alt="Виробництво DOMERA" className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-[#342112]/55" />
        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#C6A17A] mb-6 animate-fade-in">DOMERA · Для партнерів</p>
          <h1 className="font-heading text-[clamp(2.4rem,6vw,5rem)] leading-[1.05] max-w-3xl animate-fade-up">
            Виробництво, на яке можна спиратися
          </h1>
          <p className="mt-7 text-[#FAF7F2]/80 text-lg leading-relaxed max-w-xl animate-fade-up" style={{ animationDelay: '120ms' }}>
            Ліжка, матраци та текстиль DOMERA для дизайнерів, магазинів, забудовників, готелів та партнерів.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <a href="#lead" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FAF7F2] text-[#342112] text-[12px] tracking-[0.22em] uppercase hover:bg-[#C6A17A] transition-colors">
              Отримати умови співпраці <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
            </a>
            <a href="#catalog" className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#FAF7F2]/40 text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase hover:border-[#FAF7F2] transition-colors">
              Завантажити каталог <ArrowUpRight className="w-4 h-4" strokeWidth={1.4} />
            </a>
          </div>
        </div>
      </section>

      {/* Кому підходить */}
      <section className="py-20 md:py-32 border-t border-[#FAF7F2]/15">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <Reveal className="max-w-2xl mb-14 md:mb-20">
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#C6A17A] mb-4">Кому підходить</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1]">Партнерство під ваш формат</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#FAF7F2]/10">
            {audiences.map((a, i) => (
              <Reveal key={a.n} delay={i * 80} className="bg-[#342112] p-10 md:p-12">
                <span className="text-[11px] tracking-[0.3em] text-[#C6A17A]">{a.n}</span>
                <h3 className="font-heading text-3xl mt-4 mb-3">{a.t}</h3>
                <p className="text-[#FAF7F2]/75 leading-relaxed max-w-md">{a.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Що можемо виробляти */}
      <section className="py-20 md:py-32 border-t border-[#FAF7F2]/15 bg-[#2a190d]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#C6A17A] mb-4">Виробництво</p>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] leading-[1.1]">Що ми виробляємо</h2>
            <p className="mt-6 text-[#FAF7F2]/75 leading-relaxed max-w-md">
              Повний цикл власного виробництва: від розкрою тканини до фінальної перевірки готового виробу.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7" delay={100}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {['М’які ліжка', 'Ліжка з підйомним механізмом', 'Анатомічні матраци', 'Наматрацники', 'Подушки та ковдри', 'Постільна білизна', 'Дитячі матраци', 'Індивідуальні розміри'].map((x) => (
                <div key={x} className="flex items-center gap-3 border-b border-[#FAF7F2]/15 pb-3">
                  <Check className="w-4 h-4 text-[#C6A17A]" strokeWidth={1.6} />
                  <span className="text-[#FAF7F2]/85">{x}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Опт та дропшипінг */}
      <section className="py-20 md:py-32 border-t border-[#FAF7F2]/15">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { t: 'Wholesale', d: 'Оптові ціни від виробника з прозорою шкалою залежно від обсягу.' },
            { t: 'Dropshipping', d: 'Відвантажуємо під вашого клієнта — вам не потрібен склад та власне виробництво.' },
            { t: 'Постачання та контроль', d: 'Прогнозовані терміни, контроль якості, персональний менеджер.' },
          ].map((b, i) => (
            <Reveal key={b.t} delay={i * 90} className="border border-[#FAF7F2]/15 p-10">
              <span className="text-[11px] tracking-[0.3em] text-[#C6A17A]">0{i + 1}</span>
              <h3 className="font-heading text-2xl mt-4 mb-3">{b.t}</h3>
              <p className="text-[#FAF7F2]/75 leading-relaxed">{b.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 md:py-32 border-t border-[#FAF7F2]/15 bg-[#2a190d]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <Reveal className="max-w-2xl mb-14">
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#C6A17A] mb-4">Співпраця</p>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] leading-[1.1]">Як ми починаємо працювати</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#FAF7F2]/10">
            {workflow.map((w, i) => (
              <Reveal key={w} delay={i * 60} className="bg-[#342112] p-6 md:p-7">
                <span className="text-[10px] tracking-[0.3em] text-[#C6A17A]">0{i + 1}</span>
                <p className="font-heading text-lg mt-3 leading-snug">{w}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id="lead" className="py-20 md:py-32 border-t border-[#FAF7F2]/15">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#C6A17A] mb-4">B2B-заявка</p>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] leading-[1.1]">Отримати B2B-пропозицію</h2>
            <p className="mt-6 text-[#FAF7F2]/75 leading-relaxed max-w-md">
              Заповніть форму — менеджер підготував умови співпраці під ваш формат та надішле оптовий каталог.
            </p>
            <div className="mt-8 space-y-2 text-[#FAF7F2]/70 text-sm">
              <p>· Відповідь протягом одного робочого дня</p>
              <p>· Зразки тканин та матеріали для дизайнерів</p>
              <p>· Можливість роботи без власного виробництва</p>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6 lg:col-start-7" delay={100}>
            {sent ? (
              <div className="border border-[#C6A17A]/40 p-12 flex flex-col items-center text-center">
                <Check className="w-10 h-10 text-[#C6A17A] mb-5" strokeWidth={1.2} />
                <h3 className="font-heading text-3xl mb-3">Дякуємо!</h3>
                <p className="text-[#FAF7F2]/75 max-w-sm">Ваша заявка прийнята. Менеджер DOMERA зв’яжеться з вами найближчим робочим днем.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Ім’я" name="name" placeholder="Ваше ім’я" />
                  <Field label="Назва компанії" name="company" placeholder="Компанія" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Телефон" name="phone" type="tel" placeholder="+380" required />
                  <Field label="Email" name="email" type="email" placeholder="you@company.ua" required />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.22em] uppercase text-[#FAF7F2]/60 mb-3 block">Формат співпраці</label>
                  <div className="flex flex-wrap gap-2">
                    {['Опт', 'Dropshipping', 'Готель', 'Забудовник', 'Дизайнер', 'Інше'].map((o) => (
                      <span key={o} className="px-4 py-2.5 border border-[#FAF7F2]/25 text-sm cursor-pointer hover:border-[#C6A17A] hover:text-[#C6A17A] transition-colors">{o}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.22em] uppercase text-[#FAF7F2]/60 mb-2 block">Коментар</label>
                  <textarea rows={4} placeholder="Коротко про ваш проєкт чи потребу" className="w-full bg-transparent border-b border-[#FAF7F2]/25 py-3 text-[#FAF7F2] placeholder:text-[#FAF7F2]/35 focus:border-[#C6A17A] outline-none transition-colors resize-none" />
                </div>
                <button type="submit" className="group w-full py-4 bg-[#FAF7F2] text-[#342112] text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-[#C6A17A] transition-colors">
                  Надіслати заявку <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, name, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="text-[11px] tracking-[0.22em] uppercase text-[#FAF7F2]/60 mb-2 block">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-[#FAF7F2]/25 py-3 text-[#FAF7F2] placeholder:text-[#FAF7F2]/35 focus:border-[#C6A17A] outline-none transition-colors"
      />
    </div>
  );
}