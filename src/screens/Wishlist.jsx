'use client';
import { Link } from '@/lib/router';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import { useWishlist } from '@/lib/WishlistContext';
import { useCart } from '@/lib/CartContext';
import { track, buildItem } from '@/lib/analytics';
import Seo from '@/components/Seo';
import { Image } from '@/components/ui/image';

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  const addOne = (it) => {
    add({ productId: it.productId, slug: it.slug, name: it.name, price: it.price, image: it.image, qty: 1 });
    track('add_to_cart', { items: [buildItem({ sku: it.productId, name: it.name, price: it.price }, { quantity: 1 })] });
  };

  const addAll = () => {
    items.forEach((it) => add({ productId: it.productId, slug: it.slug, name: it.name, price: it.price, image: it.image, qty: 1 }));
    track('add_to_cart', {
      value: items.reduce((s, i) => s + i.price, 0),
      items: items.map((it) => buildItem({ sku: it.productId, name: it.name, price: it.price }, { quantity: 1 })),
    });
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo title="Обране — DOMERA" description="Ваші обрані товари DOMERA." canonical="/wishlist" noindex />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 md:py-20">
          <nav className="text-xs text-[#937C68] mb-6 flex gap-2">
            <Link to="/" className="hover:text-[#342112]">Головна</Link><span>/</span><span className="text-[#342112]">Обране</span>
          </nav>
          <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] text-[#342112] mb-2">Обране</h1>
          <p className="text-sm text-[#937C68] mb-12">{items.length} товарів</p>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-heading text-2xl text-[#342112] mb-2">Список порожній</p>
              <p className="text-[#755A44] mb-8">Додавайте улюблені товари — вони залишаться тут.</p>
              <Link to="/catalog/beds" className="inline-block px-7 py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase hover:bg-[#4a2f1c] transition-colors">Перейти до каталогу</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {items.map((it) => (
                  <div key={it.productId} className="flex gap-4 border border-[#342112]/10 p-4 bg-[#F8F3EC]">
                    <Link to={`/product/${it.slug}`} className="w-24 h-28 overflow-hidden bg-[#F5E4D1] flex-shrink-0"><Image src={it.image} alt={it.name} className="w-full h-full" /></Link>
                    <div className="flex-1 flex flex-col">
                      <Link to={`/product/${it.slug}`} className="font-heading text-lg text-[#342112] leading-tight">{it.name}</Link>
                      <p className="text-sm text-[#342112] mt-1">{it.price.toLocaleString('uk-UA')} ₴</p>
                      <div className="mt-auto flex items-center gap-3 pt-3">
                        <button onClick={() => addOne(it)} className="flex-1 py-2.5 bg-[#342112] text-[#FAF7F2] text-[11px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:bg-[#4a2f1c] transition-colors">В кошик <ShoppingBag className="w-4 h-4" strokeWidth={1.4} /></button>
                        <button onClick={() => remove(it.productId)} aria-label="Видалити" className="w-10 border border-[#342112]/20 flex items-center justify-center text-[#937C68] hover:text-[#342112] hover:border-[#342112]"><Trash2 className="w-4 h-4" strokeWidth={1.4} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addAll} className="group mt-10 px-8 py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase flex items-center gap-2 hover:bg-[#4a2f1c] transition-colors">Додати все в кошик <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} /></button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}