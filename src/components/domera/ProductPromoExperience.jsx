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

const BANK_LOGOS = {
  monobank: { src: '/mono.png', alt: 'monobank', className: 'h-[20px] sm:h-[22px] max-w-[84px]' },
  privatbank: { src: '/pryvat.png', alt: 'ПриватБанк', className: 'h-[22px] sm:h-[24px] max-w-[104px]' },
  pumb: { src: '/pymb.png', alt: 'ПУМБ', className: 'h-[21px] sm:h-[23px] max-w-[86px]' },
};

export function BankInstallmentBlock({ product, price }) {
  const options = bankInstallmentOptions(product, price);
  if (!options.length) return null;

  const monthlyValues = options.map((bank) => Number(bank.monthly || 0)).filter((value) => value > 0);
  const monthValues = options.map((bank) => Number(bank.months || 0)).filter((value) => value > 0);
  const monthlyFrom = monthlyValues.length ? Math.min(...monthlyValues) : 0;
  const maxMonths = monthValues.length ? Math.max(...monthValues) : 0;

  return (
    <section className="mt-5 max-w-[620px]" aria-label="Оплата частинами">
      <div className="relative overflow-hidden rounded-[22px] border border-espresso/[0.09] bg-gradient-to-br from-white/90 via-white/75 to-[#F7F1E9]/80 px-5 py-4.5 shadow-[0_8px_24px_rgba(52,33,18,0.045)] sm:px-6 sm:py-5">
        <div className="absolute inset-y-0 left-0 w-[3px] bg-[#C8643B]/75" aria-hidden="true" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A36B4E]">Оплата частинами</p>
            <p className="mt-1 text-[12px] text-mocha">Mono · ПриватБанк · ПУМБ</p>
          </div>

          <div className="flex items-center gap-2.5" aria-label="Банки-партнери">
            {options.map((bank) => {
              const logo = BANK_LOGOS[bank.id];
              if (!logo) return null;
              return (
                <div key={bank.id} className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-espresso/[0.07] bg-white px-2.5 shadow-[0_3px_10px_rgba(52,33,18,0.035)]">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className={`w-auto object-contain ${logo.className}`}
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1 border-t border-espresso/[0.08] pt-4">
          <span className="font-heading text-[30px] font-semibold leading-none tracking-[-0.025em] text-espresso sm:text-[34px]">
            від {money(monthlyFrom)} ₴/міс
          </span>
          {maxMonths > 0 && <span className="pb-0.5 text-[13px] text-mocha">до {maxMonths} платежів</span>}
        </div>

        <p className="mt-2.5 text-[11px] leading-relaxed text-mocha/90">Ліміт і доступність підтверджує банк під час оформлення.</p>
      </div>
    </section>
  );
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
      <span className={`font-heading text-4xl font-extrabold ${active ? 'text-[#B44E2C]' : 'text-espresso'}`}>{money(price)} ₴</span>
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
