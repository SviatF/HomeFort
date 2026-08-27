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

function BankMark({ bank }) {
  if (bank.id === 'monobank') {
    return <div aria-label="monobank" className="min-w-[70px] h-9 px-3 rounded-lg bg-[#111111] text-white flex items-center justify-center font-semibold tracking-[-0.03em] text-[15px]">mono</div>;
  }
  return <div aria-label="ПриватБанк" className="min-w-[96px] h-9 px-3 rounded-lg bg-[#69A82F] text-white flex items-center justify-center font-semibold tracking-[-0.03em] text-[13px]">ПриватБанк</div>;
}

export function BankInstallmentBlock({ product, price }) {
  const options = bankInstallmentOptions(product, price);
  if (!options.length) return null;

  return <section className="mt-4" aria-label="Оплата частинами">
    <div className="flex items-center justify-between gap-4 mb-2.5">
      <p className="text-[11px] tracking-[0.18em] uppercase text-mocha">Розстрочка / оплата частинами</p>
      <span className="text-[11px] text-mocha">без переходу з товару</span>
    </div>
    <div className={`grid gap-2.5 ${options.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      {options.map((bank) => (
        <div key={bank.id} className="ui-radius-md border border-espresso/10 bg-ivory px-4 py-3.5 flex items-center gap-3.5 min-h-[82px]">
          <BankMark bank={bank} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-mocha">Оплата частинами</p>
            <p className="mt-0.5 text-[15px] font-semibold text-espresso leading-tight">від {money(bank.monthly)} ₴/міс</p>
            <p className="mt-1 text-[11px] text-mocha">до {bank.months} платежів</p>
          </div>
        </div>
      ))}
    </div>
    <p className="mt-2 text-[11px] leading-relaxed text-mocha">Остаточна доступність, ліміт і умови банку підтверджуються під час оформлення.</p>
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
