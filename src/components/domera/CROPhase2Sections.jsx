'use client';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Share2 } from 'lucide-react';
import ProductCard from '@/components/domera/ProductCard';
import { useRecentlyViewed } from '@/lib/RecentlyViewedContext';
import { track } from '@/lib/analytics';

export function DeliveryEstimator({ productionTime }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const now = new Date();
    const min = new Date(now); min.setDate(now.getDate()+7);
    const max = new Date(now); max.setDate(now.getDate()+14);
    const fmt = (d) => d.toLocaleDateString('uk-UA',{day:'numeric',month:'long'});
    setText(`${fmt(min)} — ${fmt(max)}`);
  }, []);
  return <div className="mt-4 flex items-start gap-3 bg-[#F3EEE7] border border-espresso/8 px-4 py-3"><CalendarDays className="w-4 h-4 mt-0.5 text-espresso" strokeWidth={1.5}/><div><p className="text-[10px] uppercase tracking-[0.18em] text-mocha">Орієнтовна готовність</p><p className="text-sm text-espresso mt-1">{productionTime || text || '7–14 днів'}{productionTime ? '' : ' при замовленні сьогодні'}</p></div></div>;
}

export function ShareConfiguration({ product, size, fabric, lifting, price }) {
  const share = async () => {
    const text = `${product.name}${size ? ` · ${size}`:''}${fabric?` · ${fabric}`:''}${lifting?' · з підйомним механізмом':''} — ${Number(price||0).toLocaleString('uk-UA')} ₴`;
    const url = window.location.href;
    track('share_configuration',{item_id:product.sku,size,price});
    try {
      if (navigator.share) await navigator.share({title:product.name,text,url});
      else { await navigator.clipboard.writeText(`${text}\n${url}`); alert('Комплектацію скопійовано'); }
    } catch {}
  };
  return <button onClick={share} className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-espresso border-b border-espresso/30 pb-1"><Share2 className="w-3.5 h-3.5"/>Поділитися комплектацією</button>;
}

export function RecentlyViewedRail({ currentId }) {
  const { items } = useRecentlyViewed();
  const list = useMemo(()=>items.filter((x)=>x.id!==currentId).slice(0,4),[items,currentId]);
  if (!list.length) return null;
  return <section className="mt-20 md:mt-28 border-t border-espresso/10 pt-12"><div className="mb-8"><p className="text-[10px] tracking-[0.24em] uppercase text-mocha">Повернутись до вибору</p><h2 className="font-heading text-[clamp(2rem,4vw,3rem)] text-espresso mt-2">Ви нещодавно дивились</h2></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">{list.map((p)=><ProductCard key={p.id} product={p}/>)}</div></section>;
}