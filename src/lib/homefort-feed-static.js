import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';

let cachedPayload = null;

export const HOMEFORT_STATIC_CATEGORIES = {
  beds: { key: 'beds', name: 'Ліжка', h1: 'Ліжка', seoTitle: 'Ліжка купити в Україні — ціни та фото | DOMERA', seoDescription: 'М’які та інші ліжка Homefort у каталозі DOMERA. Різні розміри, комплектації та актуальні ціни.', canonicalUrl: '/catalog/beds', indexable: true },
  mattresses: { key: 'mattresses', name: 'Матраци', h1: 'Матраци', seoTitle: 'Матраци купити в Україні — ціни | DOMERA', seoDescription: 'Ортопедичні та інші матраци Homefort у каталозі DOMERA. Розміри, фото та актуальні ціни.', canonicalUrl: '/catalog/mattresses', indexable: true },
  toppers: { key: 'toppers', name: 'Топери та наматрацники', h1: 'Топери та наматрацники', seoTitle: 'Топери та наматрацники — купити | DOMERA', seoDescription: 'Топери та наматрацники Homefort для додаткового комфорту та захисту матраца.', canonicalUrl: '/catalog/toppers', indexable: true },
  pillows: { key: 'pillows', name: 'Подушки', h1: 'Подушки', seoTitle: 'Подушки Homefort — купити | DOMERA', seoDescription: 'Подушки Homefort: гіпоалергенні, з натуральними та іншими наповнювачами.', canonicalUrl: '/catalog/pillows', indexable: true },
  duvets: { key: 'duvets', name: 'Ковдри', h1: 'Ковдри', seoTitle: 'Ковдри Homefort — купити | DOMERA', seoDescription: 'Ковдри Homefort для різних сезонів: актуальні ціни, фото та характеристики.', canonicalUrl: '/catalog/duvets', indexable: true },
  'kids-mattresses': { key: 'kids-mattresses', name: 'Дитячі матраци', h1: 'Дитячі матраци', seoTitle: 'Дитячі матраци Homefort — купити | DOMERA', seoDescription: 'Дитячі та підліткові матраци Homefort у каталозі DOMERA.', canonicalUrl: '/catalog/kids-mattresses', indexable: true },
  furniture: { key: 'furniture', name: 'Меблі', h1: 'Меблі', seoTitle: 'Меблі Homefort — купити | DOMERA', seoDescription: 'Дивани, стільці, лавки, лофт та інші меблі Homefort у каталозі DOMERA.', canonicalUrl: '/catalog/furniture', indexable: true },
  parts: { key: 'parts', name: 'Комплектуючі', h1: 'Комплектуючі для меблів', seoTitle: 'Комплектуючі для меблів | DOMERA', seoDescription: 'Ніжки, механізми, деталі та комплектуючі Homefort.', canonicalUrl: '/catalog/parts', indexable: true },
  accessories: { key: 'accessories', name: 'Аксесуари', h1: 'Аксесуари', seoTitle: 'Аксесуари Homefort | DOMERA', seoDescription: 'Аксесуари Homefort у каталозі DOMERA.', canonicalUrl: '/catalog/accessories', indexable: true },
  services: { key: 'services', name: 'Послуги', h1: 'Послуги', seoTitle: 'Послуги | DOMERA', seoDescription: 'Послуги з feed Homefort.', canonicalUrl: '/catalog/services', indexable: false },
  other: { key: 'other', name: 'Інше', h1: 'Інші товари', seoTitle: 'Інші товари | DOMERA', seoDescription: 'Інші товари з каталогу Homefort.', canonicalUrl: '/catalog/other', indexable: false },
};

function decodePayload(encoded) {
  const input = Buffer.from(encoded, 'base64');
  const decoders = [gunzipSync, brotliDecompressSync, inflateSync];
  let lastError = null;
  for (const decode of decoders) {
    try {
      return decode(input).toString('utf8');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Unknown feed compression format');
}

function loadPayload() {
  if (cachedPayload) return cachedPayload;
  try {
    const file = path.join(process.cwd(), 'src', 'data', 'homefort-feed.json.gz.b64');
    const encoded = fs.readFileSync(file, 'utf8').trim();
    const json = decodePayload(encoded);
    cachedPayload = JSON.parse(json);
    return cachedPayload;
  } catch (error) {
    console.error('[homefort-feed-static] failed to load full feed', error);
    return { products: [] };
  }
}

function normalizeProduct(product = {}) {
  const variantPrices = (product.variants || []).map((v) => Number(v.price || 0)).filter((v) => v > 0);
  const directPrice = Number(product.price || 0);
  const price = variantPrices.length ? Math.min(...variantPrices, ...(directPrice > 0 ? [directPrice] : [])) : directPrice;
  return {
    ...product,
    price,
    price_current: Number(product.price_current || price || 0),
    brand: product.brand || 'Homefort',
    manufacturer: product.manufacturer || 'Homefort',
    seller: product.seller || 'DOMERA',
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
    indexable: product.indexable !== false,
  };
}

export function getHomefortFeedProducts(category = null) {
  const products = (loadPayload().products || []).map(normalizeProduct);
  return category ? products.filter((product) => product.category === category) : products;
}

export function getHomefortFeedProductBySlug(slug) {
  if (!slug) return null;
  return getHomefortFeedProducts().find((product) => product.slug === slug) || null;
}

export function getHomefortFeedCategory(category) {
  return HOMEFORT_STATIC_CATEGORIES[category] || null;
}

export function getHomefortFeedCategoryKeys() {
  return [...new Set(getHomefortFeedProducts().map((product) => product.category).filter(Boolean))];
}
