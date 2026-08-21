'use client';
import Reveal from './Reveal';

const steps = [
  ['01', 'Відбір моделей', 'У каталозі залишаємо моделі з перевіреними характеристиками, зрозумілими комплектаціями та актуальними цінами.'],
  ['02', 'Перевірка матеріалів', 'Зіставляємо заявлені матеріали, конструкцію, доступні розміри та варіанти комплектації перед публікацією.'],
  ['03', 'Контроль даних', 'Підтримуємо характеристики, фото, SEO-дані та інформацію про наявність у єдиній структурі каталогу.'],
];

export default function Production() {
  return (
    <section id="production" className="bg-espresso py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-3xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">Як ми формуємо каталог</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1] text-milk">
            Від характеристик до готового вибору
          </h2>
          <p className="mt-6 text-milk/70 text-lg leading-relaxed max-w-2xl">
            DOMERA виступає продавцем і допомагає порівняти моделі, розміри та комплектації. Для товарів Homefort виробником у картці та структурованих даних вказується Homefort.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {steps.map(([number, title, text], index) => (
            <Reveal key={number} delay={index * 80}>
              <div className="h-full border border-milk/15 bg-espresso-soft p-7 md:p-9">
                <p className="font-heading text-3xl text-champagne">{number}</p>
                <h3 className="font-heading text-2xl text-milk mt-8">{title}</h3>
                <p className="mt-4 text-milk/65 leading-relaxed">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}