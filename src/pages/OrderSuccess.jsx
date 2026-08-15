'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from '@/lib/router';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, buildItem, trackMeta, buildUserData } from '@/lib/analytics';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';
import { Image } from '@/components/ui/image';

const steps = [
  'Ми підтвердимо замовлення та зв’яжемося з вами.',
  'Передамо ваше замовлення у виробництво.',
  'Повідомимо про готовність (орієнтовно 7–10 днів).',
  'Організуємо доставку по Україні.',
];

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const fired = useRef(false);

  useEffect(() => {
    base44.functions
      .invoke('getOrder', { orderNumber: orderId })
      .then((res) => setOrder(res.data?.order || null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (order && !fired.current) {
      (async () => {
        const key = `domera_purchase_${order.orderNumber}`;
        if (!sessionStorage.getItem(key)) {
          const userData = await buildUserData(order.email, order.phone);
          const purchaseItems = (order.items || []).map((it) =>
            buildItem({ sku: it.variantSKU || it.productId, name: it.name, price: it.price }, { size: it.size, color: it.color, fabric: it.fabric, quantity: it.qty })
          );
          track('purchase', {
            transaction_id: order.orderNumber,
            value: order.total,
            shipping: order.deliveryCost,
            tax: 0,
            items: purchaseItems,
            user_data: userData,
          });
          if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'ads_purchase_conversion', transaction_id: order.orderNumber, value: order.total, currency: 'UAH' });
          }
          trackMeta('Purchase', { currency: 'UAH', value: order.total, contents: (order.items || []).map((i) => ({ id: i.variantSKU || i.productId, quantity: i.qty })), content_type: 'product' }, { eventId: order.orderNumber });
          sessionStorage.setItem(key, '1');
        }
      })();
      fired.current = true;
    }
  }, [order]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo title="Замовлення прийнято — DOMERA" description="Підтвердження замовлення DOMERA." canonical="/order-success" noindex />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border border-[#C6A17A] flex items-center justify-center mb-8">
              <Check className="w-8 h-8 text-[#C6A17A]" strokeWidth={1.2} />
            </div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#937C68] mb-4">DOMERA</p>
            <h1 className="font-heading text-[clamp(2.2rem,5vw,3.4rem)] leading-tight text-[#342112]">Дякуємо за замовлення</h1>
            {loading ? (
              <div className="mt-6 h-6 w-48 mx-auto bg-[#F5E4D1] animate-pulse" />
            ) : order ? (
              <p className="mt-4 text-[#755A44]">
                Номер замовлення:{' '}
                <span className="font-heading text-xl text-[#342112]">{order.orderNumber}</span>
              </p>
            ) : (
              <p className="mt-4 text-[#755A44]">Ми отримали ваше замовлення та вже працюємо над ним.</p>
            )}
          </div>

          {/* What happens next */}
          <div className="mt-14 border-t border-[#342112]/10 pt-10">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-6">Що далі</p>
            <ol className="space-y-5">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-[#342112]/20 flex items-center justify-center text-sm text-[#937C68] font-heading">
                    {i + 1}
                  </span>
                  <span className="text-[#342112] pt-1">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Order details */}
          {order && (
            <div className="mt-12 border border-[#342112]/15 bg-[#F8F3EC] p-7">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-5">Ваше замовлення</p>
              <div className="space-y-4">
                {(order.items || []).map((it, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 h-18 overflow-hidden bg-[#F5E4D1] flex-shrink-0">
                      {it.image && <Image src={it.image} alt={it.name} className="w-full h-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-base text-[#342112] leading-tight">{it.name}</p>
                      <p className="text-xs text-[#755A44] mt-0.5">{[it.size, it.fabric].filter(Boolean).join(' · ')} · {it.qty} шт</p>
                      <p className="text-sm text-[#342112] mt-1">{(it.price * it.qty).toLocaleString('uk-UA')} ₴</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#342112]/15 mt-5 pt-5 space-y-2 text-sm">
                <div className="flex justify-between text-[#755A44]"><span>Товари</span><span>{(order.itemsTotal || 0).toLocaleString('uk-UA')} ₴</span></div>
                <div className="flex justify-between text-[#755A44]"><span>Доставка</span><span>{(order.deliveryCost || 0) === 0 ? 'Безкоштовно' : `${order.deliveryCost} ₴`}</span></div>
                <div className="flex justify-between items-baseline pt-3 border-t border-[#342112]/10">
                  <span className="text-[11px] tracking-[0.22em] uppercase text-[#937C68]">Разом</span>
                  <span className="font-heading text-2xl text-[#342112]">{(order.total || 0).toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation — non-blocking */}
          <div className="mt-12 text-center">
            <p className="font-heading text-2xl text-[#342112] mb-2">Доповніть свою спальню</p>
            <p className="text-[#755A44] mb-6">Подушки, наматрацники та постільна білизна в єдиній естетиці DOMERA.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/catalog/beds" className="inline-flex items-center gap-2 px-8 py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase hover:bg-[#4a2f1c] transition-colors">
                Перейти до каталогу
              </Link>
              <Link to="/order-status" className="inline-flex items-center gap-2 px-8 py-4 border border-[#342112]/25 text-[#342112] text-[12px] tracking-[0.22em] uppercase hover:bg-[#342112] hover:text-[#FAF7F2] transition-colors">
                Відстежити замовлення
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}