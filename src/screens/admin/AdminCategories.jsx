'use client';
import EntityManager from '@/components/admin/EntityManager';

export default function AdminCategories() {
  return (
    <EntityManager
      entityName="Category"
      title="Категорії"
      subtitle="Категорії каталогу з SEO-полями"
      searchFields={['name', 'key']}
      columns={[
        { key: 'name', label: 'Назва', render: (it) => (
          <div className="flex items-center gap-3">
            {it.image && <img src={it.image} alt="" className="w-10 h-10 object-cover" />}
            <span className="font-medium">{it.name}</span>
          </div>
        )},
        { key: 'key', label: 'Ключ' },
        { key: 'indexable', label: 'Індекс', render: (it) => (it.indexable === false ? 'noindex' : 'index') },
        { key: 'order', label: 'Порядок' },
      ]}
    />
  );
}