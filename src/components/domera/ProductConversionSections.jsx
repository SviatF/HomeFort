'use client';

import { ArrowRight, Check, Clock3, CreditCard, MessageCircle, ShieldCheck, Star, Truck } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Link } from '@/lib/router';

const money = (value = 0) => Number(value || 0).toLocaleString('uk-UA');

export function ProductBenefits({ product }) {
  const benefits = [
    product?.material ? { title: 'Матеріали', value: product.material } : { title: 'Комфорт', value: 'М’яке узголів’я та продумана посадка' },
    product?.warranty ? { title: 'Гарантія', value: product.warranty } : { title: 'Гарантія', value: 'Офіційна гарантія DOMERA' },
    product?.productionTime ? { title: 'Виготовлення', value: product.productionTime } : { title: 'Вибір', value: 'Розміри та тканини під ваш інтер’єр' },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 border-y border-espresso/10">
      {benefits.map((item, index) => (
        <div key={item.title} className={`py-4 ${index > 0 ? 'sm:border-l sm:border-espresso/10 sm:pl-4' : ''}`}>
          <p className="text-[9px] tracking-[0.2em] uppercase text-mocha">{item.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-espresso">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function PriceValueBlock({ price, oldPrice, salePercent }) {
  const saving = oldPrice > price ? oldPrice - price : 0;
  if (!saving && !salePercent) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-l-2 border-champagne pl-4">
      {saving > 0 && <p className="text-sm text-espresso">Ви економите <strong>{money(saving)} ₴</strong></p>}
      {salePercent > 0 && <span className="text-[10px] tracking-[0.18em] uppercase text-champagne">−{salePercent}% зараз</span>}
    </div>
  );
}

export function DeliveryPromise({ product }) {
  return (
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="flex items-center gap-2.5 border border-espresso/10 px-3 py-3 text-xs text-mocha"><Clock3 className="w-4 h-4 text-espresso" strokeWidth={1.5} /><span>{product?.productionTime ? `Виготовлення ${product.productionTime}` : 'Швидке підтвердження замовлення'}</span></div>
      <div className="flex items-center gap-2.5 border border-espresso/10 px-3 py-3 text-xs text-mocha"><Truck className="w-4 h-4 text-espresso" strokeWidth={1.5} /><span>Доставка по Україні</span></div>
      <div className="flex items-center gap-2.5 border border-espresso/10 px-3 py-3 text-xs text-mocha"><CreditCard className="w-4 h-4 text-espresso" strokeWidth={1.5} /><span>Оплата частинами / при отриманні</span></div>
    </div>
  );
}

export function PurchaseSummary({ size, fabric, lifting, mattress, mattresses = [], price }) {
  const selectedMattress = mattresses.find((m) => m.id === mattress);
  const rows = [
    ['Розмір', size || 'Оберіть'],
    fabric ? ['Тканина', fabric] : null,
    ['Механізм', lifting ? 'З підйомним механізмом' : 'Без механізму'],
    selectedMattress ? ['Матрац', selectedMattress.name] : null,
  ].filter(Boolean);

  return (
    <div className="mt-7 bg-[#F3EEE7] border border-espresso/8 p-5">
      <div className="flex items-center justify-between gap-5 mb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha">Ваша комплектація</p>
          <p className="mt-1 text-sm text-espresso">Перевірте вибір перед додаванням у кошик</p>
        </div>
        <p className="font-heading text-2xl text-espresso whitespace-nowrap">{money(price)} ₴</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-xs border-t border-espresso/10 pt-2">
            <span className="text-mocha">{label}</span><span className="text-espresso text-right truncate">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InteriorGallery({ product }) {
  const images = (product?.images || []).slice(1, 5);
  if (images.length < 2) return null;

  return (
    <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.26em] uppercase text-mocha">DOMERA IN SPACE</p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] text-espresso mt-2">Як модель виглядає в інтер’єрі</h2>
        </div>
        <p className="text-sm text-mocha max-w-md">Перегляньте різні ракурси й деталі моделі перед вибором комплектації.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {images.map((src, index) => (
          <div key={`${src}-${index}`} className={`overflow-hidden bg-sand ${index === 0 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <Image src={src} alt={`${product.name} — фото ${index + 2}`} className="w-full aspect-[4/5] object-cover transition-transform duration-700 hover:scale-[1.025]" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReviewSummary({ product }) {
  if (!product?.reviewsCount || Number(product.reviewsCount) <= 0) return null;
  return (
    <section id="reviews" className="mt-20 md:mt-28 bg-espresso text-milk px-6 md:px-10 py-10 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4">
          <p className="text-[10px] tracking-[0.24em] uppercase text-milk/60">Відгуки покупців</p>
          <div className="mt-4 flex items-end gap-3"><span className="font-heading text-6xl">{product.rating || 5}</span><span className="pb-2 text-milk/60">/ 5</span></div>
          <div className="mt-3 flex gap-1 text-champagne">{[0,1,2,3,4].map((i) => <Star key={i} className="w-4 h-4 fill-champagne" strokeWidth={0} />)}</div>
        </div>
        <div className="md:col-span-8 md:border-l md:border-milk/15 md:pl-10">
          <p className="font-heading text-2xl md:text-3xl leading-tight">{product.reviewsCount} підтверджених оцінок цієї моделі</p>
          <p className="mt-3 text-sm text-milk/65 max-w-2xl">Ми показуємо тільки фактичний рейтинг із каталогу. Текстові відгуки з’являються тут після їх додавання в адмінці.</p>
        </div>
      </div>
    </section>
  );
}

export function CompareModels({ products = [] }) {
  const items = products.slice(0, 3);
  if (items.length < 2) return null;
  return (
    <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.26em] uppercase text-mocha">ПОРІВНЯННЯ</p>
        <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] text-espresso mt-2">Ще моделі, які варто розглянути</h2>
      </div>
      <div className="overflow-x-auto border-y border-espresso/10">
        <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `180px repeat(${items.length}, minmax(190px,1fr))` }}>
          <div className="p-4 text-xs uppercase tracking-[0.18em] text-mocha">Модель</div>
          {items.map((p) => <div key={p.id} className="p-4 border-l border-espresso/10"><Link to={`/product/${p.slug}`} className="font-heading text-xl text-espresso hover:text-mocha">{String(p.name || '').replace(/^Ліжко\s+(м['’ʼ]?яке\s+)?Homefort\s*/i, '')}</Link></div>)}
          <div className="p-4 text-xs uppercase tracking-[0.18em] text-mocha border-t border-espresso/10">Ціна від</div>
          {items.map((p) => <div key={`${p.id}-price`} className="p-4 border-l border-t border-espresso/10 text-espresso">{money(p.price)} ₴</div>)}
          <div className="p-4 text-xs uppercase tracking-[0.18em] text-mocha border-t border-espresso/10">Розміри</div>
          {items.map((p) => <div key={`${p.id}-sizes`} className="p-4 border-l border-t border-espresso/10 text-sm text-mocha">{(p.sizes || []).length ? `${new Set(p.sizes).size} варіантів` : 'Під замовлення'}</div>)}
        </div>
      </div>
    </section>
  );
}

export function StickyBuyBar({ product, price, size, onBuy, onQuickBuy }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-milk/95 backdrop-blur-xl border-t border-espresso/10 shadow-[0_-12px_40px_rgba(49,36,27,0.08)] px-4 md:px-8 py-3">
      <div className="mx-auto max-w-[1440px] flex items-center gap-4 md:gap-7">
        <div className="hidden sm:block min-w-0 flex-1">
          <p className="text-[9px] tracking-[0.22em] uppercase text-mocha truncate">{size ? `${product.name} · ${size}` : product.name}</p>
          <p className="font-heading text-xl md:text-2xl text-espresso">{money(price)} ₴</p>
        </div>
        <button onClick={onQuickBuy} className="hidden md:block px-6 py-3 border border-espresso/20 text-[10px] tracking-[0.18em] uppercase text-espresso hover:border-espresso transition-colors">Купити в 1 клік</button>
        <button onClick={onBuy} className="flex-1 sm:flex-none sm:min-w-[260px] group py-3.5 px-6 bg-espresso text-milk text-[11px] tracking-[0.22em] uppercase flex items-center justify-center gap-2">Додати в кошик <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.4} /></button>
      </div>
    </div>
  );
}

export function FloatingConsultation({ onClick }) {
  return (
    <button onClick={onClick} className="fixed right-4 md:right-7 bottom-[88px] md:bottom-[92px] z-30 bg-[#F3EEE7] border border-espresso/15 shadow-elevated px-4 py-3 flex items-center gap-3 hover:bg-milk transition-colors">
      <span className="w-9 h-9 bg-espresso text-milk flex items-center justify-center rounded-full"><MessageCircle className="w-4 h-4" strokeWidth={1.5} /></span>
      <span className="hidden sm:block text-left"><span className="block text-[9px] tracking-[0.18em] uppercase text-mocha">Потрібна допомога?</span><span className="block text-xs text-espresso mt-0.5">Підберемо розмір і тканину</span></span>
    </button>
  );
}

export function ReassuranceRow() {
  return (
    <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-mocha">
      {[['Безпечна оплата', ShieldCheck], ['Гарантія', Check], ['Оплата при отриманні', CreditCard], ['Допомога з тканиною', MessageCircle]].map(([label, Icon]) => (
        <div key={label} className="flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-espresso" strokeWidth={1.5} />{label}</div>
      ))}
    </div>
  );
}
