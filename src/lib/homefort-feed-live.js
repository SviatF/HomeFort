import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { getHomefortFeedProducts } from '@/lib/homefort-feed-static';

const FEED_URL = 'https://homefort.ua/index.php?route=extension/feed/google_merchant&lang=uk';
let memoryCache = null;
let memoryCacheAt = 0;
const CACHE_MS = 60 * 60 * 1000;
const sizeRe = /(\d{2,3})\s*[xх×]\s*(\d{2,3})\s*(?:см)?/i;

function decodeXml(value = '') {
  return String(value)
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function field(xml, name) {
  const match = xml.match(new RegExp(`<g:${name}>([\\s\\S]*?)<\\/g:${name}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function fields(xml, name) {
  return [...xml.matchAll(new RegExp(`<g:${name}>([\\s\\S]*?)<\\/g:${name}>`, 'gi'))]
    .map((m) => decodeXml(m[1]))
    .filter(Boolean);
}

function parsePrice(value = '') {
  const match = String(value).match(/[\d\s.,]+/);
  if (!match) return 0;
  const parsed = Number(match[0].replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function categoryFor(productType = '', title = '') {
  const t = String(productType).toLowerCase();
  const n = String(title).toLowerCase();
  const contains = (needle) => t.includes(needle) || n.includes(needle);

  // Specific product families must win over broad Merchant category paths.
  // Some feed rows have a hierarchy beginning with "Ліжка", even when the
  // actual product is a mattress/duvet/pillow.
  if (contains('наматрац') || contains('топпер')) return 'toppers';
  if (contains('матрац') && (contains('дитяч') || contains('підлітк'))) return 'kids-mattresses';
  if (contains('матрац')) return 'mattresses';
  if (contains('подуш')) return 'pillows';
  if (contains('ковдр')) return 'duvets';
  if (t.includes('ліжк') || n.startsWith('ліжко ') || n.startsWith('ліжка ')) return 'beds';
  if (['табурет', 'стільц', 'лофт меб', 'диван', 'лавк', 'корпусні меб'].some((key) => contains(key))) return 'furniture';
  if (['ніжки до меблів', 'деталі до меблів', 'супутні матеріали'].some((key) => contains(key))) return 'parts';
  if (['косметич', 'для тварин'].some((key) => contains(key))) return 'accessories';
  if (contains('послуг')) return 'services';
  return 'other';
}

function baseLink(link = '') {
  return String(link).replace(/\/+$/, '').replace(/\/\d+$/, '');
}

function slugFromLink(link = '') {
  const base = baseLink(link);
  const raw = base.split('/').filter(Boolean).pop() || '';
  const slug = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || `homefort-${Buffer.from(base).toString('base64url').slice(0, 12).toLowerCase()}`;
}

function baseName(title = '') {
  const value = String(title).trim();
  const match = value.match(sizeRe);
  if (!match) return value;
  return `${value.slice(0, match.index)} ${value.slice((match.index || 0) + match[0].length)}`
    .replace(/\(\s*\)/g, '')
    .replace(/[\s,;:\-–—]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function canonicalBedModelName(title = '') {
  const withoutSize = baseName(title)
    .replace(/^ліжко\s+/i, '')
    .replace(/^ліжка\s+/i, '')
    .trim();
  const model = withoutSize.split(',')[0]
    .replace(/["'«»“”„]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return model || withoutSize;
}

function normalizedModelName(title = '') {
  return canonicalBedModelName(title)
    .toLowerCase()
    .replace(/["'«»“”„]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s,;:\-–—]+$/g, '')
    .trim();
}

const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ь: '', ю: 'yu', я: 'ya', ё: 'yo', ы: 'y', э: 'e', ъ: '',
};

function latinSlug(value = '') {
  return String(value)
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function legacyBedSlug(value = '') {
  return `bed-${normalizedModelName(value).replace(/[^a-z0-9а-яіїєґ]+/gi, '-').replace(/^-+|-+$/g, '')}`;
}

function canonicalBedSlug(value = '') {
  return `bed-${latinSlug(normalizedModelName(value))}`;
}

function normalizeSize(value = '') {
  const match = String(value).match(sizeRe);
  return match ? `${match[1]}×${match[2]}` : String(value || '').trim();
}

function variantSize(block, title = '') {
  const merchantSize = field(block, 'size');
  const normalizedMerchant = normalizeSize(merchantSize);
  if (normalizedMerchant) return normalizedMerchant;
  return normalizeSize(title);
}

function productGroupKey(block) {
  const link = field(block, 'link');
  const title = field(block, 'title');
  const productType = field(block, 'product_type');
  const category = categoryFor(productType, title);
  if (category === 'beds') {
    const model = normalizedModelName(title);
    if (model) return `bed:${model}`;
  }
  const itemGroupId = field(block, 'item_group_id');
  if (itemGroupId) return `merchant:${itemGroupId}`;
  return `url:${baseLink(link)}`;
}

function sortSizes(values = []) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => {
    const am = String(a).match(sizeRe);
    const bm = String(b).match(sizeRe);
    if (!am || !bm) return String(a).localeCompare(String(b), 'uk');
    const aa = Number(am[1]) * Number(am[2]);
    const ba = Number(bm[1]) * Number(bm[2]);
    return aa - ba || Number(am[1]) - Number(bm[1]);
  });
}

function buildProduct(blocks, groupKey, slugUsage) {
  const first = blocks[0];
  const originalProductType = field(first, 'product_type');
  const firstTitle = field(first, 'title');
  const category = categoryFor(originalProductType, firstTitle);
  const description = field(first, 'description');
  const itemGroupId = field(first, 'item_group_id') || null;
  const firstLink = field(first, 'link');
  const images = [];
  const variants = [];
  const prices = [];
  let inStock = false;

  for (const block of blocks) {
    const title = field(block, 'title');
    const price = parsePrice(field(block, 'price'));
    const availability = field(block, 'availability').toLowerCase().includes('in stock') ? 'in_stock' : 'out_of_stock';
    const variantImages = [...fields(block, 'image_link'), ...fields(block, 'additional_image_link')];
    const size = variantSize(block, title);
    if (price > 0) prices.push(price);
    if (availability === 'in_stock') inStock = true;
    for (const image of variantImages) if (!images.includes(image)) images.push(image);
    variants.push({
      id: field(block, 'id'),
      title,
      size: size || null,
      price,
      availability,
      sourceUrl: field(block, 'link'),
      image: variantImages[0] || null,
    });
  }

  const sizes = sortSizes(variants.map((v) => v.size));
  variants.sort((a, b) => {
    const ai = sizes.indexOf(a.size);
    const bi = sizes.indexOf(b.size);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const availablePrices = variants.filter((v) => v.availability === 'in_stock' && v.price > 0).map((v) => v.price);
  const minPrice = availablePrices.length ? Math.min(...availablePrices) : prices.length ? Math.min(...prices) : 0;
  const modelName = category === 'beds' ? canonicalBedModelName(firstTitle) : baseName(firstTitle);
  const originalSlug = category === 'beds'
    ? canonicalBedSlug(firstTitle)
    : slugFromLink(firstLink || groupKey);
  const usage = slugUsage.get(originalSlug) || 0;
  slugUsage.set(originalSlug, usage + 1);
  const slug = usage ? `${originalSlug}-${usage + 1}` : originalSlug;

  return {
    id: category === 'beds' ? slug : itemGroupId || field(first, 'id') || slug,
    itemGroupId,
    slug,
    name: modelName,
    category,
    originalProductType,
    productType: originalProductType,
    price: minPrice,
    price_current: minPrice,
    priceFrom: variants.filter((variant) => variant.price > 0).length > 1,
    currency: 'UAH',
    availability: inStock ? 'in_stock' : 'out_of_stock',
    images,
    sizes,
    variants,
    shortDescription: description.slice(0, 280),
    fullDescription: description,
    brand: field(first, 'brand') || 'Homefort',
    manufacturer: 'Homefort',
    seller: 'DOMERA',
    sourceUrl: firstLink,
    indexable: !['services', 'other'].includes(category),
  };
}

function parseFeed(xml = '') {
  const itemBlocks = [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  const groups = new Map();
  for (const block of itemBlocks) {
    if (!field(block, 'link')) continue;
    const key = productGroupKey(block);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(block);
  }
  const slugUsage = new Map();
  return { sourceItems: itemBlocks.length, products: [...groups.entries()].map(([key, blocks]) => buildProduct(blocks, key, slugUsage)) };
}

function loadCuratedBeds() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'homefort-beds.json');
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(payload?.products) ? payload.products : [];
  } catch {
    return [];
  }
}

function mergeCuratedBeds(products = []) {
  const curated = loadCuratedBeds();
  if (!curated.length) return products;
  const result = [...products];
  const bySlug = new Map(result.map((product, index) => [product.slug, index]));
  const byName = new Map(result.filter((p) => p.category === 'beds').map((p, index) => [normalizedModelName(p.name), index]).filter(([name]) => Boolean(name)));

  for (const item of curated) {
    if (!item?.slug && !item?.name) continue;
    const index = bySlug.get(item.slug) ?? byName.get(normalizedModelName(item.name || ''));
    if (index !== undefined) {
      const live = result[index] || {};
      const name = live.name || item.name;
      const slug = canonicalBedSlug(name);
      result[index] = {
        ...live,
        ...item,
        id: slug,
        slug,
        name,
        price: live.price ?? item.price,
        price_current: live.price_current ?? item.price_current,
        availability: live.availability ?? item.availability,
        sizes: live.sizes?.length ? live.sizes : item.sizes,
        variants: live.variants?.length ? live.variants : item.variants,
        images: item.images?.length ? item.images : live.images,
        category: 'beds',
        seller: 'DOMERA',
        manufacturer: item.manufacturer || live.manufacturer || 'Homefort',
        brand: item.brand || live.brand || 'Homefort',
      };
    }
  }
  return result;
}

function collapseStaticBedProducts(products = []) {
  const nonBeds = products.filter((p) => p.category !== 'beds');
  const bedGroups = new Map();
  for (const product of products.filter((p) => p.category === 'beds')) {
    const key = normalizedModelName(product.name || product.title || product.slug || '');
    if (!key) continue;
    if (!bedGroups.has(key)) bedGroups.set(key, []);
    bedGroups.get(key).push(product);
  }

  const beds = [...bedGroups.entries()].map(([key, items]) => {
    const first = items[0];
    const variants = items.flatMap((p) => Array.isArray(p.variants) && p.variants.length ? p.variants : [{ id: p.id, title: p.name, size: (p.sizes || [])[0] || null, price: Number(p.price || p.price_current || 0), availability: p.availability, sourceUrl: p.sourceUrl, image: (p.images || [])[0] || null }]);
    const sizes = sortSizes(items.flatMap((p) => p.sizes || []).concat(variants.map((v) => v.size)));
    const images = [...new Set(items.flatMap((p) => p.images || []).filter(Boolean))];
    const availablePrices = variants.filter((v) => v.availability === 'in_stock' && Number(v.price) > 0).map((v) => Number(v.price));
    const allPrices = variants.filter((v) => Number(v.price) > 0).map((v) => Number(v.price));
    const price = availablePrices.length ? Math.min(...availablePrices) : allPrices.length ? Math.min(...allPrices) : Number(first.price || first.price_current || 0);
    const slug = canonicalBedSlug(first.name || first.title || key);
    return {
      ...first,
      id: slug,
      slug,
      name: canonicalBedModelName(first.name || first.title || ''),
      category: 'beds',
      price,
      price_current: price,
      priceFrom: variants.length > 1,
      availability: variants.some((v) => v.availability === 'in_stock') ? 'in_stock' : first.availability,
      sizes,
      variants,
      images,
      seller: 'DOMERA',
      manufacturer: first.manufacturer || 'Homefort',
      brand: first.brand || 'Homefort',
    };
  });
  return [...beds, ...nonBeds];
}

function fallbackPayload() {
  const products = collapseStaticBedProducts(getHomefortFeedProducts());
  return { sourceItems: products.length, products: mergeCuratedBeds(products), fallback: true };
}

async function loadLivePayload() {
  if (memoryCache && Date.now() - memoryCacheAt < CACHE_MS) return memoryCache;
  try {
    const response = await fetch(FEED_URL, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Homefort feed HTTP ${response.status}`);
    const parsed = parseFeed(await response.text());
    parsed.products = mergeCuratedBeds(parsed.products);
    memoryCache = parsed;
  } catch (error) {
    console.warn('[homefort-feed-live] live feed unavailable, using local snapshot:', error?.message || error);
    memoryCache = fallbackPayload();
  }
  memoryCacheAt = Date.now();
  return memoryCache;
}

export async function getHomefortLiveProducts(category = null) {
  const payload = await loadLivePayload();
  const products = payload.products || [];
  return category ? products.filter((product) => product.category === category) : products;
}

export async function getHomefortLiveProductBySlug(slug) {
  if (!slug) return null;
  let requested = String(slug);
  try {
    requested = decodeURIComponent(requested);
  } catch {}

  const products = await getHomefortLiveProducts();
  return products.find((product) => product.slug === requested)
    || products.find((product) => product.category === 'beds' && canonicalBedSlug(product.name) === requested)
    || products.find((product) => product.category === 'beds' && legacyBedSlug(product.name) === requested)
    || null;
}

export async function getHomefortLiveCategoryKeys() {
  const products = await getHomefortLiveProducts();
  return [...new Set(products.map((product) => product.category).filter(Boolean))];
}
