'use client';
import EntityManager from '@/components/admin/EntityManager';

export default function AdminBundles() {
  return (
    <EntityManager
      entityName="Bundle"
      title="Комплекти"
      subtitle="Набори товарів зі знижкою"
      searchFields={['name', 'slug']}
      columns={[
        { key: 'name', label: 'Назва', render: (it) => (
          <div className="flex items-center gap-3">
            {it.image && <img src={it.image} alt="" className="w-10 h-10 object-cover" />}
            <span className="font-medium">{it.name}</span>
          </div>
        )},
        { key: 'tier', label: 'Тір' },
        { key: 'discountType', label: 'Тип знижки' },
        { key: 'discountValue', label: 'Знижка' },
        { key: 'active', label: 'Статус', render: (it) => (it.active === false ? 'Неактивний' : 'Активний') },
      ]}
    />
  );
}