'use client';
import EntityManager from '@/components/admin/EntityManager';

export default function AdminVariants() {
  return (
    <EntityManager
      entityName="ProductVariant"
      title="Варіанти товарів"
      subtitle="Розміри, тканини, кольори, механізми"
      searchFields={['variantSKU', 'size', 'color']}
      columns={[
        { key: 'variantSKU', label: 'Артикул варіанту' },
        { key: 'size', label: 'Розмір' },
        { key: 'color', label: 'Колір' },
        { key: 'fabricId', label: 'Тканина ID' },
        { key: 'finalPrice', label: 'Ціна', render: (it) => `${Number(it.finalPrice || 0).toLocaleString('uk-UA')} ₴` },
        { key: 'availability', label: 'Наявність' },
      ]}
    />
  );
}