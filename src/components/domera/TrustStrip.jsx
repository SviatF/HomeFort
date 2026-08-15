'use client';
const items = [
  { title: 'Власне виробництво', sub: 'Контроль кожного етапу' },
  { title: 'Гарантія якості', sub: 'Відповідаємо за продукт' },
  { title: 'Оплата частинами', sub: 'Без переплат' },
  { title: 'Доставка по Україні', sub: 'Нова Пошта та власна' },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-milk/10 bg-espresso-soft">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-milk/10">
          {items.map((it) => (
            <div key={it.title} className="px-4 py-8 md:py-10 flex flex-col items-center text-center md:items-start md:text-left">
              <h3 className="font-heading text-lg md:text-xl text-milk">{it.title}</h3>
              <p className="text-xs md:text-sm text-milk/55 mt-1">{it.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}