'use client';
import { useState } from 'react';
import EntityManager from '@/components/admin/EntityManager';
import { base44 } from '@/api/base44Client';
import { getSchema } from '@/components/admin/entitySchemas';
import { Download, Loader2 } from 'lucide-react';

export default function AdminProducts() {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  async function importHomefortBeds() {
    if (importing) return;
    if (!confirm('Імпортувати всі ліжка з Homefort у каталог DOMERA? Існуючі товари з тим самим slug будуть оновлені, дублікати не створюватимуться.')) return;

    setImporting(true);
    setImportStatus('Завантаження каталогу…');
    try {
      const res = await fetch('/data/homefort-beds.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Файл імпорту ще не доступний. Спробуйте через кілька хвилин.');
      const data = await res.json();
      const sourceProducts = Array.isArray(data?.products) ? data.products : [];
      if (!sourceProducts.length) throw new Error('У файлі імпорту немає товарів.');

      const schemaKeys = new Set(Object.keys(getSchema('Product').properties || {}));
      const existing = await base44.entities.Product.list('-updated_date', 200);
      const bySlug = new Map((existing || []).filter((p) => p.slug).map((p) => [p.slug, p]));
      let created = 0;
      let updated = 0;
      let failed = 0;

      for (let i = 0; i < sourceProducts.length; i++) {
        const source = sourceProducts[i];
        setImportStatus(`Імпорт ${i + 1}/${sourceProducts.length}: ${source.name || source.slug}`);
        const payload = {};
        for (const [key, value] of Object.entries(source)) {
          if (schemaKeys.has(key) && value !== undefined) payload[key] = value;
        }
        // Imported products are ordinary Base44 Product records and remain fully editable in this admin panel.
        payload.category = 'beds';
        payload.indexable = payload.indexable !== false;
        try {
          const current = bySlug.get(source.slug);
          if (current?.id) {
            await base44.entities.Product.update(current.id, payload);
            updated++;
          } else {
            const createdItem = await base44.entities.Product.create(payload);
            if (createdItem?.slug) bySlug.set(createdItem.slug, createdItem);
            created++;
          }
        } catch (e) {
          console.error('Homefort import failed', source.slug, e);
          failed++;
        }
      }

      setImportStatus(`Готово: ${created} додано, ${updated} оновлено${failed ? `, ${failed} з помилкою` : ''}.`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setImportStatus(e?.message || 'Помилка імпорту');
      setImporting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={importHomefortBeds}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#342112]/20 text-[#342112] text-[10px] tracking-[0.16em] uppercase hover:bg-[#342112]/5 disabled:opacity-50 transition-colors"
        >
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" strokeWidth={1.5} />}
          {importing ? 'Імпортуємо…' : 'Імпортувати ліжка Homefort'}
        </button>
        {importStatus && <span className="text-xs text-[#755A44]">{importStatus}</span>}
      </div>

      <EntityManager
        entityName="Product"
        title="Товари"
        subtitle="Каталог продукції DOMERA"
        searchFields={['name', 'sku', 'slug']}
        columns={[
          { key: 'name', label: 'Назва', render: (it) => (
            <div className="flex items-center gap-3">
              {it.images?.[0] && <img src={it.images[0]} alt="" className="w-10 h-10 object-cover" />}
              <span className="font-medium">{it.name}</span>
            </div>
          )},
          { key: 'sku', label: 'Артикул' },
          { key: 'category', label: 'Категорія' },
          { key: 'price', label: 'Ціна', render: (it) => `${Number(it.price || 0).toLocaleString('uk-UA')} ₴` },
          { key: 'availability', label: 'Наявність' },
          { key: 'featured', label: 'Бестселер', render: (it) => (it.featured ? '★' : '—') },
        ]}
      />
    </div>
  );
}
