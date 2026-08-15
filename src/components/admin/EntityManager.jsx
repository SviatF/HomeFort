'use client';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ImageUpload from './ImageUpload';
import { getSchema } from './entitySchemas';
import { Loader2, Plus, Pencil, Trash2, X, Search } from 'lucide-react';

const IMAGE_FIELDS = new Set(['images', 'image', 'coverImage', 'macroImage', 'swatchImage', 'technicalDrawing', 'ogImage']);
const LONG_FIELDS = new Set([
  'description', 'shortDescription', 'fullDescription', 'content', 'seoDescription', 'seoIntro',
  'message', 'productionTimeText', 'deliveryInfo', 'paymentInfo', 'warrantyInfo', 'returnInfo',
  'fabricSampleDescription', 'address', 'showroomAddress', 'productionAddress', 'comment', 'configuration', 'quizResult',
]);

function isImageField(name, def) {
  if (IMAGE_FIELDS.has(name)) return true;
  if (def.type === 'array' && def.items?.type === 'string' && /image|photo|swatch/i.test(name)) return true;
  return false;
}

function Field({ name, def, value, onChange }) {
  const label = def.title || name;
  if (isImageField(name, def)) {
    return <ImageUpload value={value || (def.type === 'array' ? [] : '')} onChange={onChange} multiple={def.type === 'array'} />;
  }
  if (def.type === 'array') {
    if (def.items?.type === 'object') {
      return (
        <textarea
          rows={5}
          className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm font-mono text-[#342112] focus:border-[#342112] outline-none"
          value={value ? JSON.stringify(value, null, 2) : ''}
          onChange={(e) => {
            try {
              onChange(e.target.value ? JSON.parse(e.target.value) : []);
            } catch {}
          }}
          placeholder="[]"
        />
      );
    }
    return (
      <textarea
        rows={3}
        className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
        value={Array.isArray(value) ? value.join('\n') : ''}
        onChange={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
        placeholder="Одне значення на рядок"
      />
    );
  }
  if (def.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#342112]" />
        <span className="text-sm text-[#755A44]">{value ? 'Так' : 'Ні'}</span>
      </label>
    );
  }
  if (def.enum) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
      >
        <option value="">— оберіть —</option>
        {def.enum.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }
  if (def.type === 'number') {
    return (
      <input
        type="number"
        step="any"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
      />
    );
  }
  if (def.format === 'date') {
    return (
      <input
        type="date"
        value={value ? String(value).split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
      />
    );
  }
  if (def.format === 'date-time') {
    return (
      <input
        type="datetime-local"
        value={value ? String(value).slice(0, 16) : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
      />
    );
  }
  if (LONG_FIELDS.has(name)) {
    return (
      <textarea
        rows={4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
      />
    );
  }
  return (
    <input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#FAF7F2] border border-[#342112]/15 px-3 py-2 text-sm text-[#342112] focus:border-[#342112] outline-none"
    />
  );
}

export default function EntityManager({ entityName, title, subtitle, columns = [], searchFields = [] }) {
  const [items, setItems] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const data = await base44.entities[entityName].list('-updated_date', 200);
      setItems(data || []);
      setSchema(getSchema(entityName));
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  }

  const filtered = q && searchFields.length
    ? items.filter((it) => searchFields.some((f) => String(it[f] || '').toLowerCase().includes(q.toLowerCase())))
    : items;

  function startNew() {
    const props = getSchema(entityName).properties || {};
    const init = {};
    for (const [k, def] of Object.entries(props)) {
      if (def.default !== undefined) init[k] = def.default;
    }
    setEditing(init);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const props = schema?.properties || {};
      const payload = {};
      for (const [k, def] of Object.entries(props)) {
        if (k in editing) {
          let v = editing[k];
          if (def.type === 'array' && def.items?.type === 'string' && !isImageField(k, def)) {
            v = Array.isArray(v) ? v : [];
          }
          payload[k] = v;
        }
      }
      if (editing.id) {
        await base44.entities[entityName].update(editing.id, payload);
      } else {
        await base44.entities[entityName].create(payload);
      }
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Помилка збереження');
    }
    setSaving(false);
  }

  async function remove(it) {
    if (!confirm('Видалити цей запис?')) return;
    try {
      await base44.entities[entityName].delete(it.id);
      await load();
    } catch (e) {
      alert(e?.message || 'Помилка видалення');
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-[#937C68]" />
      </div>
    );

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl text-[#342112]">{title}</h1>
          {subtitle && <p className="text-sm text-[#755A44] mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-[#342112] text-[#FAF7F2] text-[11px] tracking-[0.18em] uppercase hover:bg-[#4a2f1c] transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={1.6} /> Додати
        </button>
      </div>

      {searchFields.length > 0 && (
        <div className="relative mb-6 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#937C68]" strokeWidth={1.4} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук…"
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#342112]/15 text-sm text-[#342112] focus:border-[#342112] outline-none"
          />
        </div>
      )}

      {err && <div className="mb-6 px-4 py-3 bg-[#8B3A2E]/5 border border-[#8B3A2E]/20 text-sm text-[#8B3A2E]">{err}</div>}

      <div className="bg-[#FAF7F2] border border-[#342112]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#342112]/10 text-left">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-[#937C68] font-medium">{c.label}</th>
              ))}
              <th className="px-4 py-3 text-right text-[10px] tracking-[0.18em] uppercase text-[#937C68] font-medium">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-[#937C68]">Записів не знайдено</td>
              </tr>
            )}
            {filtered.map((it) => (
              <tr key={it.id} className="border-b border-[#342112]/5 hover:bg-[#F5E4D1]/40 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-[#342112] align-top">
                    {c.render ? c.render(it) : String(it[c.key] ?? '—')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing({ ...it })} className="p-1.5 text-[#755A44] hover:text-[#342112] transition-colors" aria-label="Редагувати">
                    <Pencil className="w-4 h-4" strokeWidth={1.4} />
                  </button>
                  <button onClick={() => remove(it)} className="p-1.5 text-[#755A44] hover:text-[#8B3A2E] transition-colors ml-1" aria-label="Видалити">
                    <Trash2 className="w-4 h-4" strokeWidth={1.4} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#342112]/40" onClick={() => setEditing(null)} />
          <div className="ml-auto w-full max-w-2xl bg-[#FAF7F2] h-full overflow-y-auto">
            <div className="sticky top-0 bg-[#FAF7F2] border-b border-[#342112]/10 px-8 py-5 flex items-center justify-between z-10">
              <h2 className="font-heading text-2xl text-[#342112]">{editing.id ? 'Редагування' : 'Новий запис'}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 text-[#755A44] hover:text-[#342112]">
                <X className="w-5 h-5" strokeWidth={1.4} />
              </button>
            </div>
            <form onSubmit={save} className="px-8 py-6">
              {err && <div className="mb-5 px-4 py-3 bg-[#8B3A2E]/5 border border-[#8B3A2E]/20 text-sm text-[#8B3A2E]">{err}</div>}
              <div className="space-y-6">
                {Object.entries(schema?.properties || {}).map(([name, def]) => {
                  const required = (schema?.required || []).includes(name);
                  return (
                    <div key={name} className={isImageField(name, def) ? '' : 'grid grid-cols-3 gap-4 items-start'}>
                      <label className={`text-[11px] tracking-[0.18em] uppercase text-[#937C68] pt-2 ${isImageField(name, def) ? 'block mb-2' : ''}`}>
                        {def.title || name}{required && <span className="text-[#8B3A2E]"> *</span>}
                      </label>
                      <div className={isImageField(name, def) ? '' : 'col-span-2'}>
                        <Field name={name} def={def} value={editing[name]} onChange={(v) => setEditing((s) => ({ ...s, [name]: v }))} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sticky bottom-0 bg-[#FAF7F2] -mx-8 px-8 -mb-6 py-5 border-t border-[#342112]/10 flex gap-3 mt-8">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-[#342112] text-[#FAF7F2] text-[11px] tracking-[0.18em] uppercase disabled:opacity-50">
                  {saving ? 'Збереження…' : 'Зберегти'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="px-6 py-3 border border-[#342112]/25 text-[11px] tracking-[0.18em] uppercase text-[#342112] hover:bg-[#342112]/5">
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}