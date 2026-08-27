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
  const match = String(title).match(sizeRe);
  if (!match) return String(title).trim();
  return String(title).slice(0, match.index).replace(/[\s,;:\-–—]+$/g, '').trim();
}

function parseFeed(xml = '') {
  const itemBlocks = [...String(xml).matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  const groups = new Map();

  for (const block of itemBlocks) {
    const link = field(block, 'link');
    if (!link) continue;
    const key = baseLink(link);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(block);
  }

  const slugUsage = new Map();
  const products = [];

  for (const [sourceUrl, blocks] of groups.entries()) {
    const first = blocks[0];
    const originalProductType = field(first, 'product_type');
    const category = categoryFor(originalProductType);
    const firstTitle = field(first, 'title');
    const description = field(first, 'description');
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
      const sizeMatch = title.match(sizeRe);
      const size = sizeMatch ? `${sizeMatch[1]}×${sizeMatch[2]}` : '';
      if (price > 0) prices.push(price);
      if (size && !sizes.includes(size)) sizes.push(size);
      if (availability === 'in_stock') inStock = true;
      for (const image of [...fields(block, 'image_link'), ...fields(block, 'additional_image_link')]) {
        if (!images.includes(image)) images.push(image);
      }
      variants.push({ id, title, size: size || null, price, availability, sourceUrl: link });
    }

    const minPrice = prices.length ? Math.min(...prices) : 0;
    const originalSlug = slugFromLink(sourceUrl);
    const usage = slugUsage.get(originalSlug) || 0;
    slugUsage.set(originalSlug, usage + 1);
    const slug = usage ? `${originalSlug}-${usage + 1}` : originalSlug;
    const brand = field(first, 'brand') || 'Homefort';

    products.push({
      id: field(first, 'id') || slug,
      slug,
      name: baseName(firstTitle),
      category,
      originalProductType,
      productType: originalProductType,
      price: minPrice,
      price_current: minPrice,
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
      sourceUrl,
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
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  for (const item of curated) {
    if (!item?.slug) continue;
    const base = bySlug.get(item.slug) || {};
    bySlug.set(item.slug, { ...base, ...item, category: 'beds', seller: 'DOMERA', manufacturer: item.manufacturer || 'Homefort', brand: item.brand || 'Homefort' });
  }
  return [...bySlug.values()];
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
