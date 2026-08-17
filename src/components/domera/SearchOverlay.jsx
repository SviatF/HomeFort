'use client';
import { Link } from '@/lib/router';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { track } from '@/lib/analytics';
import { searchProducts } from '@/lib/search';
import { Image } from '@/components/ui/image';

const popular = ['Soft', 'Seul', 'Bestseller', '160×200', 'ліжко до 15000'];

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!open) { setQ(''); setResults([]); return; }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    let active = true;
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const [remote, scrapedRes] = await Promise.all([base44.entities.Product.list('-updated_date', 200).catch(()=>[]), fetch('/data/homefort-beds.json').catch(()=>null)]);
      let scraped = [];
      try { const data = scrapedRes ? await scrapedRes.json() : {}; scraped = data.products || data.items || []; } catch {}
      const bySlug = new Map(); [...scraped, ...(remote || [])].forEach((p)=>bySlug.set(p.slug || p.id, p));
      let all = [...bySlug.values()];
      const budget = String(q).match(/(?:до|under)?\s*(\d{4,6})/i);
      if (budget) all = all.filter((p)=>Number(p.price||0) <= Number(budget[1]));
      if (!active) return;
      setResults(searchProducts(all, q.replace(/(?:до|under)?\s*\d{4,6}/i,'').trim() || q, 6));
      track('search', { search_term: q });
    }, 250);
    return () => { active = false; clearTimeout(t); };
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-[#342112]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#FAF7F2] animate-fade-in">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8">
          <div className="flex items-center gap-4 border-b border-[#342112]/20 pb-4">
            <SearchIcon className="w-6 h-6 text-[#937C68]" strokeWidth={1.4} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Пошук товарів..."
              className="flex-1 bg-transparent text-2xl md:text-3xl font-heading text-[#342112] placeholder:text-[#937C68]/60 outline-none"
            />
            <button onClick={onClose} aria-label="Закрити" className="text-[#342112] hover:text-[#937C68]"><X className="w-6 h-6" strokeWidth={1.4} /></button>
          </div>

          {!q && (
            <div className="py-8">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-4">Популярне</p>
              <div className="flex flex-wrap gap-2">
                {popular.map((p) => (
                  <button key={p} onClick={() => setQ(p)} className="px-4 py-2.5 border border-[#342112]/20 text-sm text-[#342112] hover:border-[#342112] transition-colors">{p}</button>
                ))}
              </div>
              <Link to="/bed-finder" onClick={()=>{track('bed_finder_open',{source:'search'});onClose();}} className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#342112] border-b border-[#342112]/30 pb-1">Не знаєте що обрати? Smart Finder →</Link>
            </div>
          )}

          {q && (
            <div className="py-6">
              {results.length === 0 ? (
                <p className="text-[#755A44]">Нічого не знайдено. Спробуйте інший запит.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} onClick={onClose} className="group flex items-center gap-4 p-3 hover:bg-[#F5E4D1]/50 transition-colors">
                      <div className="w-16 h-16 overflow-hidden bg-[#F5E4D1] flex-shrink-0">
                        <Image src={p.images?.[0]} alt={p.name} className="w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-heading text-lg text-[#342112]">{p.name}</p>
                        <p className="text-sm text-[#755A44]">{p.price.toLocaleString('uk-UA')} ₴</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#937C68] group-hover:text-[#342112] transition-colors" strokeWidth={1.4} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}