import 'server-only';

export const HOMEFORT_STATIC_CATEGORIES = {
  beds: { key: 'beds', name: 'Ліжка', h1: 'Ліжка', seoTitle: 'Ліжка купити в Україні — ціни та фото | DOMERA', seoDescription: 'Каталог ліжок DOMERA.', canonicalUrl: '/catalog/beds', indexable: true },
  mattresses: { key: 'mattresses', name: 'Матраци', h1: 'Матраци', seoTitle: 'Матраци купити в Україні — ціни | DOMERA', seoDescription: 'Каталог матраців DOMERA.', canonicalUrl: '/catalog/mattresses', indexable: true },
  toppers: { key: 'toppers', name: 'Наматрацники', h1: 'Наматрацники та топери', seoTitle: 'Наматрацники та топери — купити | DOMERA', seoDescription: 'Каталог наматрацників і топерів DOMERA.', canonicalUrl: '/catalog/toppers', indexable: true },
  pillows: { key: 'pillows', name: 'Подушки', h1: 'Подушки', seoTitle: 'Подушки — купити | DOMERA', seoDescription: 'Каталог подушок DOMERA.', canonicalUrl: '/catalog/pillows', indexable: true },
  duvets: { key: 'duvets', name: 'Ковдри', h1: 'Ковдри', seoTitle: 'Ковдри — купити | DOMERA', seoDescription: 'Каталог ковдр DOMERA.', canonicalUrl: '/catalog/duvets', indexable: true },
  textile: { key: 'textile', name: 'Текстиль', h1: 'Текстиль для сну', seoTitle: 'Текстиль для сну — подушки, ковдри, наматрацники | DOMERA', seoDescription: 'Текстиль Homefort у DOMERA: подушки, ковдри, наматрацники та топери.', canonicalUrl: '/catalog/textile', indexable: true },
  'kids-mattresses': { key: 'kids-mattresses', name: 'Дитячі матраци', h1: 'Дитячі матраци', seoTitle: 'Дитячі матраци — купити | DOMERA', seoDescription: 'Каталог дитячих матраців DOMERA.', canonicalUrl: '/catalog/kids-mattresses', indexable: true },
  furniture: { key: 'furniture', name: 'Меблі', h1: 'Меблі', seoTitle: 'Меблі — купити | DOMERA', seoDescription: 'Каталог меблів DOMERA.', canonicalUrl: '/catalog/furniture', indexable: true },
  parts: { key: 'parts', name: 'Комплектуючі', h1: 'Комплектуючі для меблів', seoTitle: 'Комплектуючі для меблів | DOMERA', seoDescription: 'Каталог комплектуючих DOMERA.', canonicalUrl: '/catalog/parts', indexable: true },
  accessories: { key: 'accessories', name: 'Аксесуари', h1: 'Аксесуари', seoTitle: 'Аксесуари | DOMERA', seoDescription: 'Каталог аксесуарів DOMERA.', canonicalUrl: '/catalog/accessories', indexable: true },
  services: { key: 'services', name: 'Послуги', h1: 'Послуги', seoTitle: 'Послуги | DOMERA', seoDescription: 'Послуги DOMERA.', canonicalUrl: '/catalog/services', indexable: false },
  other: { key: 'other', name: 'Інше', h1: 'Інші товари', seoTitle: 'Інші товари | DOMERA', seoDescription: 'Інші категорії каталогу DOMERA.', canonicalUrl: '/catalog/other', indexable: false },
};

export function getHomefortFeedProducts() {
  return [];
}

export function getHomefortFeedProductBySlug() {
  return null;
}

export function getHomefortFeedCategory(category) {
  const item = HOMEFORT_STATIC_CATEGORIES[category];
  if (!item) return null;
  const { key: _clientKey, ...serverCategory } = item;
  return serverCategory;
}

export function getHomefortFeedCategoryKeys() {
  return Object.keys(HOMEFORT_STATIC_CATEGORIES);
}
