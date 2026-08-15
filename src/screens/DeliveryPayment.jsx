'use client';
import { Link } from '@/lib/router';
import { Truck, CreditCard, Shield, RotateCcw } from 'lucide-react';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';
import Reveal from '@/components/domera/Reveal';
import { useSettings } from '@/lib/useSettings';

const fallback = {
  delivery: 'Доставка по Україні через Нову Пошту (відділення, поштомат або кур’єр), власну логістику DOMERA у великих містах та самовивіз із шоуруму в Одесі. Термін — 1–3 дні після виготовлення. Вартість розраховується за тарифами перевізника; при замовленні від 30 000 ₴ доставка безкоштовна.',
  payment: 'Оплата карткою онлайн, безготівковий розрахунок, післяплата при отриманні (за наявності), оплата частинами без переплат на 3–6 платежів через LiqPay / WayForPay.',
  warranty: 'Гарантія на каркас ліжка — до 5 років, на матраци — до 10 років, на механізми — 2 роки. Точний строк вказано на сторінці товару. Гарантія покриває виробничі дефекти; не покриває природне зношення та механічні пошкодження.',
  returns: 'Повернення здійснюється відповідно до чинного законодавства України. Для виготовлених на замовлення ліжок умови повернення узгоджуються індивідуально — будь ласка, зв’яжіться з нами до відправлення замовлення.',
};

export default function DeliveryPayment() {
  const s = useSettings();
  const sections = [
    { icon: Truck, title: 'Доставка', body: s?.deliveryInfo || fallback.delivery },
    { icon: CreditCard, title: 'Оплата', body: s?.paymentInfo || fallback.payment },
    { icon: Shield, title: 'Гарантія', body: s?.warrantyInfo || fallback.warranty },
    { icon: RotateCcw, title: 'Повернення', body: s?.returnInfo || fallback.returns },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo
        title="Доставка, оплата та гарантія — DOMERA"
        description="Умови доставки по Україні, способи оплати, гарантія та повернення товарів DOMERA."
        canonical="/delivery-payment"
      />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 md:py-20">
          <nav className="text-xs text-[#937C68] mb-6 flex gap-2">
            <Link to="/" className="hover:text-[#342112]">Головна</Link><span>/</span>
            <span className="text-[#342112]">Доставка та оплата</span>
          </nav>
          <Reveal>
            <h1 className="font-heading text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] text-[#342112]">Доставка, оплата та гарантія</h1>
            <p className="mt-4 max-w-2xl text-[#755A44] text-lg leading-relaxed">Прозорі умови на кожному етапі — від виготовлення до отримання.</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-[#342112]/10">
            {sections.map((sec) => (
              <Reveal key={sec.title} className="bg-[#FAF7F2] p-8 md:p-10">
                <sec.icon className="w-7 h-7 text-[#937C68] mb-5" strokeWidth={1.3} />
                <h2 className="font-heading text-2xl text-[#342112] mb-3">{sec.title}</h2>
                <p className="text-[#755A44] leading-relaxed whitespace-pre-line">{sec.body}</p>
              </Reveal>
            ))}
          </div>

          {s?.phone && (
            <p className="mt-10 text-sm text-[#937C68]">
              Залишились питання? Зателефонуйте <a href={`tel:${s.phone}`} className="text-[#342112] underline">{s.phone}</a>
              {s?.email && <> або напишіть на <a href={`mailto:${s.email}`} className="text-[#342112] underline">{s.email}</a></>}.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}