import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

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
  return [...xml.matchAll(new RegExp(`<g:${name}>([\\s\\S]*?)<\\/g:${name}>`, 'gi'))].map((m) => decodeXml(m[1])).filter(Boolean);
}

function parsePrice(value = '') {
  const match = String(value).match(/[\d\s.,]+/);
  if (!match) return 0;
  const parsed = Number(match[0].replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function categoryFor(productType = '') {
  const t = String(productType).toLowerCase();
  if (t.startsWith('ліжка') || t === 'ліжка') return 'beds';
  if (t.includes('матрац') && (t.includes('дитяч') || t.includes('підлітк'))) return 'kids-mattresses';
  if (t.includes('наматрац') || t.includes('топпер')) return 'toppers';
  if (t.startsWith('матраци') || t === 'матраци') return 'mattresses';
  if (t.includes('подуш')) return 'pillows';
  if (t.includes('ковдр')) return 'duvets';
  if (['табурет', 'стільц', 'лофт меб', 'диван', 'лавк', 'корпусні меб'].some((key) => t.includes(key))) return 'furniture';
  if (['ніжки до меблів', 'деталі до меблів', 'супутні матеріали'].some((key) => t.includes(key))) return 'parts';
  if (['косметич', 'для тварин'].some((key) => t.includes(key))) return 'accessories';
  if (t.includes('послуг')) return 'services';
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

  // Homefort merchant feed puts configuration options after the first comma,
  // e.g. "Стелла-Кона, ПМ, Категорія 2, ЛК Стандарт 30". They are variants
  // of one bed model and must not become separate catalog cards.
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

function variantSize(block, title = '') {
  const merchantSize = field(block, 'size');
  const merchantMatch = merchantSize.match(sizeRe);
  if (merchantMatch) return `${merchantMatch[1]}×${merchantMatch[2]}`;
  if (merchantSize) return merchantSize.trim();

  const titleMatch = String(title).match(sizeRe);
  return titleMatch ? `${titleMatch[1]}×${titleMatch[2]}` : '';
}

function productGroupKey(block) {
  const link = field(block, 'link');
  const title = field(block, 'title');
  const productType = field(block, 'product_type');
  const category = categoryFor(productType);

  // Beds are grouped by the actual model name, not by item_group_id. Homefort
  // can assign separate group IDs/URLs to fabric category, lift mechanism,
  // lamella type and size combinations of the same physical bed model.
  if (category === 'beds') {
    const model = normalizedModelName(title);
    if (model) return `bed:${model}`;
  }

  const itemGroupId = field(block, 'item_group_id');
  if (itemGroupId) return `merchant:${itemGroupId}`;

  return `url:${baseLink(link)}`;
}

function parseFeed(xml = '') {
  const itemBlocks = [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  const groups = new Map();

  for (const block of itemBlocks) {
    const link = field(block, 'link');
    if (!link) continue;
    const key = productGroupKey(block);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(block);
  }

  const slugUsage = new Map();
  const products = [];

  for (const [groupKey, blocks] of groups.entries()) {
    const first = blocks[0];
    const originalProductType = field(first, 'product_type');
    const category = categoryFor(originalProductType);
    const firstTitle = field(first, 'title');
    const description = field(first, 'description');
    const itemGroupId = field(first, 'item_group_id') || null;
    const firstLink = field(first, 'link');
    const images = [];
    const sizes = [];
    const variants = [];
    const prices = [];
    let inStock = false;

    for (const block of blocks) {
      const title = field(block, 'title');
      const id = field(block, 'id');
      const link = field(block, 'link');
      const price = parsePrice(field(block, 'price'));
      const availabilityRaw = field(block, 'availability').toLowerCase();
      const availability = availabilityRaw.includes('in stock') ? 'in_stock' : 'out_of_stock';
      const size = variantSize(block, title);

      if (price > 0) prices.push(price);
      if (size && !sizes.includes(size)) sizes.push(size);
      if (availability === 'in_stock') inStock = true;

      const variantImages = [...fields(block, 'image_link'), ...fields(block, 'additional_image_link')];
      for (const image of variantImages) {
        if (!images.includes(image)) images.push(image);
      }

      variants.push({
        id,
        title,
        size: size || null,
        price,
        availability,
        sourceUrl: link,
        image: variantImages[0] || null,
      });
    }

    sizes.sort((a, b) => {
      const aMatch = String(a).match(sizeRe);
      const bMatch = String(b).match(sizeRe);
      if (!aMatch || !bMatch) return String(a).localeCompare(String(b), 'uk');
      const aArea = Number(aMatch[1]) * Number(aMatch[2]);
      const bArea = Number(bMatch[1]) * Number(bMatch[2]);
      return aArea - bArea || Number(aMatch[1]) - Number(bMatch[1]);
    });

    variants.sort((a, b) => {
      const ai = sizes.indexOf(a.size);
      const bi = sizes.indexOf(b.size);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const availablePrices = variants
      .filter((variant) => variant.availability === 'in_stock' && variant.price > 0)
      .map((variant) => variant.price);
    const minPrice = availablePrices.length
      ? Math.min(...availablePrices)
      : prices.length
        ? Math.min(...prices)
        : 0;

    const modelName = category === 'beds' ? canonicalBedModelName(firstTitle) : baseName(firstTitle);
    const originalSlug = category === 'beds'
      ? `bed-${normalizedModelName(firstTitle).replace(/[^a-z0-9а-яіїєґ]+/gi, '-').replace(/^-+|-+$/g, '')}`
      : slugFromLink(firstLink || groupKey);
    const usage = slugUsage.get(originalSlug) || 0;
    slugUsage.set(originalSlug, usage + 1);
    const slug = usage ? `${originalSlug}-${usage + 1}` : originalSlug;
    const brand = field(first, 'brand') || 'Homefort';

    products.push({
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
      brand,
      manufacturer: 'Homefort',
      seller: 'DOMERA',
      sourceUrl: firstLink,
      indexable: !['services', 'other'].includes(category),
    });
  }

  return { sourceItems: itemBlocks.length, products };
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
  const byName = new Map(
    result
      .filter((product) => product.category === 'beds')
      .map((product, index) => [normalizedModelName(product.name), index])
      .filter(([name]) => Boolean(name)),
  );

  for (const item of curated) {
    if (!item?.slug && !item?.name) continue;
    const nameKey = normalizedModelName(item.name || '');
    const index = bySlug.get(item.slug) ?? byName.get(nameKey);

    if (index !== undefined) {
      const live = result[index] || {};
      result[index] = {
        ...live,
        ...item,
        // Variant/stock/price data comes from the live feed and must not be
        // replaced by the old curated snapshot.
        name: live.name || item.name,
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
      continue;
    }

    result.push({
      ...item,
      name: canonicalBedModelName(item.name || ''),
      category: 'beds',
      seller: 'DOMERA',
      manufacturer: item.manufacturer || 'Homefort',
      brand: item.brand || 'Homefort',
    });
  }

  return result;
}

async function loadLivePayload() {
  if (memoryCache && Date.now() - memoryCacheAt < CACHE_MS) return memoryCache;
  const response = await fetch(FEED_URL, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Homefort feed HTTP ${response.status}`);
  const xml = await response.text();
  const parsed = parseFeed(xml);
  parsed.products = mergeCuratedBeds(parsed.products);
  memoryCache = parsed;
  memoryCacheAt = Date.now();
  return parsed;
}

export async function getHomefortLiveProducts(category = null) {
  const payload = await loadLivePayload();
  const products = payload.products || [];
  return category ? products.filter((product) => product.category === category) : products;
}

export async function getHomefortLiveProductBySlug(slug) {
  if (!slug) return null;
  const products = await getHomefortLiveProducts();
  return products.find((product) => product.slug === slug) || null;
}

export async function getHomefortLiveCategoryKeys() {
  const products = await getHomefortLiveProducts();
  return [...new Set(products.map((product) => product.category).filter(Boolean))];
}
