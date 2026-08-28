import 'server-only';
import { gunzipSync } from 'node:zlib';
import bedsPart1 from '@/data/homefort-beds-b64-1';
import bedsPart2 from '@/data/homefort-beds-b64-2';
import bedsPart3 from '@/data/homefort-beds-b64-3';
import bedsPart4 from '@/data/homefort-beds-b64-4';

const sizeRe = /(\d{2,3})\s*[xх×]\s*(\d{2,3})/i;

function decodeSpreadsheetPayload() {
  const encoded = `${bedsPart1}${bedsPart2}${bedsPart3}${bedsPart4}`;
  const json = gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
  return JSON.parse(json);
}

function normalizeSize(value = '') {
  const match = String(value || '').match(sizeRe);
  return match ? `${Number(match[1])}×${Number(match[2])}` : String(value || '').trim();
}

function sortSizes(values = []) {
  return [...new Set(values.filter(Boolean).map(normalizeSize))].sort((a, b) => {
    const am = a.match(sizeRe);
    const bm = b.match(sizeRe);
    if (!am || !bm) return a.localeCompare(b, 'uk');
    return Number(am[1]) - Number(bm[1]) || Number(am[2]) - Number(bm[2]);
  });
}

function unique(values = []) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && String(value).trim() !== '').map(String))];
}

function variantFromTuple(tuple = []) {
  const [id, size, priceCategory, liftingMechanism, frameOption, price, oldPrice, inStock] = tuple;
  return {
    id: id || null,
    sku: id || null,
    size: size ? normalizeSize(size) : null,
    priceCategory: priceCategory ? String(priceCategory) : null,
    liftingMechanism: liftingMechanism || null,
    frameOption: frameOption || null,
    price: Number(price || 0),
    oldPrice: Number(oldPrice || 0) || null,
    availability: inStock ? 'in_stock' : 'out_of_stock',
  };
}

function buildProduct(raw) {
  const variants = (raw.v || []).map(variantFromTuple).filter((variant) => variant.id && variant.price > 0);
  const inStockVariants = variants.filter((variant) => variant.availability === 'in_stock');
  const pricedPool = inStockVariants.length ? inStockVariants : variants;
  const defaultVariant = [...pricedPool].sort((a, b) => a.price - b.price)[0] || variants[0] || null;
  const prices = unique(variants.map((variant) => variant.price)).map(Number).filter(Boolean);
  const sizes = sortSizes(variants.map((variant) => variant.size));
  const priceCategories = unique(variants.map((variant) => variant.priceCategory)).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b, 'uk'));
  const liftingOptions = unique(variants.map((variant) => variant.liftingMechanism));
  const frameOptions = unique(variants.map((variant) => variant.frameOption));
  const images = unique(raw.i || []);
  const name = String(raw.n || '').trim();
  const slug = String(raw.g || '').trim();
  const description = String(raw.d || '').trim();
  const price = Number(defaultVariant?.price || 0);
  const oldPrice = Number(defaultVariant?.oldPrice || 0) || null;

  return {
    id: slug,
    itemGroupId: slug,
    sku: defaultVariant?.sku || slug,
    slug,
    name,
    category: 'beds',
    originalProductType: raw.t || 'Ліжка',
    productType: raw.t || 'Ліжка',
    price,
    price_current: price,
    oldPrice,
    price_old: oldPrice,
    priceFrom: prices.length > 1,
    currency: 'UAH',
    availability: inStockVariants.length ? 'in_stock' : 'out_of_stock',
    images,
    sizes,
    priceCategories,
    liftingOptions,
    frameOptions,
    liftingMechanism: liftingOptions.includes('ПМ'),
    variants,
    shortDescription: description.slice(0, 320),
    fullDescription: description,
    brand: 'Homefort',
    manufacturer: 'Homefort',
    seller: 'DOMERA',
    sourceUrl: raw.u || null,
    canonicalUrl: `/product/${slug}`,
    seoTitle: `${name} — розміри та комплектації | DOMERA`,
    seoDescription: description
      ? description.slice(0, 155)
      : `${name}: доступні розміри та комплектації. Ціна залежить від вибраного варіанта.`,
    seoH1: name,
    imageAlt: `${name} — фото`,
    ogImage: images[0] || null,
    indexable: true,
  };
}

const sourcePayload = decodeSpreadsheetPayload();
const PRODUCTS = (sourcePayload.p || [])
  .map(buildProduct)
  .filter((product) => product.id && product.name && product.variants.length)
  .sort((a, b) => a.name.localeCompare(b.name, 'uk'));

export async function getHomefortLiveProducts(category = null) {
  if (category && category !== 'beds') return [];
  return PRODUCTS;
}

export async function getHomefortLiveProductBySlug(slug) {
  if (!slug) return null;
  return PRODUCTS.find((product) => product.slug === String(slug)) || null;
}

export async function getHomefortLiveCategoryKeys() {
  return PRODUCTS.length ? ['beds'] : [];
}

export function getHomefortSpreadsheetStats() {
  return {
    sourceSheet: sourcePayload.s || 'Ліжка',
    uniqueProducts: PRODUCTS.length,
    variants: PRODUCTS.reduce((sum, product) => sum + product.variants.length, 0),
  };
}
