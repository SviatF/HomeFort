'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Copy, Eye, Image as ImageIcon, Loader2, Pencil, Plus, Save, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { productHealth, productSeoWarnings, dedupeAdminSizes } from '@/lib/admin-product-health';
import { discountPercent, isDiscountActive } from '@/lib/product-promo';

const categoryNames = { beds: 'Ліжка', mattresses: 'Матраци', toppers: 'Топери', pillows: 'Подушки', duvets: 'Ковдри', bedding: 'Текстиль', 'kids-mattresses': 'Дитячі матраци' };
const FIELD = 'w-full bg-white border border-[#342112]/15 px-3 py-2.5 text-sm text-[#342112] outline-none focus:border-[#342112]';
const LABEL = 'block text-[10px] tracking-[0.16em] uppercase text-[#937C68] mb-2';

function canonicalId(product) { return String(product?.id || product?.slug || product?.sku || '').trim(); }
function toLocalDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function normalizeProduct(product, fallbackIndex = 0) {
  const slug = product.slug || `product-${fallbackIndex + 1}`;
  const price = Number(product.price_current ?? product.price ?? 0);
  const old = product.price_old ?? product.oldPrice ?? null;
  return {
    indexable: true, availability: 'made_to_order', category: 'beds', images: [], sizes: [], colors: [], fabrics: [],
    popup_discount_only: false, popup_delay_seconds: 25,
    ...product,
    price, price_current: price,
    oldPrice: old == null || old === '' ? null : Number(old),
    price_old: old == null || old === '' ? null : Number(old),
    slug,
    id: product.id || `github:${slug}`,
    source: product.source || 'github-approved-catalog',
  };
}
function fabricsToText(fabrics = []) {
  return fabrics.map((f) => typeof f === 'string' ? f : [f.name || f.label || '', f.colorHex || f.color || '', f.swatchImage || f.image || '', f.macroImage || ''].join(' | ')).join('\n');
}
function textToFabrics(text = '') {
  return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name = '', colorHex = '', swatchImage = '', macroImage = ''] = line.split('|').map((x) => x.trim());
    if (!colorHex && !swatchImage && !macroImage) return name;
    return { name, colorHex, swatchImage, macroImage };
  });
}
function Pill({ children, tone = 'neutral' }) {
  const cls = tone === 'good' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : tone === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' : tone === 'bad' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#F5E4D1]/50 text-[#755A44] border-[#342112]/10';
  return <span className={`inline-flex items-center px-2 py-1 border text-[10px] tracking-[0.08em] uppercase ${cls}`}>{children}</span>;
}
function Field({ label, value, onChange, type = 'text', rows, placeholder }) {
  return <label className="block"><span className={LABEL}>{label}</span>{rows ? <textarea rows={rows} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={FIELD} /> : <input type={type} value={type === 'datetime-local' ? toLocalDateTime(value) : value ?? ''} placeholder={placeholder} onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : type === 'datetime-local' ? (e.target.value ? new Date(e.target.value).toISOString() : null) : e.target.value)} className={FIELD} />}</label>;
}

function ProductEditor({ product, onClose, onSave }) {
  const [draft, setDraft] = useState(normalizeProduct(product));
  const [tab, setTab] = useState('main');
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState('');
  const health = productHealth(draft);
  const warnings = productSeoWarnings(draft);
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const tabs = [['main', 'Основне'], ['price', 'Ціна / акція'], ['media', 'Фото'], ['variants', 'Комплектації'], ['cro', 'CRO / popup'], ['seo', 'SEO']];

  const save = async () => {
    const current = Number(draft.price_current ?? draft.price ?? 0);
    const old = draft.price_old == null ? null : Number(draft.price_old);
    if (!current || current <= 0) return setValidation('Актуальна ціна повинна бути більшою за 0.');
    if (old != null && old <= current) return setValidation('Стара ціна має бути більшою за актуальну або залиште поле порожнім.');
    setValidation(''); setSaving(true);
    try { await onSave(normalizeProduct({ ...draft, price: current, price_current: current, oldPrice: old, price_old: old, salePercent: old ? Math.round((1 - current / old) * 100) : 0 })); }
    finally { setSaving(false); }
  };
  function moveImage(index, direction) {
    const images = [...(draft.images || [])]; const target = index + direction; if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]]; set('images', images);
  }

  return <div className="fixed inset-0 z-[80] bg-[#342112]/45 flex justify-end"><div className="w-full max-w-5xl h-full bg-[#FAF7F2] overflow-y-auto shadow-2xl">
    <div className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#342112]/10 px-6 py-4 flex items-center gap-4">
      <button onClick={onClose} className="p-2 text-[#755A44]"><X className="w-5 h-5" /></button><div className="flex-1 min-w-0"><div className="text-[10px] tracking-[.2em] uppercase text-[#937C68]">DOMERA central catalog</div><h2 className="font-heading text-2xl text-[#342112] truncate">{draft.name || 'Новий товар'}</h2></div><Pill tone={health.score >= 85 ? 'good' : health.score >= 65 ? 'warn' : 'bad'}>Health {health.score}</Pill><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#342112] text-[#FAF7F2] text-[10px] tracking-[.16em] uppercase disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Зберегти</button>
    </div>
    <div className="px-6 pt-5 overflow-x-auto"><div className="flex gap-1 min-w-max border-b border-[#342112]/10">{tabs.map(([key,label]) => <button key={key} onClick={() => setTab(key)} className={`px-4 py-3 text-[10px] tracking-[.14em] uppercase border-b-2 ${tab === key ? 'border-[#342112] text-[#342112]' : 'border-transparent text-[#937C68]'}`}>{label}</button>)}</div></div>
    <div className="grid lg:grid-cols-[1fr_290px] gap-7 px-6 py-7"><div className="space-y-5">
      {validation && <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5" />{validation}</div>}
      {tab === 'main' && <><div className="grid md:grid-cols-2 gap-5"><Field label="Назва" value={draft.name} onChange={(v)=>set('name',v)} /><Field label="Slug" value={draft.slug} onChange={(v)=>set('slug',v)} /><Field label="SKU" value={draft.sku} onChange={(v)=>set('sku',v)} /><label><span className={LABEL}>Категорія</span><select className={FIELD} value={draft.category || 'beds'} onChange={(e)=>set('category',e.target.value)}>{Object.entries(categoryNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div><Field label="Короткий опис" rows={4} value={draft.shortDescription} onChange={(v)=>set('shortDescription',v)} /><Field label="Повний опис" rows={7} value={draft.fullDescription} onChange={(v)=>set('fullDescription',v)} /><div className="grid md:grid-cols-2 gap-5"><Field label="Матеріал" value={draft.material} onChange={(v)=>set('material',v)} /><Field label="Габарити" value={draft.dimensions} onChange={(v)=>set('dimensions',v)} /></div><Field label="URL схеми габаритів" value={draft.technicalDrawing} onChange={(v)=>set('technicalDrawing',v)} placeholder="https://…" /></>}
      {tab === 'price' && <><div className="grid md:grid-cols-2 gap-5"><Field label="Актуальна ціна, ₴" type="number" value={draft.price_current} onChange={(v)=>{set('price_current',v);set('price',v);}} /><Field label="Стара ціна, ₴" type="number" value={draft.price_old} onChange={(v)=>{set('price_old',v);set('oldPrice',v);}} /><Field label="Підпис акції" value={draft.discount_label} onChange={(v)=>set('discount_label',v)} placeholder="Акція −15% / Розпродаж серії LUX" /><Field label="Акція діє до" type="datetime-local" value={draft.discount_valid_until} onChange={(v)=>set('discount_valid_until',v)} /></div>{draft.price_old > draft.price_current && <div className="p-4 bg-[#C8643B]/10 border border-[#C8643B]/20 text-sm text-[#8B4229]">На сайті буде показано автоматичну знижку <strong>−{Math.round((1 - draft.price_current / draft.price_old) * 100)}%</strong>. Після дедлайну стара ціна, badge і countdown автоматично зникнуть.</div>}</>}
      {tab === 'media' && <><label><span className={LABEL}>URL фото — одне на рядок</span><textarea rows={8} className={FIELD} value={(draft.images||[]).join('\n')} onChange={(e)=>set('images',e.target.value.split('\n').map(x=>x.trim()).filter(Boolean))} /></label><div className="space-y-2">{(draft.images||[]).map((url,index)=><div key={`${url}-${index}`} className="flex items-center gap-3 bg-white border border-[#342112]/10 p-2"><img src={url} alt="" className="w-16 h-16 object-cover bg-[#F5E4D1]" /><div className="flex-1 min-w-0 text-xs truncate">{url}</div><button onClick={()=>moveImage(index,-1)} className="p-2"><ChevronUp className="w-4 h-4" /></button><button onClick={()=>moveImage(index,1)} className="p-2"><ChevronDown className="w-4 h-4" /></button><button onClick={()=>set('images',draft.images.filter((_,i)=>i!==index))} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button></div>)}</div><Field label="Alt основного фото" value={draft.imageAlt} onChange={(v)=>set('imageAlt',v)} /></>}
      {tab === 'variants' && <><label><span className={LABEL}>Розміри — один на рядок</span><textarea rows={6} className={FIELD} value={(draft.sizes||[]).join('\n')} onChange={(e)=>set('sizes',e.target.value.split('\n').map(x=>x.trim()).filter(Boolean))} onBlur={()=>set('sizes',dedupeAdminSizes(draft.sizes||[]))} /></label><div className="flex flex-wrap gap-2">{dedupeAdminSizes(draft.sizes||[]).map(s=><Pill key={s}>{s}</Pill>)}</div><label><span className={LABEL}>Тканини / свотчі — `Назва | #HEX | URL свотча | URL макро`</span><textarea rows={7} className={FIELD} value={fabricsToText(draft.fabrics)} onChange={(e)=>set('fabrics',textToFabrics(e.target.value))} placeholder={'Gemini 01 | #D8D0C5 | https://…/swatch.jpg | https://…/macro.jpg'} /></label><label className="flex items-center gap-3 bg-white border border-[#342112]/10 p-4"><input type="checkbox" checked={!!draft.liftingMechanism} onChange={(e)=>set('liftingMechanism',e.target.checked)} /><span className="text-sm">Підйомний механізм доступний</span></label></>}
      {tab === 'cro' && <><Field label="Текст popup" rows={5} value={draft.popup_text} onChange={(v)=>set('popup_text',v)} placeholder="Залиште порожнім — сайт використає чесний контекстний текст без вигаданих залишків." /><div className="grid md:grid-cols-2 gap-5"><Field label="Затримка popup, секунд" type="number" value={draft.popup_delay_seconds ?? 25} onChange={(v)=>set('popup_delay_seconds',Math.min(120,Math.max(20,v||25)))} /><label className="flex items-center gap-3 bg-white border border-[#342112]/10 p-4 mt-5"><input type="checkbox" checked={!!draft.popup_discount_only} onChange={(e)=>set('popup_discount_only',e.target.checked)} /><span className="text-sm">Показувати popup тільки коли активна знижка</span></label></div><p className="text-xs text-[#755A44]">Popup показується один раз на 24 години, через заданий час або по exit-intent на desktop. Мінімальна затримка — 20 секунд.</p></>}
      {tab === 'seo' && <><Field label="SEO H1" value={draft.seoH1} onChange={(v)=>set('seoH1',v)} /><Field label={`SEO Title · ${(draft.seoTitle||'').length}/60`} value={draft.seoTitle} onChange={(v)=>set('seoTitle',v)} /><Field label={`Meta Description · ${(draft.seoDescription||'').length}/160`} rows={4} value={draft.seoDescription} onChange={(v)=>set('seoDescription',v)} /><Field label="Canonical URL" value={draft.canonicalUrl} onChange={(v)=>set('canonicalUrl',v)} /><label className="flex items-center gap-3 bg-white border border-[#342112]/10 p-4"><input type="checkbox" checked={draft.indexable !== false} onChange={(e)=>set('indexable',e.target.checked)} /><span className="text-sm">Індексувати товар</span></label>{warnings.length>0&&<div className="space-y-2">{warnings.map(w=><div key={w} className="flex items-center gap-2 text-sm text-amber-700"><AlertTriangle className="w-4 h-4" />{w}</div>)}</div>}</>}
    </div><aside className="space-y-4 lg:sticky lg:top-24 self-start"><div className="bg-white border border-[#342112]/10 p-5"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.15em] text-[#937C68]">Health</span><strong className="font-heading text-3xl">{health.score}</strong></div></div><div className="bg-white border border-[#342112]/10 overflow-hidden"><div className="aspect-[4/5] bg-[#F5E4D1]">{draft.images?.[0]?<img src={draft.images[0]} alt="" className="w-full h-full object-cover" />:<div className="h-full flex items-center justify-center text-[#937C68]"><ImageIcon /></div>}</div><div className="p-4">{isDiscountActive(draft)&&<div className="inline-flex bg-[#C8643B] text-white px-2 py-1 text-[9px] uppercase mb-2">{draft.discount_label || `Акція −${discountPercent(draft)}%`}</div>}<div className="font-heading text-2xl text-[#342112]">{draft.name||'Назва товару'}</div><div className={`font-heading text-xl mt-3 ${isDiscountActive(draft)?'text-[#C8643B]':''}`}>{Number(draft.price_current||0).toLocaleString('uk-UA')} ₴</div>{isDiscountActive(draft)&&<div className="text-xs line-through text-[#937C68]">{Number(draft.price_old||0).toLocaleString('uk-UA')} ₴</div>}</div></div></aside></div>
  </div></div>;
}

export default function AdminProducts() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [q,setQ]=useState(''); const [category,setCategory]=useState('all'); const [quality,setQuality]=useState('all'); const [editing,setEditing]=useState(null); const [status,setStatus]=useState('');
  async function load(){ setLoading(true); try { const response=await fetch('/api/admin/products',{cache:'no-store'}); if(!response.ok){ const fallback=await fetch('/data/homefort-beds.json',{cache:'no-store'}); if(!fallback.ok) throw new Error('Не вдалося завантажити каталог.'); const data=await fallback.json(); setItems((data.products||[]).map(normalizeProduct)); setStatus('Каталог завантажено read-only. Для центрального редагування перевірте admin session/API.'); } else { const data=await response.json(); setItems((data.products||[]).map(normalizeProduct)); setStatus(`Центральний каталог завантажено: ${(data.products||[]).length} товарів.`); } } catch(error){ setStatus(error?.message||'Помилка завантаження каталогу.'); setItems([]); } finally{ setLoading(false); } }
  useEffect(()=>{load();},[]);
  async function saveProduct(product){ const response=await fetch('/api/admin/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'upsert',product})}); const result=await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error||'Не вдалося зберегти товар.'); setEditing(null); setStatus(result.github?.ok ? `Збережено централізовано. GitHub commit: ${result.github.commit?.slice(0,8)||'OK'}` : result.local?.ok ? 'Збережено у центральному каталозі сервера.' : 'Збережено.'); await load(); }
  async function cloneProduct(product){ const clone=normalizeProduct({...product,id:`admin:${Date.now()}`,name:`${product.name} — копія`,slug:`${product.slug}-copy-${Date.now().toString().slice(-5)}`,sku:product.sku?`${product.sku}-COPY`:''}); await saveProduct(clone); }
  async function removeProduct(product){ if(!confirm(`Видалити «${product.name}» із центрального каталогу?`)) return; const response=await fetch('/api/admin/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',slug:product.slug})}); if(!response.ok) return setStatus('Не вдалося видалити товар.'); setStatus('Товар видалено з центрального каталогу.'); await load(); }
  const enriched=useMemo(()=>items.map(p=>({p,h:productHealth(p),warnings:productSeoWarnings(p)})),[items]);
  const filtered=enriched.filter(({p,h,warnings})=>{ if(q&&![p.name,p.sku,p.slug].some(v=>String(v||'').toLowerCase().includes(q.toLowerCase())))return false; if(category!=='all'&&p.category!==category)return false; if(quality==='issues'&&h.score>=85)return false; if(quality==='seo'&&warnings.length===0)return false; if(quality==='discount'&&!isDiscountActive(p))return false; return true; });
  const avg=enriched.length?Math.round(enriched.reduce((s,i)=>s+i.h.score,0)/enriched.length):0; const seoIssues=enriched.filter(i=>i.warnings.length).length; const activeDiscounts=enriched.filter(i=>isDiscountActive(i.p)).length;
  if(loading)return <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#937C68]" /></div>;
  return <div><div className="flex flex-wrap items-start justify-between gap-4 mb-7"><div><div className="text-[10px] tracking-[.2em] uppercase text-[#937C68]">DOMERA Commerce CMS</div><h1 className="font-heading text-4xl text-[#342112] mt-1">Товари</h1><p className="text-sm text-[#755A44] mt-1">Центральне редагування каталогу, SEO, акцій і CRO без втручання розробника.</p></div><button onClick={()=>setEditing(normalizeProduct({id:`admin:${Date.now()}`,category:'beds',name:'',slug:'',images:[],sizes:[],price_current:0}))} className="px-4 py-2.5 bg-[#342112] text-[#FAF7F2] text-[10px] uppercase tracking-[.14em] flex items-center gap-2"><Plus className="w-4 h-4" /> Додати товар</button></div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">{[[items.length,'Товарів',''],[avg,'Середній Health','%'],[seoIssues,'SEO проблем',''],[activeDiscounts,'Активних акцій','']].map(([v,l,s])=><div key={l} className="bg-white border border-[#342112]/10 p-4"><div className="font-heading text-3xl text-[#342112]">{v}{s}</div><div className="text-[10px] uppercase tracking-[.14em] text-[#937C68] mt-1">{l}</div></div>)}</div>
    <div className="mb-4 p-3 border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{status}</div>
    <div className="bg-white border border-[#342112]/10 p-3 mb-4 flex flex-wrap gap-2 items-center"><div className="relative flex-1 min-w-[220px]"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#937C68]" /><input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Назва, SKU або slug…" className="w-full pl-9 pr-3 py-2 text-sm outline-none" /></div><SlidersHorizontal className="w-4 h-4 text-[#937C68]" /><select value={category} onChange={(e)=>setCategory(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Усі категорії</option>{Object.entries(categoryNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><select value={quality} onChange={(e)=>setQuality(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Уся якість</option><option value="issues">Health &lt; 85</option><option value="seo">SEO issues</option><option value="discount">Активна акція</option></select></div>
    <div className="bg-white border border-[#342112]/10 overflow-x-auto"><table className="w-full text-sm min-w-[940px]"><thead><tr className="border-b border-[#342112]/10 text-left">{['Товар','Ціна','Акція','Наявність','Health','SEO','Дії'].map(x=><th key={x} className="p-3 text-[10px] uppercase tracking-[.14em] text-[#937C68] font-medium">{x}</th>)}</tr></thead><tbody>{filtered.map(({p,h,warnings})=><tr key={canonicalId(p)} className="border-b border-[#342112]/5 hover:bg-[#F8F5EF]"><td className="p-3"><div className="flex gap-3 items-center">{p.images?.[0]?<img src={p.images[0]} alt="" className="w-14 h-14 object-cover bg-[#F5E4D1]" />:<div className="w-14 h-14 bg-[#F5E4D1] flex items-center justify-center"><ImageIcon className="w-4 h-4" /></div>}<div><div className="font-medium text-[#342112]">{p.name}</div><div className="text-[10px] text-[#937C68] mt-1">{p.sku||'без SKU'} · {categoryNames[p.category]||p.category}</div></div></div></td><td className="p-3"><div className={isDiscountActive(p)?'text-[#C8643B] font-semibold':''}>{Number(p.price_current||p.price||0).toLocaleString('uk-UA')} ₴</div>{isDiscountActive(p)&&<div className="text-xs line-through text-[#937C68]">{Number(p.price_old).toLocaleString('uk-UA')} ₴</div>}</td><td className="p-3">{isDiscountActive(p)?<Pill tone="warn">−{discountPercent(p)}%</Pill>:<span className="text-[#937C68]">—</span>}</td><td className="p-3"><Pill tone={p.availability==='in_stock'?'good':p.availability==='out_of_stock'?'bad':'neutral'}>{p.availability==='in_stock'?'В наявності':p.availability==='out_of_stock'?'Немає':'Під замовлення'}</Pill></td><td className="p-3"><Pill tone={h.score>=85?'good':h.score>=65?'warn':'bad'}>{h.score}/100</Pill></td><td className="p-3">{warnings.length===0?<span className="text-emerald-700 text-xs">Ready</span>:<span className="text-amber-700 text-xs">{warnings.length} issues</span>}</td><td className="p-3 whitespace-nowrap"><button onClick={()=>setEditing(p)} className="p-2"><Pencil className="w-4 h-4" /></button><button onClick={()=>cloneProduct(p)} className="p-2"><Copy className="w-4 h-4" /></button>{p.slug&&<a href={`/product/${p.slug}`} target="_blank" className="inline-block p-2"><Eye className="w-4 h-4" /></a>}<button onClick={()=>removeProduct(p)} className="p-2 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table>{filtered.length===0&&<div className="py-14 text-center text-[#937C68]">Товарів за цими фільтрами немає.</div>}</div>
    {editing&&<ProductEditor product={editing} onClose={()=>setEditing(null)} onSave={saveProduct} />}
  </div>;
}
