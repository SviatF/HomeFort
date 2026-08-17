'use client';
import { X, Trash2 } from 'lucide-react';
import { Link } from '@/lib/router';
import { Image } from '@/components/ui/image';
import { useCompare } from '@/lib/CompareContext';

const clean = (name='') => String(name).replace(/^Ліжко\s+(м['’ʼ]?яке\s+)?Homefort\s*/i, '');

export default function CompareDrawer() {
  const { items, isOpen, close, toggle, clear } = useCompare();
  return (
    <div className={`fixed inset-0 z-[80] transition-all ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 bg-espresso/45 backdrop-blur-sm" onClick={close} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-[760px] bg-milk transition-transform duration-500 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 bg-milk/95 backdrop-blur z-10 flex items-center justify-between h-[78px] px-6 border-b border-espresso/10">
          <div><p className="text-[10px] tracking-[0.22em] uppercase text-mocha">Порівняння</p><h2 className="font-heading text-2xl text-espresso">До 3 моделей</h2></div>
          <button onClick={close} aria-label="Закрити"><X className="w-6 h-6" /></button>
        </div>
        {items.length === 0 ? <div className="p-10 text-mocha">Додайте моделі з каталогу, щоб порівняти їх характеристики.</div> : (
          <div className="p-6">
            <div className={`grid gap-3`} style={{gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`}}>
              {items.map((p) => <div key={p.id} className="min-w-0">
                <div className="aspect-[4/5] bg-sand overflow-hidden"><Image src={p.images?.[0] || p.image} alt={p.name} className="w-full h-full object-cover" /></div>
                <div className="pt-3 flex justify-between gap-2"><div><Link to={`/product/${p.slug}`} onClick={close} className="font-heading text-xl text-espresso">{clean(p.name)}</Link><p className="mt-1 text-sm text-mocha">{Number(p.price||0).toLocaleString('uk-UA')} ₴</p></div><button onClick={()=>toggle(p)} className="text-mocha"><Trash2 className="w-4 h-4" /></button></div>
              </div>)}
            </div>
            <div className="mt-8 border-y border-espresso/10 divide-y divide-espresso/10">
              {['sizes','availability','warranty'].map((key) => <div key={key} className="grid py-4 gap-3" style={{gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`}}>
                {items.map((p) => <div key={`${p.id}-${key}`} className="text-sm text-espresso">{key==='sizes' ? `${(p.sizes||[]).length || '—'} розмірів` : key==='availability' ? (p.availability==='in_stock'?'В наявності':'Під замовлення') : (p.warranty||'Уточнюйте')}</div>)}
              </div>)}
            </div>
            <div className="mt-8 flex justify-between items-center"><button onClick={clear} className="text-xs uppercase tracking-[0.18em] text-mocha underline">Очистити</button><Link to="/catalog/beds" onClick={close} className="px-6 py-3 bg-espresso text-milk text-[11px] tracking-[0.2em] uppercase">До каталогу</Link></div>
          </div>
        )}
      </aside>
    </div>
  );
}