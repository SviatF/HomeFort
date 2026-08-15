'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/router';
import { Check, ArrowRight } from 'lucide-react';
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
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
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
  }, [methods]);

  const discount = couponState.applied ? couponState.discount : 0;
  const grandTotal = Math.max(0, total + delivery - discount);

  useEffect(() => {
    track('add_payment_info', { payment_type: payment, value: grandTotal });
  }, [payment]);

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
    if (items.length) {
      const delivery = total > 30000 ? 0 : 250;
      track('begin_checkout', {
        value: total + delivery,
        items: items.map((it) =>
          buildItem({ sku: it.productId, name: it.name, price: it.price }, { variantSKU: it.variantSKU, size: it.size, color: it.color, fabric: it.fabric, quantity: it.qty })
        ),
      });
      trackMeta('InitiateCheckout', { currency: 'UAH', value: total + delivery });
    }
  }, []);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.id) setUserId(u.id);
      if (u?.email) setContact((c) => (c.email ? c : { ...c, email: u.email }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!items.length) return;
    if (!contact.phone && !contact.email) return;
    const t = setTimeout(() => {
      base44.functions.invoke('saveAbandonedCart', { cartId, items, total, email: contact.email, phone: contact.phone, name: contact.name, userId }).catch(() => {});
    }, 1500);
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
    const payload = {
      customerName: contact.name,
      phone: contact.phone,
      email: contact.email,
      city: fd.get('city'),
      deliveryMethod: fd.get('deliveryMethod'),
      address: fd.get('address'),
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
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 md:py-20">
          <nav className="text-xs text-mocha mb-6 flex gap-2">
            <Link to="/" className="hover:text-espresso">Головна</Link><span>/</span><span className="text-espresso">Оформлення</span>
          </nav>
          <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] text-espresso mb-12">Оформлення замовлення</h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <form onSubmit={submit} className="lg:col-span-7 space-y-10">
              {error && (
                <div className="border border-[#8B3A2E]/30 bg-[#8B3A2E]/5 px-5 py-4 text-sm text-[#8B3A2E]">
                  {error}
                </div>
              )}

              <Section title="Контакти" n="01">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Ім'я" name="name" value={contact.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} autoComplete="name" required />
                  <Input label="Телефон" name="phone" type="tel" inputMode="tel" value={contact.phone} onChange={(v) => setContact((c) => ({ ...c, phone: v }))} autoComplete="tel" required />
                  <Input label="Email" name="email" type="email" value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} autoComplete="email" />
                </div>
              </Section>

              <Section title="Доставка" n="02">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Місто" name="city" autoComplete="address-level2" required />
                  <div>
                    <label className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-2 block">Спосіб доставки</label>
                    <select name="deliveryMethod" defaultValue="Нова Пошта — відділення" onChange={(e) => track('add_shipping_info', { shipping_tier: e.target.value, value: grandTotal })} className="w-full bg-transparent border-b border-espresso/25 py-3 text-espresso focus:border-espresso outline-none">
                      <option>Нова Пошта — відділення</option>
                      <option>Нова Пошта — кур'єр</option>
                      <option>Власна доставка DOMERA</option>
                      <option>Самовивіз (Одеса)</option>
                    </select>
                  </div>
                  <Input label="Відділення / адреса" name="address" autoComplete="address-line1" required />
                </div>
              </Section>

              <Section title="Оплата" n="03">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {methods.map((p) => (
                    <button type="button" key={p.v} onClick={() => setPayment(p.v)} className={`px-4 py-4 border text-sm text-left transition-all ${payment === p.v ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{p.l}</button>
                  ))}
                </div>
              </Section>

              <Section title="Промокод" n="04">
                <div className="flex gap-3">
                  <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponState({ applied: false, discount: 0, name: '', error: '', loading: false }); }} placeholder="Введіть промокод" className="flex-1 bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none transition-colors uppercase" />
                  <button type="button" onClick={applyCoupon} disabled={couponState.loading} className="px-6 border border-espresso/25 text-[11px] tracking-[0.18em] uppercase text-espresso hover:bg-espresso hover:text-milk transition-colors disabled:opacity-60">
                    {couponState.loading ? '…' : 'Застосувати'}
                  </button>
                </div>
                {couponState.applied && <p className="mt-3 text-sm text-espresso">Знижку «{couponState.name}» застосовано: −{couponState.discount.toLocaleString('uk-UA')} ₴</p>}
                {couponState.error && <p className="mt-3 text-sm text-[#8B3A2E]">{couponState.error}</p>}
              </Section>

              <Section title="Коментар" n="05">
                <textarea name="comment" rows={4} placeholder="Побажання до замовлення" className="w-full bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none resize-none" />
              </Section>

              <button type="submit" disabled={submitting} className="group w-full py-4 bg-espresso text-milk text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-espresso-soft transition-colors disabled:opacity-60">
                {submitting ? 'Обробка…' : <>Підтвердити замовлення <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} /></>}
              </button>
              <p className="text-xs text-mocha text-center">Натискаючи кнопку, ви погоджуєтесь з умовами та політикою конфіденційності.</p>
            </form>

            {/* Summary */}
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="border border-espresso/15 bg-ivory p-7 lg:sticky lg:top-28">
                <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-5">Ваше замовлення</p>
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.lineId} className="flex gap-3">
                      <div className="w-16 h-20 overflow-hidden bg-sand flex-shrink-0"><Image src={it.image} alt={it.name} className="w-full h-full" /></div>
                      <div className="flex-1">
                        <p className="font-heading text-base text-espresso leading-tight">{it.name}</p>
                        <p className="text-xs text-mocha mt-0.5">{[it.size, it.fabric].filter(Boolean).join(' · ')} · {it.qty} шт</p>
                        <p className="text-sm text-espresso mt-1">{(it.price * it.qty).toLocaleString('uk-UA')} ₴</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-espresso/15 mt-5 pt-5 space-y-2 text-sm">
                  <div className="flex justify-between text-mocha"><span>Товари</span><span>{total.toLocaleString('uk-UA')} ₴</span></div>
                  {discount > 0 && <div className="flex justify-between text-bronze"><span>Знижка</span><span>−{discount.toLocaleString('uk-UA')} ₴</span></div>}
                  <div className="flex justify-between text-mocha"><span>Доставка</span><span>{delivery === 0 ? 'Безкоштовно' : `${delivery} ₴`}</span></div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-espresso/10">
                    <span className="text-[11px] tracking-[0.22em] uppercase text-mocha">Разом</span>
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
        <span className="text-[11px] tracking-[0.3em] text-[#C6A17A]">{n}</span>
        <h2 className="font-heading text-2xl text-espresso">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({ label, name, type = 'text', inputMode, autoComplete, required, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-2 block">{label}</label>
      <input name={name} type={type} inputMode={inputMode} autoComplete={autoComplete} required={required} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} className="w-full bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none transition-colors" />
    </div>
  );
}