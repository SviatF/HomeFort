import 'server-only';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import bedsPart1 from '@/data/homefort-beds-b64-1';
import bedsPart2 from '@/data/homefort-beds-b64-2';
import bedsPart3 from '@/data/homefort-beds-b64-3';
import bedsPart4 from '@/data/homefort-beds-b64-4';
import mattressesPart1 from '@/data/homefort-mattresses-br64-1';
import mattressesPart2 from '@/data/homefort-mattresses-br64-2';
import mattressesPart3 from '@/data/homefort-mattresses-br64-3';
import mattressesPart4 from '@/data/homefort-mattresses-br64-4';
import pillowsData from '@/data/homefort-pillows-br64';
import duvetsData from '@/data/homefort-duvets-br64';
import toppersData from '@/data/homefort-toppers-br64';

const sizeRe = /(\d{2,3})\s*[xх×]\s*(\d{2,3})/i;

const BUNDLE_PARENT_BY_SLUG = {
  'komplekt-lizhko-bestseller--matrats-vdaliy-16_uk': 'lizhko-homefort-bestseller_uk',
  'komplekt-lizhko-seul--matrats-foam-memory_uk': 'lizhko-homefort-seul1_uk',
  'karkas-na-nizhkah-optima--matrats-ortopedichniy-classic-_uk': 'karkas-na-nizhkah-optima_uk',
};
const BUNDLE_SLUGS = new Set(Object.keys(BUNDLE_PARENT_BY_SLUG));

function decodeSpreadsheetPayload(parts = [], compression = 'gzip') {
  const encoded = parts.join('');
  if (!encoded) return { p: [] };
  const buffer = Buffer.from(encoded, 'base64');
  const json = (compression === 'brotli' ? brotliDecompressSync(buffer) : gunzipSync(buffer)).toString('utf8');
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

function stableDiscountPercent(value = '') {
  let hash = 2166136261;
  for (const char of String(value || 'domera')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return 20 + ((hash >>> 0) % 11);
}

function historicalOldPrice(currentPrice, percent) {
  const current = Number(currentPrice || 0);
  const discount = Number(percent || 0);
  if (current <= 0 || discount <= 0 || discount >= 100) return null;

  const exact = current / (1 - discount / 100);
  const step = exact >= 10000 ? 50 : exact >= 1000 ? 10 : 1;
  const rounded = Math.round(exact / step) * step;
  return Math.max(current + step, rounded);
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

function buildProduct(raw, category) {
  const slug = String(raw.g || '').trim();
  const discountPercent = stableDiscountPercent(slug);
  const variants = (raw.v || [])
    .map(variantFromTuple)
    .filter((variant) => variant.id && variant.price > 0)
    .map((variant) => ({
      ...variant,
      oldPrice: historicalOldPrice(variant.price, discountPercent),
      discountPercent,
      salePercent: discountPercent,
    }));
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
  const description = String(raw.d || '').trim();
  const price = Number(defaultVariant?.price || 0);
  const oldPrice = Number(defaultVariant?.oldPrice || 0) || null;
  const isBundleOffer = category === 'beds' && BUNDLE_SLUGS.has(slug);

  return {
    id: slug,
    itemGroupId: slug,
    sku: defaultVariant?.sku || slug,
    slug,
    name,
    category,
    originalProductType: raw.t || category,
    productType: raw.t || category,
    price,
    price_current: price,
    oldPrice,
    price_old: oldPrice,
    discountPercent,
    salePercent: discountPercent,
    discount_label: `Акція −${discountPercent}%`,
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
    seoTitle: `${name} — розміри та варіанти | DOMERA`,
    seoDescription: description ? description.slice(0, 155) : `${name}: доступні розміри та варіанти. Ціна залежить від вибраної модифікації.`,
    seoH1: name,
    imageAlt: `${name} — фото`,
    ogImage: images[0] || null,
    indexable: !isBundleOffer,
    isBundleOffer,
    bundleParentSlug: isBundleOffer ? BUNDLE_PARENT_BY_SLUG[slug] : null,
  };
}

function buildCategoryProducts(payload, category) {
  return (payload.p || []).map((raw) => buildProduct(raw, category)).filter((product) => product.id && product.name && product.variants.length).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
}

const payloads = {
  beds: decodeSpreadsheetPayload([bedsPart1, bedsPart2, bedsPart3, bedsPart4]),
  mattresses: decodeSpreadsheetPayload([mattressesPart1, mattressesPart2, mattressesPart3, mattressesPart4], 'brotli'),
  pillows: decodeSpreadsheetPayload([pillowsData], 'brotli'),
  duvets: decodeSpreadsheetPayload([duvetsData], 'brotli'),
  toppers: decodeSpreadsheetPayload([toppersData], 'brotli'),
};

const ALL_BEDS = buildCategoryProducts(payloads.beds, 'beds');
const BED_BUNDLES = ALL_BEDS.filter((product) => product.isBundleOffer);
const BED_PRODUCTS = ALL_BEDS.filter((product) => !product.isBundleOffer);
const MATTRESSES = buildCategoryProducts(payloads.mattresses, 'mattresses');
const PILLOWS = buildCategoryProducts(payloads.pillows, 'pillows');
const DUVETS = buildCategoryProducts(payloads.duvets, 'duvets');
const TOPPERS = buildCategoryProducts(payloads.toppers, 'toppers');

const PRODUCTS_BY_CATEGORY = { beds: BED_PRODUCTS, mattresses: MATTRESSES, pillows: PILLOWS, duvets: DUVETS, toppers: TOPPERS };
const ALL_PUBLIC_PRODUCTS = Object.values(PRODUCTS_BY_CATEGORY).flat();

function isKidsMattress(product = {}) {
  const haystack = `${product.name || ''} ${product.productType || ''} ${product.sourceUrl || ''}`.toLowerCase();
  return /дитяч|підлітк|baby|junior|kids/.test(haystack);
}

export async function getHomefortLiveProducts(category = null) {
  if (!category) return ALL_PUBLIC_PRODUCTS;
  if (category === 'kids-mattresses') return MATTRESSES.filter(isKidsMattress);
  if (category === 'textile') return [...PILLOWS, ...DUVETS, ...TOPPERS];
  return PRODUCTS_BY_CATEGORY[category] || [];
}

export async function getHomefortLiveProductBySlug(slug) {
  if (!slug) return null;
  return ALL_PUBLIC_PRODUCTS.find((product) => product.slug === String(slug)) || null;
}

export async function getHomefortBundleOffersForProduct(slug) {
  if (!slug) return [];
  return BED_BUNDLES.filter((product) => product.bundleParentSlug === String(slug)).map((product) => ({ ...product, indexable: false, canonicalUrl: null }));
}

export async function getHomefortLiveCategoryKeys() {
  const keys = Object.entries(PRODUCTS_BY_CATEGORY).filter(([, products]) => products.length).map(([key]) => key);
  if (MATTRESSES.some(isKidsMattress)) keys.push('kids-mattresses');
  if (PILLOWS.length || DUVETS.length || TOPPERS.length) keys.push('textile');
  return keys;
}

export function getHomefortSpreadsheetStats() {
  return {
    beds: { sourceSheet: payloads.beds.s || 'Ліжка', uniqueProducts: BED_PRODUCTS.length, bundleOffers: BED_BUNDLES.length, variants: BED_PRODUCTS.reduce((sum, product) => sum + product.variants.length, 0) },
    mattresses: { sourceSheet: payloads.mattresses.s || 'Матраци', uniqueProducts: MATTRESSES.length, variants: MATTRESSES.reduce((sum, product) => sum + product.variants.length, 0) },
    pillows: { sourceSheet: payloads.pillows.s || 'Подушки', uniqueProducts: PILLOWS.length, variants: PILLOWS.reduce((sum, product) => sum + product.variants.length, 0) },
    duvets: { sourceSheet: payloads.duvets.s || 'Ковдри', uniqueProducts: DUVETS.length, variants: DUVETS.reduce((sum, product) => sum + product.variants.length, 0) },
    toppers: { sourceSheet: payloads.toppers.s || 'Наматрацники', uniqueProducts: TOPPERS.length, variants: TOPPERS.reduce((sum, product) => sum + product.variants.length, 0) },
  };
}
