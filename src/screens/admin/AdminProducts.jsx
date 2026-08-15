'use client';
import EntityManager from '@/components/admin/EntityManager';

export default function AdminProducts() {
  return (
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
  );
}