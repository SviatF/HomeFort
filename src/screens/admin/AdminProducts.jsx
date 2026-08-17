'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { productHealth, productSeoWarnings, dedupeAdminSizes } from '@/lib/admin-product-health';

const STORAGE_KEY = 'domera_admin_product_overrides_v1';
const EXTRA_KEY = 'domera_admin_extra_products_v1';
const DELETED_KEY = 'domera_admin_deleted_products_v1';

const categoryNames = {
  beds: 'Ліжка',
  mattresses: 'Матраци',
  toppers: 'Топери',
  pillows: 'Подушки',
  duvets: 'Ковдри',
  bedding: 'Текстиль',
  'kids-mattresses': 'Дитячі матраци',
};

const FIELD = 'w-full bg-white border border-[#342112]/15 px-3 py-2.5 text-sm text-[#342112] outline-none focus:border-[#342112]';
const LABEL = 'block text-[10px] tracking-[0.16em] uppercase text-[#937C68] mb-2';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function canonicalId(product) {
  return String(product?.id || product?.slug || product?.sku || '').trim();
}

function normalizeProduct(product, fallbackIndex = 0) {
  const slug = product.slug || `product-${fallbackIndex + 1}`;
  return {
    indexable: true,
    availability: 'made_to_order',
    category: 'beds',
    images: [],
    sizes: [],
    colors: [],
    fabrics: [],
    ...product,
    slug,
    id: product.id || `github:${slug}`,
    source: product.source || 'github-approved-catalog',
  };
}

function Pill({ children, tone = 'neutral' }) {
  const cls = tone === 'good'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : tone === 'warn'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : tone === 'bad'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-[#F5E4D1]/50 text-[#755A44] border-[#342112]/10';
  return <span className={`inline-flex items-center px-2 py-1 border text-[10px] tracking-[0.08em] uppercase ${cls}`}>{children}</span>;
}

function Field({ label, value, onChange, type = 'text', rows }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {rows ? (
        <textarea rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} className={FIELD} />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
          className={FIELD}
        />
      )}
    </label>
  );
}

function ProductEditor({ product, onClose, onSave }) {
  const [draft, setDraft] = useState(product);
  const [tab, setTab] = useState('main');
  const health = productHealth(draft);
  const warnings = productSeoWarnings(draft);
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const tabs = [
    ['main', 'Основне'],
    ['price', 'Ціна'],
    ['media', 'Фото'],
    ['variants', 'Комплектації'],
    ['seo', 'SEO'],
  ];

  function moveImage(index, direction) {
    const images = [...(draft.images || [])];
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    set('images', images);
  }

  return (
    <div className="fixed inset-0 z-[80] bg-[#342112]/45 flex justify-end">
      <div className="w-full max-w-5xl h-full bg-[#FAF7F2] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-20 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#342112]/10 px-6 py-4 flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-[#755A44]"><X className="w-5 h-5" /></button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[.2em] uppercase text-[#937C68]">GitHub catalog editor</div>
            <h2 className="font-heading text-2xl text-[#342112] truncate">{draft.name || 'Новий товар'}</h2>
          </div>
          <Pill tone={health.score >= 85 ? 'good' : health.score >= 65 ? 'warn' : 'bad'}>Health {health.score}</Pill>
          <button onClick={() => onSave(draft)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#342112] text-[#FAF7F2] text-[10px] tracking-[.16em] uppercase">
            <Save className="w-4 h-4" /> Зберегти
          </button>
        </div>

        <div className="px-6 pt-5 overflow-x-auto">
          <div className="flex gap-1 min-w-max border-b border-[#342112]/10">
            {tabs.map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`px-4 py-3 text-[10px] tracking-[.14em] uppercase border-b-2 ${tab === key ? 'border-[#342112] text-[#342112]' : 'border-transparent text-[#937C68]'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_290px] gap-7 px-6 py-7">
          <div className="space-y-5">
            {tab === 'main' && <>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Назва" value={draft.name} onChange={(v) => set('name', v)} />
                <Field label="Slug" value={draft.slug} onChange={(v) => set('slug', v)} />
                <Field label="SKU" value={draft.sku} onChange={(v) => set('sku', v)} />
                <label className="block"><span className={LABEL}>Категорія</span><select className={FIELD} value={draft.category || 'beds'} onChange={(e) => set('category', e.target.value)}>{Object.entries(categoryNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
              </div>
              <Field label="Короткий опис" rows={4} value={draft.shortDescription} onChange={(v) => set('shortDescription', v)} />
              <Field label="Повний опис" rows={7} value={draft.fullDescription} onChange={(v) => set('fullDescription', v)} />
              <div className="grid md:grid-cols-2 gap-5"><Field label="Матеріал" value={draft.material} onChange={(v) => set('material', v)} /><Field label="Габарити" value={draft.dimensions} onChange={(v) => set('dimensions', v)} /></div>
            </>}

            {tab === 'price' && <div className="grid md:grid-cols-3 gap-5">
              <Field label="Ціна, ₴" type="number" value={draft.price} onChange={(v) => set('price', v)} />
              <Field label="Стара ціна, ₴" type="number" value={draft.oldPrice} onChange={(v) => set('oldPrice', v)} />
              <Field label="Знижка, %" type="number" value={draft.salePercent} onChange={(v) => set('salePercent', v)} />
            </div>}

            {tab === 'media' && <>
              <label className="block"><span className={LABEL}>URL фото — одне на рядок</span><textarea rows={8} className={FIELD} value={(draft.images || []).join('\n')} onChange={(e) => set('images', e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} /></label>
              <div className="space-y-2">{(draft.images || []).map((url, index) => <div key={`${url}-${index}`} className="flex items-center gap-3 bg-white border border-[#342112]/10 p-2"><img src={url} alt="" className="w-16 h-16 object-cover bg-[#F5E4D1]" /><div className="flex-1 min-w-0 text-xs truncate">{url}</div><button onClick={() => moveImage(index, -1)} className="p-2"><ChevronUp className="w-4 h-4" /></button><button onClick={() => moveImage(index, 1)} className="p-2"><ChevronDown className="w-4 h-4" /></button><button onClick={() => set('images', draft.images.filter((_, i) => i !== index))} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button></div>)}</div>
              <Field label="Alt основного фото" value={draft.imageAlt} onChange={(v) => set('imageAlt', v)} />
            </>}

            {tab === 'variants' && <>
              <label className="block"><span className={LABEL}>Розміри — один на рядок</span><textarea rows={7} className={FIELD} value={(draft.sizes || []).join('\n')} onChange={(e) => set('sizes', e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} onBlur={() => set('sizes', dedupeAdminSizes(draft.sizes || []))} /></label>
              <div className="flex flex-wrap gap-2">{dedupeAdminSizes(draft.sizes || []).map((s) => <Pill key={s}>{s}</Pill>)}</div>
              <label className="flex items-center gap-3 bg-white border border-[#342112]/10 p-4"><input type="checkbox" checked={!!draft.liftingMechanism} onChange={(e) => set('liftingMechanism', e.target.checked)} className="w-4 h-4 accent-[#342112]" /><span className="text-sm">Підйомний механізм</span></label>
            </>}

            {tab === 'seo' && <>
              <Field label="SEO H1" value={draft.seoH1} onChange={(v) => set('seoH1', v)} />
              <Field label={`SEO Title · ${(draft.seoTitle || '').length}/60`} value={draft.seoTitle} onChange={(v) => set('seoTitle', v)} />
              <Field label={`Meta Description · ${(draft.seoDescription || '').length}/160`} rows={4} value={draft.seoDescription} onChange={(v) => set('seoDescription', v)} />
              <Field label="Canonical URL" value={draft.canonicalUrl} onChange={(v) => set('canonicalUrl', v)} />
              <label className="flex items-center gap-3 bg-white border border-[#342112]/10 p-4"><input type="checkbox" checked={draft.indexable !== false} onChange={(e) => set('indexable', e.target.checked)} className="w-4 h-4 accent-[#342112]" /><span className="text-sm">Індексувати товар</span></label>
              {warnings.length > 0 && <div className="space-y-2">{warnings.map((warning) => <div key={warning} className="flex items-center gap-2 text-sm text-amber-700"><AlertTriangle className="w-4 h-4" />{warning}</div>)}</div>}
            </>}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <div className="bg-white border border-[#342112]/10 p-5">
              <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.15em] text-[#937C68]">Health</span><strong className="font-heading text-3xl">{health.score}</strong></div>
              <div className="mt-4 space-y-2 text-xs">{[['SEO', health.seo], ['Контент', health.content], ['Фото', health.media], ['Продаж', health.commerce]].map(([name, value]) => <div key={name}><div className="flex justify-between"><span>{name}</span><b>{value}%</b></div><div className="h-1 bg-[#342112]/10 mt-1"><div className="h-full bg-[#342112]" style={{ width: `${value}%` }} /></div></div>)}</div>
            </div>
            <div className="bg-white border border-[#342112]/10 overflow-hidden">
              <div className="aspect-[4/5] bg-[#F5E4D1]">{draft.images?.[0] ? <img src={draft.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[#937C68]"><ImageIcon /></div>}</div>
              <div className="p-4"><div className="font-heading text-2xl text-[#342112]">{draft.name || 'Назва товару'}</div><div className="font-heading text-xl mt-3">{Number(draft.price || 0).toLocaleString('uk-UA')} ₴</div></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [quality, setQuality] = useState('all');
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/data/homefort-beds.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Не вдалося завантажити GitHub-каталог.');
      const data = await response.json();
      const approved = (Array.isArray(data?.products) ? data.products : []).map(normalizeProduct);
      const overrides = readJson(STORAGE_KEY, {});
      const extra = readJson(EXTRA_KEY, []).map(normalizeProduct);
      const deleted = new Set(readJson(DELETED_KEY, []));
      const merged = approved
        .filter((p) => !deleted.has(p.slug))
        .map((p) => normalizeProduct({ ...p, ...(overrides[p.slug] || {}) }));
      const known = new Set(merged.map((p) => p.slug));
      setItems([...merged, ...extra.filter((p) => !known.has(p.slug) && !deleted.has(p.slug))]);
      setStatus(approved.length === 16 ? '16/16 перевірених моделей завантажено з GitHub-каталогу.' : `З GitHub завантажено ${approved.length} товарів.`);
    } catch (error) {
      setStatus(error?.message || 'Помилка завантаження каталогу.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function saveProduct(product) {
    const normalized = normalizeProduct({ ...product, sizes: dedupeAdminSizes(product.sizes || []) });
    if (String(normalized.id).startsWith('github:')) {
      const overrides = readJson(STORAGE_KEY, {});
      overrides[normalized.slug] = { ...normalized, id: undefined, source: 'admin-local-override' };
      writeJson(STORAGE_KEY, overrides);
    } else {
      const extra = readJson(EXTRA_KEY, []);
      const index = extra.findIndex((p) => canonicalId(p) === canonicalId(normalized));
      if (index >= 0) extra[index] = normalized;
      else extra.push(normalized);
      writeJson(EXTRA_KEY, extra);
    }
    setEditing(null);
    setStatus('Зміни збережено локально в цій адмін-сесії/браузері. GitHub source catalog не змінено.');
    load();
  }

  function cloneProduct(product) {
    const clone = normalizeProduct({ ...product, id: `local:${Date.now()}`, name: `${product.name} — копія`, slug: `${product.slug}-copy-${Date.now().toString().slice(-5)}`, sku: product.sku ? `${product.sku}-COPY` : '' });
    const extra = readJson(EXTRA_KEY, []);
    extra.push(clone);
    writeJson(EXTRA_KEY, extra);
    load();
  }

  function removeProduct(product) {
    if (!confirm(`Прибрати «${product.name}» з локальної адмінки?`)) return;
    if (String(product.id).startsWith('github:')) {
      const deleted = readJson(DELETED_KEY, []);
      writeJson(DELETED_KEY, [...new Set([...deleted, product.slug])]);
    } else {
      writeJson(EXTRA_KEY, readJson(EXTRA_KEY, []).filter((p) => canonicalId(p) !== canonicalId(product)));
    }
    load();
  }

  function resetLocalChanges() {
    if (!confirm('Скинути всі локальні зміни та знову показати оригінальні 16 товарів з GitHub?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXTRA_KEY);
    localStorage.removeItem(DELETED_KEY);
    load();
  }

  const enriched = useMemo(() => items.map((p) => ({ p, h: productHealth(p), warnings: productSeoWarnings(p) })), [items]);
  const filtered = enriched.filter(({ p, h, warnings }) => {
    if (q && ![p.name, p.sku, p.slug].some((v) => String(v || '').toLowerCase().includes(q.toLowerCase()))) return false;
    if (category !== 'all' && p.category !== category) return false;
    if (quality === 'issues' && h.score >= 85) return false;
    if (quality === 'seo' && warnings.length === 0) return false;
    if (quality === 'photos' && (p.images || []).length >= 3) return false;
    return true;
  });
  const avg = enriched.length ? Math.round(enriched.reduce((sum, item) => sum + item.h.score, 0) / enriched.length) : 0;
  const seoIssues = enriched.filter((item) => item.warnings.length).length;
  const photoIssues = enriched.filter((item) => (item.p.images || []).length < 3).length;

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#937C68]" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <div className="text-[10px] tracking-[.2em] uppercase text-[#937C68]">DOMERA Commerce CMS</div>
          <h1 className="font-heading text-4xl text-[#342112] mt-1">Товари</h1>
          <p className="text-sm text-[#755A44] mt-1">GitHub approved catalog · всі 16 моделей повинні бути тут одразу.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={resetLocalChanges} className="px-4 py-2.5 border border-[#342112]/20 text-[10px] uppercase tracking-[.14em]">Скинути локальні зміни</button>
          <button onClick={() => setEditing(normalizeProduct({ id: `local:${Date.now()}`, category: 'beds', name: '', slug: '', images: [], sizes: [], price: 0 }))} className="px-4 py-2.5 bg-[#342112] text-[#FAF7F2] text-[10px] uppercase tracking-[.14em] flex items-center gap-2"><Plus className="w-4 h-4" /> Додати товар</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[[items.length, 'Товарів', ''], [avg, 'Середній Health', '%'], [seoIssues, 'SEO проблем', ''], [photoIssues, 'Мало фото', '']].map(([value, label, suffix]) => <div key={label} className="bg-white border border-[#342112]/10 p-4"><div className="font-heading text-3xl text-[#342112]">{value}{suffix}</div><div className="text-[10px] uppercase tracking-[.14em] text-[#937C68] mt-1">{label}</div></div>)}
      </div>

      <div className="mb-4 p-3 border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{status}</div>

      <div className="bg-white border border-[#342112]/10 p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#937C68]" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Назва, SKU або slug…" className="w-full pl-9 pr-3 py-2 text-sm outline-none" /></div>
        <SlidersHorizontal className="w-4 h-4 text-[#937C68]" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Усі категорії</option>{Object.entries(categoryNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="border border-[#342112]/10 px-3 py-2 text-xs"><option value="all">Уся якість</option><option value="issues">Health &lt; 85</option><option value="seo">SEO issues</option><option value="photos">Менше 3 фото</option></select>
      </div>

      <div className="bg-white border border-[#342112]/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[940px]">
          <thead><tr className="border-b border-[#342112]/10 text-left">{['Товар', 'Ціна', 'Наявність', 'Health', 'SEO', 'Фото', 'Дії'].map((x) => <th key={x} className="p-3 text-[10px] uppercase tracking-[.14em] text-[#937C68] font-medium">{x}</th>)}</tr></thead>
          <tbody>{filtered.map(({ p, h, warnings }) => <tr key={p.id} className="border-b border-[#342112]/5 hover:bg-[#F8F5EF]">
            <td className="p-3"><div className="flex gap-3 items-center">{p.images?.[0] ? <img src={p.images[0]} alt="" className="w-14 h-14 object-cover bg-[#F5E4D1]" /> : <div className="w-14 h-14 bg-[#F5E4D1] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-[#937C68]" /></div>}<div><div className="font-medium text-[#342112]">{p.name}</div><div className="text-[10px] text-[#937C68] mt-1">{p.sku || 'без SKU'} · {categoryNames[p.category] || p.category}</div><div className="text-[9px] uppercase tracking-[.1em] text-emerald-700 mt-1">{String(p.id).startsWith('github:') ? 'GitHub approved' : 'Local admin'}</div></div></div></td>
            <td className="p-3 font-medium">{Number(p.price || 0).toLocaleString('uk-UA')} ₴</td>
            <td className="p-3"><Pill tone={p.availability === 'in_stock' ? 'good' : p.availability === 'out_of_stock' ? 'bad' : 'neutral'}>{p.availability === 'in_stock' ? 'В наявності' : p.availability === 'out_of_stock' ? 'Немає' : 'Під замовлення'}</Pill></td>
            <td className="p-3"><Pill tone={h.score >= 85 ? 'good' : h.score >= 65 ? 'warn' : 'bad'}>{h.score}/100</Pill></td>
            <td className="p-3">{warnings.length === 0 ? <span className="text-emerald-700 flex items-center gap-1 text-xs"><CheckCircle2 className="w-4 h-4" /> Ready</span> : <span className="text-amber-700 flex items-center gap-1 text-xs"><AlertTriangle className="w-4 h-4" /> {warnings.length}</span>}</td>
            <td className="p-3">{p.images?.length || 0}</td>
            <td className="p-3 whitespace-nowrap"><button onClick={() => setEditing(p)} className="p-2 text-[#755A44] hover:text-[#342112]"><Pencil className="w-4 h-4" /></button><button onClick={() => cloneProduct(p)} className="p-2 text-[#755A44] hover:text-[#342112]"><Copy className="w-4 h-4" /></button>{p.slug && <a href={`/product/${p.slug}`} target="_blank" className="inline-block p-2 text-[#755A44]"><Eye className="w-4 h-4" /></a>}<button onClick={() => removeProduct(p)} className="p-2 text-[#755A44] hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
          </tr>)}</tbody>
        </table>
        {filtered.length === 0 && <div className="py-14 text-center text-[#937C68]">Товарів за цими фільтрами немає.</div>}
      </div>

      {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} onSave={saveProduct} />}
    </div>
  );
}
