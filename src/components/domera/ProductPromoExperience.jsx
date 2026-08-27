'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock3, Phone, X } from 'lucide-react';
import { discountDeadline, discountLabel, discountPercent, formatCountdown, isDiscountActive, oldPrice, popupConfig } from '@/lib/product-promo';
import { bankInstallmentOptions } from '@/lib/installment';

const money = (value) => Number(value || 0).toLocaleString('uk-UA');
const POPUP_KEY = 'domera_product_popup_seen_at_v1';
const DAY = 24 * 60 * 60 * 1000;

export function DiscountBadge({ product, compact = false }) {
  if (!isDiscountActive(product)) return null;
  return <span className={`${compact ? 'text-[10px] px-2 py-1' : 'text-[11px] px-3 py-1.5'} inline-flex items-center bg-[#C8643B] text-white tracking-[0.12em] uppercase font-semibold`}>{discountLabel(product)}</span>;
}

const BANK_META = {
  monobank: {
    name: 'monobank',
    logo: '/banks/monobank.svg',
    surface: 'bg-[#F3F3F3]',
    border: 'border-[#111111]/15',
    accent: 'bg-[#111111]',
    amount: 'text-[#111111]',
    eyebrow: 'text-[#666666]',
    hover: 'hover:border-[#111111]/35 hover:shadow-[0_10px_30px_rgba(17,17,17,0.08)]',
  },
  privatbank: {
    name: 'ПриватБанк',
    logo: '/banks/privatbank.svg',
    surface: 'bg-[#F4F8EF]',
    border: 'border-[#69A82F]/25',
    accent: 'bg-[#69A82F]',
    amount: 'text-[#315A16]',
    eyebrow: 'text-[#62824D]',
    hover: 'hover:border-[#69A82F]/55 hover:shadow-[0_10px_30px_rgba(105,168,47,0.10)]',
  },
};

function BankInstallmentCard({ bank }) {
  const meta = BANK_META[bank.id] || BANK_META.monobank;
  return (
    <div className={`relative overflow-hidden ui-radius-md border ${meta.border} ${meta.surface} ${meta.hover} transition-all duration-200 min-h-[118px] p-4 md:p-5`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${meta.accent}`} aria-hidden="true" />
      <div className="flex items-center gap-4">
        <div className="w-[108px] md:w-[122px] flex-shrink-0">
          <img src={meta.logo} alt={meta.name} className="block w-full h-auto" loading="lazy" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] md:text-[11px] uppercase tracking-[0.14em] ${meta.eyebrow}`}>Оплата частинами</p>
          <p className={`mt-1 font-heading text-[22px] md:text-[25px] font-extrabold leading-none ${meta.amount}`}>від {money(bank.monthly)} ₴/міс</p>
          <p className="mt-2 text-[12px] md:text-[13px] text-mocha">до {bank.months} платежів</p>
        </div>
      </div>
    </div>
  );
}

export function BankInstallmentBlock({ product, price }) {
  const options = bankInstallmentOptions(product, price);
  if (!options.length) return null;

  return <section className="mt-5" aria-label="Розстрочка та оплата частинами">
    <div className="flex items-center justify-between gap-4 mb-3">
      <div>
        <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-mocha">Розстрочка / оплата частинами</p>
        <p className="mt-1 text-[12px] text-mocha">Оберіть зручний банк при оформленні</p>
      </div>
      <span className="hidden md:inline text-[11px] text-mocha whitespace-nowrap">без переходу з товару</span>
    </div>
    <div className={`grid gap-3 ${options.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {options.map((bank) => <BankInstallmentCard key={bank.id} bank={bank} />)}
    </div>
    <p className="mt-2.5 text-[11px] md:text-[12px] leading-relaxed text-mocha">Остаточна доступність, кредитний ліміт і умови визначаються банком під час оформлення.</p>
  </section>;
}

export function DiscountPrice({ product, price, className = '' }) {
  const active = isDiscountActive(product);
  const old = oldPrice(product);
  const deadline = discountDeadline(product);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active || !deadline) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [active, deadline]);
  const countdown = active ? formatCountdown(deadline, now) : '';
  return <div className={className}>
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className={`font-heading text-4xl font-extrabold ${active ? 'text-[#C8643B]' : 'text-espresso'}`}>{money(price)} ₴</span>
      {active && old > price && <span className="text-lg text-mocha line-through">{money(old)} ₴</span>}
      {active && <span className="text-[11px] px-2.5 py-1 bg-[#C8643B]/10 text-[#A34E2F] font-semibold">−{discountPercent(product)}%</span>}
    </div>
    {countdown && <div className="mt-2 inline-flex items-center gap-2 text-[13px] text-[#A34E2F]"><Clock3 className="w-4 h-4" /> Акція діє ще: <strong>{countdown}</strong></div>}
    <BankInstallmentBlock product={product} price={price} />
  </div>;
}

export function ConsultationMagnet({ onOpen, emphasis = false, compact = false }) {
  return <div className={`${compact ? 'p-3' : 'p-4 md:p-5'} ${emphasis ? 'bg-[#C8643B]/10 border-[#C8643B]/30' : 'bg-ivory border-espresso/10'} border ui-radius-md`}><div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"><div className="flex-1 min-w-0"><p className={`${compact ? 'text-base' : 'font-heading text-xl'} text-espresso`}>Не впевнені з розміром чи тканиною?</p><p className="mt-1 text-[13px] leading-relaxed text-mocha">Менеджер підбере варіант під ваш інтер’єр за 15 хвилин.</p></div><button type="button" onClick={onOpen} className="ui-radius-sm min-h-11 px-5 bg-[#C8643B] text-white text-[12px] uppercase tracking-[0.12em] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap"><Phone className="w-4 h-4" /> Замовити дзвінок</button></div></div>;
}

export function TimedProductPopup({ product, onConsult }) {
  const config = useMemo(() => popupConfig(product), [product]);
  const activeDiscount = isDiscountActive(product);
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(formatCountdown(discountDeadline(product)));
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (config.discountOnly && !activeDiscount) return undefined;
    const seen = Number(localStorage.getItem(POPUP_KEY) || 0);
    if (seen && Date.now() - seen < DAY) return undefined;
    let shown = false;
    const show = () => { if (shown) return; shown = true; localStorage.setItem(POPUP_KEY, String(Date.now())); setOpen(true); };
    const timer = setTimeout(show, config.delaySeconds * 1000);
    const onMouseOut = (event) => { if (event.clientY <= 4 && !event.relatedTarget) show(); };
    document.addEventListener('mouseout', onMouseOut);
    return () => { clearTimeout(timer); document.removeEventListener('mouseout', onMouseOut); };
  }, [product?.id, activeDiscount, config.discountOnly, config.delaySeconds]);
  useEffect(() => {
    if (!open || !activeDiscount || !discountDeadline(product)) return undefined;
    const timer = setInterval(() => setCountdown(formatCountdown(discountDeadline(product))), 60000);
    return () => clearInterval(timer);
  }, [open, product?.id, activeDiscount]);
  if (!open) return null;
  const defaultText = activeDiscount ? `Ще не визначились? Ця модель за акційною ціною${countdown ? ` ще ${countdown}` : ''}. Залиште номер — допоможемо підібрати тканину та розмір.` : 'Потрібна допомога з розміром, тканиною чи комплектацією? Залиште номер — менеджер допоможе визначитися.';
  return <div className="fixed inset-0 z-[75] flex items-center justify-center px-4"><div className="absolute inset-0 bg-espresso/45 backdrop-blur-sm" onClick={() => setOpen(false)} /><div className="relative w-full max-w-lg bg-milk p-6 md:p-8 shadow-2xl ui-radius-md"><button type="button" aria-label="Закрити" onClick={() => setOpen(false)} className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center text-mocha"><X className="w-5 h-5" /></button>{activeDiscount && <DiscountBadge product={product} />}<h3 className="font-heading text-3xl text-espresso mt-4 pr-10">Ще не визначились?</h3><p className="mt-3 text-[15px] leading-relaxed text-mocha">{config.text || defaultText}</p><button type="button" onClick={() => { setOpen(false); onConsult(); }} className="ui-radius-sm mt-6 w-full min-h-12 bg-[#C8643B] text-white uppercase tracking-[0.12em] text-[12px] font-semibold flex items-center justify-center gap-2">Отримати консультацію <ArrowRight className="w-4 h-4" /></button><p className="mt-3 text-center text-[11px] text-mocha">Залиште телефон — менеджер зв’яжеться у зручний для вас час.</p></div></div>;
}
