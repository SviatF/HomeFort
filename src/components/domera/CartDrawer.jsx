'use client';
import { useEffect } from 'react';
import { Link } from '@/lib/router';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { track, buildItem, trackMeta } from '@/lib/analytics';
import { Image } from '@/components/ui/image';

export default function CartDrawer() {
  const { items, isOpen, close, remove, updateQty, total } = useCart();

  useEffect(() => {
    if (isOpen && items.length > 0) {
      track('view_cart', {
        value: total,
        items: items.map((it) => buildItem({ sku: it.variantSKU || it.productId, name: it.name, price: it.price }, { size: it.size, color: it.color, fabric: it.fabric, quantity: it.qty })),
      });
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[70] transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 bg-[#342112]/50 backdrop-blur-sm" onClick={close} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-[460px] bg-[#FAF7F2] flex flex-col transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 h-[78px] border-b border-[#342112]/10">
          <span className="font-heading text-2xl text-[#342112]">Кошик</span>
          <button aria-label="Закрити" onClick={close}><X className="w-6 h-6 text-[#342112]" strokeWidth={1.4} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="font-heading text-2xl text-[#342112] mb-2">Кошик порожній</p>
            <p className="text-[#755A44] mb-8">Оберіть ліжко, матрац або текстиль для вашої спальні.</p>
            <button onClick={close} className="px-7 py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase hover:bg-[#4a2f1c] transition-colors">Продовжити покупки</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.map((it) => (
                <div key={it.lineId} className="flex gap-4">
                  <Link to={`/product/${it.slug}`} onClick={close} className="w-24 h-28 overflow-hidden bg-[#F5E4D1] flex-shrink-0">
                    <Image src={it.image} alt={it.name} className="w-full h-full" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <Link to={`/product/${it.slug}`} onClick={close} className="font-heading text-lg text-[#342112] leading-tight">{it.name}</Link>
                      <button onClick={() => { track('remove_from_cart', { items: [buildItem({ sku: it.variantSKU || it.productId, name: it.name, price: it.price }, { size: it.size, color: it.color, fabric: it.fabric, quantity: it.qty })] }); remove(it.lineId); }} aria-label="Видалити" className="text-[#937C68] hover:text-[#342112]"><Trash2 className="w-4 h-4" strokeWidth={1.4} /></button>
                    </div>
                    <p className="text-xs text-[#755A44] mt-1">
                      {[it.size, it.color && `колір ${it.color}`, it.fabric && it.fabric].filter(Boolean).join(' · ')}
                    </p>
                    {it.variantSKU && <p className="text-[10px] text-[#937C68] mt-0.5">Артикул: {it.variantSKU}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-[#342112]/20">
                        <button onClick={() => updateQty(it.lineId, it.qty - 1)} className="w-8 h-8 text-[#342112] hover:bg-[#342112]/5">−</button>
                        <span className="w-8 text-center text-sm text-[#342112]">{it.qty}</span>
                        <button onClick={() => updateQty(it.lineId, it.qty + 1)} className="w-8 h-8 text-[#342112] hover:bg-[#342112]/5">+</button>
                      </div>
                      <span className="text-[#342112] font-medium">{(it.price * it.qty).toLocaleString('uk-UA')} ₴</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#342112]/10 px-6 py-6">
              <div className="flex justify-between items-baseline mb-5">
                <span className="text-[11px] tracking-[0.22em] uppercase text-[#937C68]">Разом</span>
                <span className="font-heading text-3xl text-[#342112]">{total.toLocaleString('uk-UA')} ₴</span>
              </div>
              <Link to="/checkout" onClick={close} className="group w-full py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-[#4a2f1c] transition-colors">
                Оформити замовлення <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}