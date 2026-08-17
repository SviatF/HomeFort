'use client';
import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getSchema } from '@/components/admin/entitySchemas';
import ImageUpload from '@/components/admin/ImageUpload';
import { productHealth, productSeoWarnings, dedupeAdminSizes } from '@/lib/admin-product-health';
import {
  Download, Loader2, Search, SlidersHorizontal, X, Pencil, ExternalLink,
  CheckCircle2, AlertTriangle, Image as ImageIcon, Copy, Trash2, ChevronUp,
  ChevronDown, Save, Plus, Sparkles, Eye, SearchCheck
} from 'lucide-react';

const TABS = [
  ['main', 'Основне'], ['price', 'Ціна'], ['media', 'Фото'], ['variants', 'Комплектації'],
  ['delivery', 'Доставка'], ['cro', 'CRO'], ['seo', 'SEO'], ['advanced', 'Advanced'],
];

const FIELD = 'w-full bg-white border border-[#342112]/15 px-3 py-2.5 text-sm text-[#342112] outline-none focus:border-[#342112]';
const LABEL = 'block text-[10px] tracking-[0.16em] uppercase text-[#937C68] mb-2';
const categoryNames = { beds: 'Ліжка', mattresses: 'Матраци', toppers: 'Топери', pillows: 'Подушки', duvets: 'Ковдри', bedding: 'Текстиль', 'kids-mattresses': 'Дитячі матраци' };

function Input({ label, value, onChange, type = 'text', textarea = false, placeholder = '' }) {
  return <label><span className={LABEL}>{label}</span>{textarea
    ? <textarea rows={4} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={FIELD} />
    : <input type={type} value={value ?? ''} onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} placeholder={placeholder} className={FIELD} />}</label>;
}
function Toggle({ label, checked, onChange, hint }) {
  return <label className="flex items-center justify-between gap-4 border border-[#342112]/10 bg-white px-4 py-3 cursor-pointer"><div><div className="text-sm text-[#342112]">{label}</div>{hint && <div className="text-xs text-[#937C68] mt-1">{hint}</div>}</div><input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#342112]" /></label>;
}
function Pill({ children, tone = 'neutral' }) {
  const cls = tone === 'good' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : tone === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' : tone === 'bad' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#F5E4D1]/50 text-[#755A44] border-[#342112]/10';
  return <span className={`inline-flex items-center px-2 py-1 border text-[10px] tracking-[0.08em] uppercase ${cls}`}>{children}</span>;
}

function ProductEditor({ product, onClose, onSaved }) {
  const [draft, setDraft] = useState(() => ({ indexable: true, availability: 'made_to_order', images: [], sizes: [], colors: [], fabrics: [], ...product }));
  const [tab, setTab] = useState('main');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const health = productHealth(draft);
  const warnings = productSeoWarnings(draft);
  const set = (k, v) => setDraft((s) => ({ ...s, [k]: v }));
  const arrayText = (k, value) => set(k, value.split('\n').map((x) => x.trim()).filter(Boolean));

  async function save() {
    setSaving(true); setErr('');
    try {
      const schema = getSchema('Product');
      const payload = {};
      for (const key of Object.keys(schema.properties || {})) if (key in draft) payload[key] = draft[key];
      payload.sizes = dedupeAdminSizes(payload.sizes || []);
      if (draft.id) await base44.entities.Product.update(draft.id, payload);
      else await base44.entities.Product.create(payload);
      await onSaved(); onClose();
    } catch (e) { setErr(e?.response?.data?.message || e?.message || 'Помилка збереження'); }
    setSaving(false);
  }

  function moveImage(index, dir) {
    const arr = [...(draft.images || [])]; const to = index + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[index], arr[to]] = [arr[to], arr[index]]; set('images', arr);
  }

  const displayTitle = draft.seoTitle || `${draft.name || 'Назва товару'} | DOMERA`;
  const displayDesc = draft.seoDescription || draft.shortDescription || 'Meta description ще не заповнений.';

  return <div className="fixed inset-0 z-[80] bg-[#342112]/45 flex justify-end">
    <div className="w-full max-w-[1180px] h-full bg-[#FAF7F2] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#342112]/10 px-5 md:px-8 py-4 flex items-center gap-4">
        <button onClick={onClose} className="p-2 text-[#755A44]"><X className="w-5 h-5" /></button>
        <div className="min-w-0 flex-1"><div className="text-[10px] tracking-[.2em] uppercase text-[#937C68]">Product workspace</div><h2 className="font-heading text-2xl text-[#342112] truncate">{draft.name || 'Новий товар'}</h2></div>
        <div className="hidden md:flex items-center gap-2"><Pill tone={health.score >= 85 ? 'good' : health.score >= 65 ? 'warn' : 'bad'}>Health {health.score}</Pill>{warnings.length === 0 && <Pill tone="good">SEO Ready</Pill>}</div>
        {draft.slug && <a href={`/product/${draft.slug}`} target="_blank" className="p-2 text-[#755A44] hover:text-[#342112]" aria-label="Відкрити товар"><ExternalLink className="w-4 h-4" /></a>}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#342112] text-[#FAF7F2] text-[10px] tracking-[.16em] uppercase disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Зберегти</button>
      </div>

      <div className="px-5 md:px-8 pt-5 overflow-x-auto"><div className="flex gap-1 min-w-max border-b border-[#342112]/10">{TABS.map(([key,label]) => <button key={key} onClick={() => setTab(key)} className={`px-4 py-3 text-[10px] tracking-[.14em] uppercase border-b-2 ${tab===key?'border-[#342112] text-[#342112]':'border-transparent text-[#937C68]'}`}>{label}</button>)}</div></div>
      {err && <div className="mx-5 md:mx-8 mt-5 p-3 border border-red-200 bg-red-50 text-red-700 text-sm">{err}</div>}

      <div className="grid lg:grid-cols-[1fr_330px] gap-8 px-5 md:px-8 py-7">
        <div className="space-y-5">
          {tab === 'main' && <>
            <div className="grid md:grid-cols-2 gap-5"><Input label="Назва" value={draft.name} onChange={(v)=>set('name',v)}/><Input label="Slug" value={draft.slug} onChange={(v)=>set('slug',v)}/><Input label="SKU" value={draft.sku} onChange={(v)=>set('sku',v)}/><label><span className={LABEL}>Категорія</span><select value={draft.category||''} onChange={(e)=>set('category',e.target.value)} className={FIELD}><option value="">—</option>{Object.entries(categoryNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div>
            <Input label="Короткий опис" value={draft.shortDescription} onChange={(v)=>set('shortDescription',v)} textarea/>
            <Input label="Повний опис" value={draft.fullDescription} onChange={(v)=>set('fullDescription',v)} textarea/>
            <div className="grid md:grid-cols-2 gap-5"><Input label="Матеріал" value={draft.material} onChange={(v)=>set('material',v)}/><Input label="Габарити" value={draft.dimensions} onChange={(v)=>set('dimensions',v)}/></div>
          </>}

          {tab === 'price' && <><div className="grid md:grid-cols-3 gap-5"><Input label="Ціна, ₴" type="number" value={draft.price} onChange={(v)=>set('price',v)}/><Input label="Стара ціна, ₴" type="number" value={draft.oldPrice} onChange={(v)=>set('oldPrice',v)}/><Input label="Знижка, %" type="number" value={draft.salePercent} onChange={(v)=>set('salePercent',v)}/></div><div className="p-5 bg-white border border-[#342112]/10"><div className="text-xs text-[#937C68]">Відображення ціни</div><div className="mt-2 flex items-baseline gap-3"><strong className="font-heading text-3xl text-[#342112]">{Number(draft.price||0).toLocaleString('uk-UA')} ₴</strong>{draft.oldPrice>draft.price&&<span className="line-through text-[#937C68]">{Number(draft.oldPrice).toLocaleString('uk-UA')} ₴</span>}</div></div></>}

          {tab === 'media' && <><ImageUpload value={draft.images||[]} onChange={(v)=>set('images',v)} multiple/><div className="space-y-2">{(draft.images||[]).map((url,i)=><div key={`${url}-${i}`} className="flex gap-3 items-center p-2 bg-white border border-[#342112]/10"><img src={url} alt="" className="w-16 h-16 object-cover"/><div className="min-w-0 flex-1"><div className="text-xs text-[#342112] truncate">{url}</div><div className="text-[10px] text-[#937C68] mt-1">{i===0?'Обкладинка':'Фото '+(i+1)}</div></div><button onClick={()=>moveImage(i,-1)} className="p-2"><ChevronUp className="w-4 h-4"/></button><button onClick={()=>moveImage(i,1)} className="p-2"><ChevronDown className="w-4 h-4"/></button><button onClick={()=>set('images',(draft.images||[]).filter((_,x)=>x!==i))} className="p-2 text-red-600"><Trash2 className="w-4 h-4"/></button></div>)}</div><Input label="Alt основного зображення" value={draft.imageAlt} onChange={(v)=>set('imageAlt',v)}/><Input label="Video URL" value={draft.videoUrl} onChange={(v)=>set('videoUrl',v)}/></>}

          {tab === 'variants' && <><div className="grid md:grid-cols-2 gap-5"><label><span className={LABEL}>Розміри — один на рядок</span><textarea rows={8} value={(draft.sizes||[]).join('\n')} onChange={(e)=>arrayText('sizes',e.target.value)} onBlur={()=>set('sizes',dedupeAdminSizes(draft.sizes||[]))} className={FIELD}/><button type="button" onClick={()=>set('sizes',dedupeAdminSizes(draft.sizes||[]))} className="mt-2 text-xs underline text-[#755A44]">Нормалізувати та прибрати дублікати</button></label><div><span className={LABEL}>Попередній перегляд</span><div className="flex flex-wrap gap-2">{dedupeAdminSizes(draft.sizes||[]).map(s=><Pill key={s}>{s}</Pill>)}</div></div></div><div className="grid md:grid-cols-2 gap-5"><label><span className={LABEL}>Тканини</span><textarea rows={5} value={(draft.fabrics||[]).join('\n')} onChange={(e)=>arrayText('fabrics',e.target.value)} className={FIELD}/></label><label><span className={LABEL}>Кольори</span><textarea rows={5} value={(draft.colors||[]).join('\n')} onChange={(e)=>arrayText('colors',e.target.value)} className={FIELD}/></label></div><Toggle label="Підйомний механізм" checked={draft.liftingMechanism} onChange={(v)=>set('liftingMechanism',v)}/><div className="grid md:grid-cols-3 gap-5"><Input label="Ширина спального місця" value={draft.sleepingWidth} onChange={(v)=>set('sleepingWidth',v)}/><Input label="Довжина" value={draft.sleepingLength} onChange={(v)=>set('sleepingLength',v)}/><Input label="Висота узголів'я" value={draft.headboardHeight} onChange={(v)=>set('headboardHeight',v)}/></div></>}

          {tab === 'delivery' && <><label><span className={LABEL}>Наявність</span><select value={draft.availability||'made_to_order'} onChange={(e)=>set('availability',e.target.value)} className={FIELD}><option value="in_stock">В наявності</option><option value="made_to_order">Під замовлення</option><option value="out_of_stock">Немає в наявності</option></select></label><div className="grid md:grid-cols-2 gap-5"><Input label="Термін виготовлення" value={draft.productionTime} onChange={(v)=>set('productionTime',v)} placeholder="7–14 днів"/><Input label="Гарантія" value={draft.warranty} onChange={(v)=>set('warranty',v)} placeholder="18 місяців"/></div></>}

          {tab === 'cro' && <><Toggle label="Бестселер / Featured" checked={draft.featured} onChange={(v)=>set('featured',v)} hint="Підсилює мерчандайзинг у каталозі"/><div className="grid md:grid-cols-2 gap-5"><Input label="Рейтинг" type="number" value={draft.rating} onChange={(v)=>set('rating',v)}/><Input label="Кількість відгуків" type="number" value={draft.reviewsCount} onChange={(v)=>set('reviewsCount',v)}/></div><div className="p-5 bg-[#342112] text-[#FAF7F2]"><div className="text-[10px] tracking-[.18em] uppercase opacity-60">Conversion readiness</div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><span>Ціна</span><b>{draft.price?'✓':'—'}</b><span>Розміри</span><b>{draft.sizes?.length?'✓':'—'}</b><span>Термін</span><b>{draft.productionTime?'✓':'—'}</b><span>Фото 3+</span><b>{draft.images?.length>=3?'✓':'—'}</b></div></div></>}

          {tab === 'seo' && <><div className="grid md:grid-cols-2 gap-5"><Input label="SEO H1" value={draft.seoH1} onChange={(v)=>set('seoH1',v)}/><Input label="Canonical URL" value={draft.canonicalUrl} onChange={(v)=>set('canonicalUrl',v)}/></div><div><Input label={`SEO Title · ${(draft.seoTitle||'').length}/60`} value={draft.seoTitle} onChange={(v)=>set('seoTitle',v)}/><div className="h-1 bg-[#342112]/10 mt-1"><div className="h-full bg-[#342112]" style={{width:`${Math.min(100,((draft.seoTitle||'').length/60)*100)}%`}}/></div></div><div><Input label={`Meta Description · ${(draft.seoDescription||'').length}/160`} value={draft.seoDescription} onChange={(v)=>set('seoDescription',v)} textarea/><div className="h-1 bg-[#342112]/10 mt-1"><div className="h-full bg-[#342112]" style={{width:`${Math.min(100,((draft.seoDescription||'').length/160)*100)}%`}}/></div></div><Toggle label="Індексувати товар" checked={draft.indexable !== false} onChange={(v)=>set('indexable',v)}/><div className="p-5 bg-white border border-[#342112]/10"><div className="flex items-center gap-2 text-xs text-[#937C68]"><SearchCheck className="w-4 h-4"/> Google preview</div><div className="mt-3 text-[#1a0dab] text-lg leading-snug">{displayTitle}</div><div className="text-[#006621] text-xs mt-1">domera.shop/product/{draft.slug||'product'}</div><div className="text-sm text-[#4d5156] mt-1 leading-relaxed">{displayDesc}</div></div>{warnings.length>0&&<div className="space-y-2">{warnings.map(w=><div key={w} className="flex items-center gap-2 text-sm text-amber-700"><AlertTriangle className="w-4 h-4"/>{w}</div>)}</div>}</>}

          {tab === 'advanced' && <><div className="grid md:grid-cols-2 gap-5"><Input label="OG Title" value={draft.ogTitle} onChange={(v)=>set('ogTitle',v)}/><Input label="OG Image" value={draft.ogImage} onChange={(v)=>set('ogImage',v)}/></div><Input label="OG Description" value={draft.ogDescription} onChange={(v)=>set('ogDescription',v)} textarea/><Input label="Технічне креслення" value={draft.technicalDrawing} onChange={(v)=>set('technicalDrawing',v)}/><div className="p-4 border border-[#342112]/10 text-xs text-[#937C68]">ID: {draft.id || 'буде створений після збереження'}<br/>Updated: {draft.updated_date || '—'}</div></>}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[98px] self-start">
          <div className="bg-white border border-[#342112]/10 p-5"><div className="flex items-center justify-between"><span className="text-[10px] tracking-[.16em] uppercase text-[#937C68]">Health score</span><strong className="font-heading text-3xl text-[#342112]">{health.score}</strong></div><div className="mt-4 space-y-2 text-xs">{[['SEO',health.seo],['Контент',health.content],['Фото',health.media],['Продаж',health.commerce]].map(([n,v])=><div key={n}><div className="flex justify-between"><span>{n}</span><b>{v}%</b></div><div className="h-1 bg-[#342112]/10 mt-1"><div className="h-full bg-[#342112]" style={{width:`${v}%`}}/></div></div>)}</div>{health.issues.length>0&&<div className="mt-4 pt-4 border-t border-[#342112]/10"><div className="text-[10px] uppercase tracking-[.14em] text-[#937C68] mb-2">Що доповнити</div><div className="flex flex-wrap gap-1">{health.issues.slice(0,6).map(x=><Pill key={x} tone="warn">{x}</Pill>)}</div></div>}</div>
          <div className="bg-[#F8F5EF] border border-[#342112]/10 overflow-hidden"><div className="aspect-[4/5] bg-[#F5E4D1]">{draft.images?.[0]?<img src={draft.images[0]} alt="" className="w-full h-full object-cover"/>:<div className="h-full flex items-center justify-center text-[#937C68]"><ImageIcon/></div>}</div><div className="p-4"><div className="text-[10px] uppercase tracking-[.16em] text-[#937C68]">DOMERA · {categoryNames[draft.category]||'Товар'}</div><div className="font-heading text-2xl mt-1 text-[#342112]">{draft.name||'Назва товару'}</div><div className="mt-3 font-heading text-xl text-[#342112]">{Number(draft.price||0).toLocaleString('uk-UA')} ₴</div><button className="mt-4 w-full py-3 bg-[#342112] text-[#FAF7F2] text-[10px] uppercase tracking-[.16em]">Переглянути модель</button></div></div>
        </aside>
      </div>
    </div>
  </div>;
}

export default function AdminProducts() {
  const [items, setItems] = useState([]); const [loading,setLoading]=useState(true); const [q,setQ]=useState('');
  const [category,setCategory]=useState('all'); const [availability,setAvailability]=useState('all'); const [quality,setQuality]=useState('all');
  const [selected,setSelected]=useState(new Set()); const [editing,setEditing]=useState(null); const [importing,setImporting]=useState(false); const [status,setStatus]=useState('');

  async function load(){setLoading(true); try{setItems(await base44.entities.Product.list('-updated_date',500)||[]);}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  const enriched = useMemo(()=>items.map(p=>({p,h:productHealth(p),warnings:productSeoWarnings(p)})),[items]);
  const filtered = enriched.filter(({p,h,warnings})=>{
    if(q && ![p.name,p.sku,p.slug].some(v=>String(v||'').toLowerCase().includes(q.toLowerCase()))) return false;
    if(category!=='all'&&p.category!==category) return false; if(availability!=='all'&&p.availability!==availability) return false;
    if(quality==='issues'&&h.score>=85) return false; if(quality==='seo'&&warnings.length===0) return false; if(quality==='photos'&&(p.images||[]).length>=3) return false;
    return true;
  });
  const avg = enriched.length?Math.round(enriched.reduce((s,x)=>s+x.h.score,0)/enriched.length):0;
  const seoIssues = enriched.filter(x=>x.warnings.length).length; const photoIssues=enriched.filter(x=>(x.p.images||[]).length<3).length;

  async function bulk(action){const ids=[...selected]; if(!ids.length)return; setStatus(`Оновлення ${ids.length} товарів…`); try{for(const id of ids){const p=items.find(x=>x.id===id); if(!p)continue; let patch={}; if(action==='featured')patch={featured:true}; if(action==='index')patch={indexable:true}; if(action==='noindex')patch={indexable:false}; if(action==='stock')patch={availability:'in_stock'}; if(action==='order')patch={availability:'made_to_order'}; await base44.entities.Product.update(id,patch);} setSelected(new Set()); await load(); setStatus('Готово.');}catch(e){setStatus(e.message||'Помилка')}}
  async function cloneProduct(p){const schema=getSchema('Product'); const payload={}; for(const key of Object.keys(schema.properties||{}))if(p[key]!==undefined)payload[key]=p[key]; payload.name=`${p.name} — копія`; payload.slug=`${p.slug}-copy-${Date.now().toString().slice(-5)}`; payload.sku=p.sku?`${p.sku}-COPY`:''; await base44.entities.Product.create(payload); await load();}
  async function remove(p){if(!confirm(`Видалити «${p.name}»?`))return; await base44.entities.Product.delete(p.id); await load();}

  async function importHomefortBeds(){if(importing)return;if(!confirm('Замінити ВСІ поточні товари категорії «Ліжка» на 16 перевірених моделей Homefort?'))return;setImporting(true);setStatus('Завантаження каталогу…');try{const res=await fetch('/data/homefort-beds.json',{cache:'no-store'});const data=await res.json();const src=Array.isArray(data?.products)?data.products:[];if(src.length!==16)throw new Error(`Очікувалось 16, отримано ${src.length}`);const schemaKeys=new Set(Object.keys(getSchema('Product').properties||{}));const existing=await base44.entities.Product.list('-updated_date',500);for(const p of (existing||[]).filter(x=>x.category==='beds'))await base44.entities.Product.delete(p.id);for(let i=0;i<src.length;i++){setStatus(`Створення ${i+1}/16…`);const payload={};for(const[k,v]of Object.entries(src[i]))if(schemaKeys.has(k)&&v!=null)payload[k]=v;payload.category='beds';payload.indexable=payload.indexable!==false;payload.sizes=dedupeAdminSizes(payload.sizes||[]);await base44.entities.Product.create(payload)}await load();setStatus('16 перевірених моделей імпортовано.');}catch(e){setStatus(e.message||'Помилка імпорту')}setImporting(false)}

  if(loading)return <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#937C68]"/></div>;
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-4 mb-7"><div><div className="text-[10px] tracking-[.2em] uppercase text-[#937C68]">DOMERA Commerce CMS</div><h1 className="font-heading text-4xl text-[#342112] mt-1">Товари</h1><p className="text-sm text-[#755A44] mt-1">Контент, SEO, медіа та продажна готовність каталогу.</p></div><div className="flex gap-2"><button onClick={importHomefortBeds} disabled={importing} className="px-4 py-2.5 border border-[#342112]/20 text-[10px] uppercase tracking-[.14em] flex items-center gap-2">{importing?<Loader2 className="w-4 h-4 animate-spin"/>:<Download className="w-4 h-4"/>} 16 Homefort</button><button onClick={()=>setEditing({category:'beds',availability:'made_to_order',indexable:true,images:[],sizes:[],colors:[],fabrics:[]})} className="px-4 py-2.5 bg-[#342112] text-[#FAF7F2] text-[10px] uppercase tracking-[.14em] flex items-center gap-2"><Plus className="w-4 h-4"/> Додати товар</button></div></div>

    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">{[[items.length,'Товарів',''],[avg,'Середній Health','%'],[seoIssues,'SEO проблем',''],[photoIssues,'Мало фото','']].map(([v,l,s])=><div key={l} className="bg-white border border-[#342112]/10 p-4"><div className="font-heading text-3xl text-[#342112]">{v}{s}</div><div className="text-[10px] uppercase tracking-[.14em] text-[#937C68] mt-1">{l}</div></div>)}</div>

    <div className="bg-white border border-[#342112]/10 p-3 mb-4 flex flex-wrap gap-2 items-center"><div className="relative flex-1 min-w-[220px]"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#937C68]"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Назва, SKU або slug…" className="w-full pl-9 pr-3 py-2 text-sm outline-none"/></div><SlidersHorizontal className="w-4 h-4 text-[#937C68]"/><select value={category} onChange={e=>setCategory(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Усі категорії</option>{Object.entries(categoryNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><select value={availability} onChange={e=>setAvailability(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Будь-яка наявність</option><option value="in_stock">В наявності</option><option value="made_to_order">Під замовлення</option><option value="out_of_stock">Немає</option></select><select value={quality} onChange={e=>setQuality(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Уся якість</option><option value="issues">Health &lt; 85</option><option value="seo">SEO issues</option><option value="photos">Менше 3 фото</option></select></div>

    {selected.size>0&&<div className="mb-4 p-3 bg-[#342112] text-[#FAF7F2] flex flex-wrap items-center gap-2"><span className="text-xs mr-2">Обрано: {selected.size}</span>{[['featured','Зробити Featured'],['stock','В наявності'],['order','Під замовлення'],['index','Index'],['noindex','Noindex']].map(([k,l])=><button key={k} onClick={()=>bulk(k)} className="px-3 py-1.5 border border-white/25 text-[10px] uppercase tracking-[.1em]">{l}</button>)}</div>}
    {status&&<div className="mb-4 text-xs text-[#755A44]">{status}</div>}

    <div className="bg-white border border-[#342112]/10 overflow-x-auto"><table className="w-full text-sm min-w-[980px]"><thead><tr className="border-b border-[#342112]/10 text-left"><th className="p-3"><input type="checkbox" checked={filtered.length>0&&filtered.every(x=>selected.has(x.p.id))} onChange={e=>setSelected(e.target.checked?new Set(filtered.map(x=>x.p.id)):new Set())}/></th>{['Товар','Ціна','Наявність','Health','SEO','Фото','Дії'].map(x=><th key={x} className="p-3 text-[10px] uppercase tracking-[.14em] text-[#937C68] font-medium">{x}</th>)}</tr></thead><tbody>{filtered.map(({p,h,warnings})=><tr key={p.id} className="border-b border-[#342112]/5 hover:bg-[#F8F5EF]"><td className="p-3"><input type="checkbox" checked={selected.has(p.id)} onChange={()=>setSelected(s=>{const n=new Set(s);n.has(p.id)?n.delete(p.id):n.add(p.id);return n})}/></td><td className="p-3"><div className="flex gap-3 items-center">{p.images?.[0]?<img src={p.images[0]} alt="" className="w-12 h-12 object-cover bg-[#F5E4D1]"/>:<div className="w-12 h-12 bg-[#F5E4D1] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-[#937C68]"/></div>}<div><div className="font-medium text-[#342112]">{p.name}</div><div className="text-[10px] text-[#937C68] mt-1">{p.sku||'без SKU'} · {categoryNames[p.category]||p.category}</div></div></div></td><td className="p-3 font-medium">{Number(p.price||0).toLocaleString('uk-UA')} ₴</td><td className="p-3"><Pill tone={p.availability==='in_stock'?'good':p.availability==='out_of_stock'?'bad':'neutral'}>{p.availability==='in_stock'?'В наявності':p.availability==='out_of_stock'?'Немає':'Під замовлення'}</Pill></td><td className="p-3"><Pill tone={h.score>=85?'good':h.score>=65?'warn':'bad'}>{h.score}/100</Pill></td><td className="p-3">{warnings.length===0?<span className="text-emerald-700 flex items-center gap-1 text-xs"><CheckCircle2 className="w-4 h-4"/> Ready</span>:<span className="text-amber-700 flex items-center gap-1 text-xs"><AlertTriangle className="w-4 h-4"/> {warnings.length}</span>}</td><td className="p-3">{p.images?.length||0}</td><td className="p-3 whitespace-nowrap"><button onClick={()=>setEditing(p)} className="p-2 text-[#755A44] hover:text-[#342112]"><Pencil className="w-4 h-4"/></button><button onClick={()=>cloneProduct(p)} className="p-2 text-[#755A44] hover:text-[#342112]"><Copy className="w-4 h-4"/></button>{p.slug&&<a href={`/product/${p.slug}`} target="_blank" className="inline-block p-2 text-[#755A44]"><Eye className="w-4 h-4"/></a>}<button onClick={()=>remove(p)} className="p-2 text-[#755A44] hover:text-red-600"><Trash2 className="w-4 h-4"/></button></td></tr>)}</tbody></table>{filtered.length===0&&<div className="py-14 text-center text-[#937C68]">Товарів за цими фільтрами немає.</div>}</div>
    {editing&&<ProductEditor product={editing} onClose={()=>setEditing(null)} onSaved={load}/>} 
  </div>;
}
