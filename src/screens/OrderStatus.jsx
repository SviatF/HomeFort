'use client';
import { useState } from 'react';
import { Link } from '@/lib/router';
import { Search, Package, Truck, Check, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track } from '@/lib/analytics';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';
import { Image } from '@/components/ui/image';

const STEPS = [
  { key: 'new', label: 'Замовлення прийнято', desc: 'Ми отримали ваші контактні дані.' },
  { key: 'confirmed', label: 'Підтверджено', desc: 'Менеджер зв\'яжеться для уточнення.' },
  { key: 'paid', label: 'Оплачено', desc: 'Оплату за замовлення отримано.' },
  { key: 'in_production', label: 'У виробництві', desc: 'Виготовляємо на власному виробництві.' },
  { key: 'ready', label: 'Готове до відправки', desc: 'Замовлення зібране та перевірене.' },
  { key: 'shipped', label: 'Відправлено', desc: 'Передано службі доставки.' },
  { key: 'delivered', label: 'Доставлено', desc: 'Дякуємо за покупку!' },
];
const ORDER = ['new', 'confirmed', 'paid', 'in_production', 'ready', 'shipped', 'delivered'];

export default function OrderStatus() {
  const [form, setForm] = useState({ orderNumber: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    if (!form.orderNumber.trim() || !form.phone.trim()) {
      setError('Заповніть номер замовлення та телефон.');
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('lookupOrder', form);
      setOrder(res.order);
      track('order_status_lookup', { order_number: form.orderNumber });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || '';
      setError(
        msg === 'not_found' ? 'Замовлення з таким номером не знайдено.'
        : msg === 'phone_mismatch' ? 'Телефон не збігається з замовленням.'
        : 'Не вдалося знайти замовлення. Спробуйте ще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? ORDER.indexOf(order.status) : -1;
  const cancelled = order?.status === 'cancelled';

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo title="Відстежити замовлення — DOMERA" description="Перевірте статус вашого замовлення DOMERA за номером та телефоном." canonical="/order-status" noindex />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-2xl px-6 py-12 md:py-20">
          <nav className="text-xs text-[#937C68] mb-6 flex gap-2">
            <Link to="/" className="hover:text-[#342112]">Головна</Link><span>/</span><span className="text-[#342112]">Статус замовлення</span>
          </nav>
          <h1 className="font-heading text-[clamp(2.2rem,5vw,3.4rem)] text-[#342112] mb-2">Відстежити замовлення</h1>
          <p className="text-sm text-[#937C68] mb-10">Введіть номер замовлення та телефон, який ви вказали при оформленні.</p>

          <form onSubmit={submit} className="space-y-5 mb-10">
            <div>
              <label className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-2 block">Номер замовлення</label>
              <input value={form.orderNumber} onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))} className="lead-input" placeholder="напр. DM-2026-0001" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-2 block">Телефон</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} type="tel" inputMode="tel" className="lead-input" placeholder="+380" />
            </div>
            {error && <p className="text-sm text-[#8B3A2E]">{error}</p>}
            <button type="submit" disabled={loading} className="group w-full py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-[#4a2f1c] transition-colors disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.4} /> Пошук…</> : <><Search className="w-4 h-4" strokeWidth={1.4} /> Знайти замовлення</>}
            </button>
          </form>

          {order && (
            <div className="border border-[#342112]/15 bg-[#F8F3EC] p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68]">Замовлення</p>
                  <p className="font-heading text-2xl text-[#342112]">{order.orderNumber}</p>
                </div>
                {cancelled ? (
                  <span className="px-3 py-1.5 bg-[#8B3A2E]/10 text-[#8B3A2E] text-[11px] tracking-[0.18em] uppercase">Скасовано</span>
                ) : (
                  <span className="px-3 py-1.5 bg-[#C6A17A]/15 text-[#342112] text-[11px] tracking-[0.18em] uppercase">{STEPS[currentIndex]?.label || order.status}</span>
                )}
              </div>

              {!cancelled && (
                <ol className="space-y-0 mb-6">
                  {STEPS.map((s, i) => {
                    const done = i <= currentIndex;
                    const active = i === currentIndex;
                    return (
                      <li key={s.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-[#342112] text-[#FAF7F2]' : 'border border-[#342112]/20 text-[#937C68]'}`}>
                            {done ? <Check className="w-4 h-4" strokeWidth={1.6} /> : <span className="text-xs font-heading">{i + 1}</span>}
                          </span>
                          {i < STEPS.length - 1 && <span className={`w-px flex-1 my-1 ${i < currentIndex ? 'bg-[#342112]' : 'bg-[#342112]/15'}`} style={{ minHeight: '1.5rem' }} />}
                        </div>
                        <div className={`pb-6 ${active ? '' : ''}`}>
                          <p className={`font-heading text-base ${done ? 'text-[#342112]' : 'text-[#937C68]'}`}>{s.label}</p>
                          <p className="text-xs text-[#755A44] mt-0.5">{s.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="border-t border-[#342112]/15 pt-5 space-y-2 text-sm">
                <div className="flex justify-between text-[#755A44]"><span>Отримувач</span><span className="text-[#342112]">{order.customerName}</span></div>
                <div className="flex justify-between text-[#755A44]"><span>Доставка</span><span className="text-[#342112] text-right">{order.city}{order.address ? ` · ${order.address}` : ''}</span></div>
                <div className="flex justify-between text-[#755A44]"><span>Оплата</span><span className="text-[#342112]">{order.paymentMethod}</span></div>
                <div className="flex justify-between items-baseline pt-3 border-t border-[#342112]/10">
                  <span className="text-[11px] tracking-[0.22em] uppercase text-[#937C68]">Разом</span>
                  <span className="font-heading text-2xl text-[#342112]">{(order.total || 0).toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>

              {(order.trackingNumber || order.carrier || order.estimatedReadyDate || order.paidAmount > 0 || order.balanceAmount > 0) && (
                <div className="mt-5 pt-5 border-t border-[#342112]/15 space-y-2 text-sm">
                  {order.trackingNumber && <div className="flex justify-between text-[#755A44]"><span>Трек-номер</span><span className="text-[#342112]">{order.carrier ? `${order.carrier} · ` : ''}{order.trackingNumber}</span></div>}
                  {order.estimatedReadyDate && <div className="flex justify-between text-[#755A44]"><span>Орієнтовна готовність</span><span className="text-[#342112]">{new Date(order.estimatedReadyDate).toLocaleDateString('uk-UA')}</span></div>}
                  {order.paidAmount > 0 && <div className="flex justify-between text-[#755A44]"><span>Сплачено</span><span className="text-[#342112]">{order.paidAmount.toLocaleString('uk-UA')} ₴</span></div>}
                  {order.balanceAmount > 0 && <div className="flex justify-between text-[#755A44]"><span>Залишок</span><span className="text-[#342112]">{order.balanceAmount.toLocaleString('uk-UA')} ₴</span></div>}
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-[#342112]/15">
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-3">Товари</p>
                <div className="space-y-3">
                  {(order.items || []).map((it, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-12 h-14 overflow-hidden bg-[#F5E4D1] flex-shrink-0">{it.image && <Image src={it.image} alt={it.name} className="w-full h-full" />}</div>
                      <div className="flex-1">
                        <p className="font-heading text-sm text-[#342112] leading-tight">{it.name}</p>
                        <p className="text-xs text-[#755A44]">{[it.size, it.fabric].filter(Boolean).join(' · ')} · {it.qty} шт</p>
                      </div>
                      <p className="text-sm text-[#342112]">{(it.price * it.qty).toLocaleString('uk-UA')} ₴</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 text-center text-sm text-[#755A44]">
            Питання щодо замовлення? <Link to="/#footer" className="text-[#342112] underline underline-offset-4">Зв\'яжіться з нами</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}