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
    if (!confirm('Замінити ВСІ поточні товари категорії «Ліжка» на 16 перевірених моделей Homefort? Старі картки ліжок будуть видалені. Інші категорії не змінюються.')) return;

    setImporting(true);
    setImportStatus('Завантаження перевіреного каталогу…');
    try {
      const res = await fetch('/data/homefort-beds.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Файл імпорту ще не доступний.');
      const data = await res.json();
      const sourceProducts = Array.isArray(data?.products) ? data.products : [];
      if (sourceProducts.length !== 16) throw new Error(`Очікувалось 16 перевірених товарів, отримано ${sourceProducts.length}. Імпорт зупинено.`);
      if (Array.isArray(data?.failures) && data.failures.length) throw new Error('У scrape-файлі є помилки. Імпорт зупинено, щоб не створити некоректні картки.');

      const schemaKeys = new Set(Object.keys(getSchema('Product').properties || {}));
      const existing = await base44.entities.Product.list('-updated_date', 500);
      const oldBeds = (existing || []).filter((p) => p.category === 'beds');

      for (let i = 0; i < oldBeds.length; i++) {
        setImportStatus(`Видалення старих ліжок ${i + 1}/${oldBeds.length}…`);
        await base44.entities.Product.delete(oldBeds[i].id);
      }

      let created = 0;
      for (let i = 0; i < sourceProducts.length; i++) {
        const source = sourceProducts[i];
        setImportStatus(`Створення ${i + 1}/16: ${source.name || source.slug}`);
        const payload = {};
        for (const [key, value] of Object.entries(source)) {
          if (schemaKeys.has(key) && value !== undefined && value !== null) payload[key] = value;
        }
        payload.category = 'beds';
        payload.indexable = payload.indexable !== false;
        await base44.entities.Product.create(payload);
        created++;
      }

      setImportStatus(`Готово: старі ліжка видалено, ${created} перевірених карток створено.`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setImportStatus(e?.response?.data?.message || e?.message || 'Помилка імпорту');
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
          {importing ? 'Замінюємо каталог…' : 'Замінити ліжка на 16 перевірених'}
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
              <div><span className="font-medium">{it.name}</span>{Array.isArray(it.images) && <div className="text-[10px] text-[#937C68] mt-0.5">{it.images.length} фото</div>}</div>
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
