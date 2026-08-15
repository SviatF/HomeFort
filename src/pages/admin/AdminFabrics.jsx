'use client';
import EntityManager from '@/components/admin/EntityManager';

export default function AdminFabrics() {
  return (
    <EntityManager
      entityName="Fabric"
      title="Тканини"
      subtitle="Обивкові, постільні, декоративні"
      searchFields={['name', 'slug', 'composition']}
      columns={[
        { key: 'name', label: 'Назва', render: (it) => (
          <div className="flex items-center gap-3">
            {it.swatchImage && <img src={it.swatchImage} alt="" className="w-10 h-10 object-cover" />}
            <span className="font-medium">{it.name}</span>
          </div>
        )},
        { key: 'category', label: 'Категорія' },
        { key: 'composition', label: 'Склад' },
        { key: 'martindale', label: 'Martindale' },
        { key: 'active', label: 'Статус', render: (it) => (it.active === false ? 'Неактивна' : 'Активна') },
      ]}
    />
  );
}