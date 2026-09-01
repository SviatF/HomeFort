'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from '@/lib/router';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, buildItem, trackMeta } from '@/lib/analytics';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import { useCart } from '@/lib/CartContext';
import { useSettings } from '@/lib/useSettings';
import Seo from '@/components/Seo';
import { Image } from '@/components/ui/image';

export default function Checkout() {
  const { items, total, clear, cartId } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [contact, setContact] = useState({ name: '', phone: '' });
  const phoneTracked = useRef(false);
  const shippingTracked = useRef(false);
  const [userId, setUserId] = useState('');
  const settings = useSettings();
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState({ applied: false, discount: 0, name: '', error: '', loading: false });
  const delivery = total > 30000 ? 0 : 250;

  const methods = useMemo(() => {
    const m = [];
    if (settings?.cardEnabled ?? true) m.push({ v: 'card', l: 'Карткою онлайн' });
    if (settings?.monoInstallmentsEnabled) m.push({ v: 'mono_parts', l: 'Розстрочка Monobank' });
    if (settings?.privatInstallmentsEnabled) m.push({ v: 'privat_parts', l: 'Розстрочка PrivatBank' });
    if (settings?.prepaymentEnabled) m.push({ v: 'prepayment', l: 'Передоплата' });
    if (settings?.codEnabled ?? true) m.push({ v: 'cod', l: 'При отриманні' });
    return m.length ? m : [{ v: 'card', l: 'Карткою онлайн' }, { v: 'cod', l: 'При отриманні' }];
  }, [settings]);

  useEffect(() => {
    if (methods.length && !methods.find((m) => m.v === payment)) setPayment(methods[0].v);
  }, [methods, payment]);

  const discount = couponState.applied ? couponState.discount : 0;
  const grandTotal = Math.max(0, total + delivery - discount);
  const analyticsItems = useMemo(() => items.map((it) =>
    buildItem(
      { sku: it.productId, name: it.name, price: it.price, category: it.category },
      { variantSKU: it.variantSKU, size: it.size, color: it.color, fabric: it.fabric, quantity: it.qty, price: it.price },
    )), [items]);

  useEffect(() => {
    if (!items.length) return;
    track('add_payment_info', {
      payment_type: payment,
      value: grandTotal,
      items: analyticsItems,
    });
  }, [payment, grandTotal, items.length]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await base44.functions.invoke('applyPromo', { code: coupon.trim(), itemsTotal: total });
      if (res.valid) {
        setCouponState({ applied: true, discount: res.discount, name: res.promoName, error: '', loading: false });
      } else {
        setCouponState({ applied: false, discount: 0, name: '', error: 'Недійсний промокод', loading: false });
      }
    } catch (e) {
      setCouponState({ applied: false, discount: 0, name: '', error: 'Недійсний промокод', loading: false });
    }
  };

  useEffect(() => {
    if (!items.length) return;
    track('begin_checkout', {
      value: total + delivery,
      items: analyticsItems,
    });
    trackMeta('InitiateCheckout', { currency: 'UAH', value: total + delivery });
  }, []);

  useEffect(() => {
    if (!phoneTracked.current && String(contact.phone || '').replace(/\D/g, '').length >= 9) {
      phoneTracked.current = true;
      track('checkout_phone_entered', { value: grandTotal });
    }
  }, [contact.phone, grandTotal]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.id) setUserId(u.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!items.length || !contact.phone) return;
    const t = setTimeout(() => {
      base44.functions.invoke('saveAbandonedCart', {
        cartId,
        items,
        total,
        email: '',
        phone: contact.phone,
        name: contact.name,
        userId,
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [contact, items, total, cartId, userId]);

  if (items.length === 0) {
    return (
      <div className="bg-milk min-h-screen">
        <Header />
        <div className="pt-[120px] pb-32 text-center px-6">
          <h1 className="font-heading text-4xl text-espresso mb-4">Кошик порожній</h1>
          <Link to="/catalog/beds" className="text-mocha underline">Перейти до каталогу</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const fd = new FormData(e.target);
    const city = String(fd.get('city') || '').trim();
    if (!shippingTracked.current) {
      shippingTracked.current = true;
      track('add_shipping_info', {
        shipping_tier: 'Уточнити з менеджером',
        city,
        value: grandTotal,
        items: analyticsItems,
      });
    }

    const payload = {
      customerName: contact.name,
      phone: contact.phone,
      email: '',
      city,
      deliveryMethod: 'Уточнити з менеджером',
      address: '',
      paymentMethod: payment,
      comment: fd.get('comment'),
      deliveryCost: delivery,
      couponCode: couponState.applied ? coupon.trim() : '',
      items: items.map((it) => ({
        productId: it.productId,
        variantSKU: it.variantSKU,
        name: it.name,
        slug: it.slug,
        image: it.image,
        size: it.size,
        color: it.color,
        fabric: it.fabric,
        priceCategory: it.priceCategory,
        liftingMechanism: it.liftingMechanism,
        frameOption: it.frameOption,
        qty: it.qty,
        price: it.price,
      })),
    };

    try {
      const res = await base44.functions.invoke('createOrder', payload);
      const orderNumber = res.data?.orderNumber;
      if (!orderNumber) throw new Error('no_order_number');
      await base44.functions.invoke('markCartRecovered', { cartId }).catch(() => {});
      clear();
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      setError('Не вдалося оформити замовлення. Спробуйте ще раз або зв’яжіться з нами.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-milk min-h-screen">
      <Seo title="Оформлення замовлення — DOMERA" description="Оформлення замовлення DOMERA." canonical="/checkout" noindex />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-12 py-10 md:py-16">
          <nav className="text-xs text-mocha mb-6 flex gap-2">
            <Link to="/" className="hover:text-espresso">Головна</Link><span>/</span><span className="text-espresso">Оформлення</span>
          </nav>

          <div className="mb-9 max-w-3xl">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#B56B43] mb-2">Швидке оформлення</p>
            <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] text-espresso">4 поля — і замовлення готове</h1>
            <p className="text-sm text-mocha mt-3">Ім’я, телефон, місто та спосіб оплати. Відділення, адресу й деталі доставки менеджер уточнить після оформлення.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <form onSubmit={submit} className="lg:col-span-7 space-y-8">
              {error && (
                <div className="rounded-[12px] border border-[#8B3A2E]/30 bg-[#8B3A2E]/5 px-5 py-4 text-sm text-[#8B3A2E]">
                  {error}
                </div>
              )}

              <div className="rounded-[20px] border border-espresso/10 bg-white/55 p-5 md:p-7">
                <Section title="Контакти" n="01">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Ім'я" name="name" value={contact.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} autoComplete="name" required />
                    <Input label="Телефон" name="phone" type="tel" inputMode="tel" value={contact.phone} onChange={(v) => setContact((c) => ({ ...c, phone: v }))} autoComplete="tel" placeholder="+380" required />
                  </div>
                </Section>

                <div className="mt-7 border-t border-espresso/10 pt-7">
                  <Section title="Місто" n="02">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:items-end">
                      <Input label="Населений пункт" name="city" autoComplete="address-level2" placeholder="Наприклад, Львів" required />
                      <div className="flex min-h-[52px] max-w-[290px] items-center gap-2 rounded-[12px] bg-[#F6F0E7] px-4 text-[11px] leading-relaxed text-mocha">
                        <MapPin className="h-4 w-4 shrink-0 text-[#A95432]" /> Адресу або відділення уточнимо телефоном
                      </div>
                    </div>
                  </Section>
                </div>

                <div className="mt-7 border-t border-espresso/10 pt-7">
                  <Section title="Оплата" n="03">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {methods.map((p) => (
                        <button type="button" key={p.v} onClick={() => setPayment(p.v)} className={`min-h-[52px] rounded-[12px] border px-4 py-3 text-[12px] text-left transition-all ${payment === p.v ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 bg-white/40 text-espresso hover:border-espresso/40'}`}>{p.l}</button>
                      ))}
                    </div>
                  </Section>
                </div>
              </div>

              <div className="rounded-[16px] border border-espresso/10 bg-[#F8F3EC] px-5 divide-y divide-espresso/10">
                <details className="group py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-[10px] tracking-[0.16em] uppercase text-mocha"><span>Є промокод?</span><span className="text-lg leading-none group-open:rotate-45 transition-transform">+</span></summary>
                  <div className="flex gap-3 mt-4">
                    <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponState({ applied: false, discount: 0, name: '', error: '', loading: false }); }} placeholder="Введіть промокод" className="flex-1 bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none transition-colors uppercase" />
                    <button type="button" onClick={applyCoupon} disabled={couponState.loading} className="px-5 rounded-[10px] border border-espresso/20 text-[10px] tracking-[0.12em] uppercase text-espresso hover:bg-espresso hover:text-milk transition-colors disabled:opacity-60">{couponState.loading ? '…' : 'Застосувати'}</button>
                  </div>
                  {couponState.applied && <p className="mt-3 text-sm text-[#456b49]">Знижку «{couponState.name}» застосовано: −{couponState.discount.toLocaleString('uk-UA')} ₴</p>}
                  {couponState.error && <p className="mt-3 text-sm text-[#8B3A2E]">{couponState.error}</p>}
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-[10px] tracking-[0.16em] uppercase text-mocha"><span>Додати коментар</span><span className="text-lg leading-none group-open:rotate-45 transition-transform">+</span></summary>
                  <textarea name="comment" rows={3} placeholder="Побажання до замовлення" className="mt-4 w-full bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none resize-none" />
                </details>
              </div>

              <button type="submit" disabled={submitting} className="group w-full min-h-[58px] rounded-[13px] bg-espresso px-6 text-milk text-[11px] font-semibold tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:bg-espresso-soft transition-colors disabled:opacity-60">
                {submitting ? 'Обробка…' : <>Підтвердити замовлення <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} /></>}
              </button>
              <div className="flex items-start justify-center gap-2 text-[11px] leading-relaxed text-mocha text-center"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Дані використовуються лише для оформлення замовлення та зв’язку щодо доставки.</div>
            </form>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-[20px] border border-espresso/12 bg-ivory p-6 lg:sticky lg:top-28">
                <p className="text-[10px] tracking-[0.2em] uppercase text-mocha mb-5">Ваше замовлення</p>
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.lineId} className="flex gap-3">
                      <div className="w-16 h-20 overflow-hidden rounded-[9px] bg-sand flex-shrink-0"><Image src={it.image} alt={it.name} className="w-full h-full" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-base text-espresso leading-tight">{it.name}</p>
                        <p className="text-xs text-mocha mt-0.5">{[it.size, it.fabric].filter(Boolean).join(' · ')} · {it.qty} шт</p>
                        <p className="text-sm text-espresso mt-1">{(it.price * it.qty).toLocaleString('uk-UA')} ₴</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-espresso/15 mt-5 pt-5 space-y-2 text-sm">
                  <div className="flex justify-between text-mocha"><span>Товари</span><span>{total.toLocaleString('uk-UA')} ₴</span></div>
                  {discount > 0 && <div className="flex justify-between text-[#456b49]"><span>Знижка</span><span>−{discount.toLocaleString('uk-UA')} ₴</span></div>}
                  <div className="flex justify-between text-mocha"><span>Доставка</span><span>{delivery === 0 ? 'Безкоштовно' : `${delivery} ₴`}</span></div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-espresso/10">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-mocha">Разом</span>
                    <span className="font-heading text-3xl text-espresso">{grandTotal.toLocaleString('uk-UA')} ₴</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, n, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-[10px] tracking-[0.3em] text-[#C6A17A]">{n}</span>
        <h2 className="font-heading text-2xl text-espresso">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({ label, name, type = 'text', inputMode, autoComplete, required, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.18em] uppercase text-mocha mb-2 block">{label}</label>
      <input name={name} type={type} inputMode={inputMode} autoComplete={autoComplete} required={required} value={value} placeholder={placeholder} onChange={onChange ? (e) => onChange(e.target.value) : undefined} className="w-full bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/50 focus:border-espresso outline-none transition-colors" />
    </div>
  );
}
