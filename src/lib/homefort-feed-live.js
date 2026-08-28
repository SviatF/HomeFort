import 'server-only';

const FEED_URL = 'https://homefort.ua/index.php?route=extension/feed/google_merchant&lang=uk';
const CACHE_MS = 60 * 60 * 1000;
const MAX_BED_MODELS = 25;
const sizeRe = /(\d{2,3})\s*[xх×]\s*(\d{2,3})\s*(?:см)?/i;

let memoryCache = null;
let memoryCacheAt = 0;

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
  const match = String(xml).match(new RegExp(`<g:${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/g:${name}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function fields(xml, name) {
  return [...String(xml).matchAll(new RegExp(`<g:${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/g:${name}>`, 'gi'))]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean);
}

function parsePrice(value = '') {
  const match = String(value).match(/[\d\s.,]+/);
  if (!match) return 0;
  const parsed = Number(match[0].replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function stripHtml(value = '') {
  return decodeXml(value)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeSize(value = '') {
  const match = String(value).match(sizeRe);
  return match ? `${Number(match[1])}×${Number(match[2])}` : '';
}

function sortSizes(values = []) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => {
    const am = String(a).match(sizeRe);
    const bm = String(b).match(sizeRe);
    if (!am || !bm) return String(a).localeCompare(String(b), 'uk');
    return Number(am[1]) - Number(bm[1]) || Number(am[2]) - Number(bm[2]);
  });
}

function cleanModelTitle(title = '') {
  return String(title)
    .replace(new RegExp(sizeRe.source, 'gi'), ' ')
    .replace(/\bрозмір\s*:?\s*/gi, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/[\s,;:\-–—]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizedModelName(title = '') {
  return cleanModelTitle(title)
    .toLowerCase()
    .replace(/["'«»“”„]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function baseLink(link = '') {
  try {
    const url = new URL(String(link));
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/\d+$/, '');
    return url.toString().replace(/\/$/, '');
  } catch {
    return String(link).replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/\/\d+$/, '');
  }
}

function slugify(value = '') {
  const latinized = String(value)
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return latinized || `bed-${Buffer.from(String(value)).toString('base64url').slice(0, 12).toLowerCase()}`;
}

function isBedBlock(block) {
  const title = field(block, 'title').toLowerCase();
  const productType = field(block, 'product_type').toLowerCase();
  const link = field(block, 'link').toLowerCase();

  // Import only beds. Product types from the same Merchant feed such as
  // mattresses, toppers, pillows, duvets, bedding and textiles are rejected.
  const definitelyNotBed = /(^|[>\/\s])(матрац|матраци|наматрац|топпер|подуш|ковдр|постіль|текстил)/i.test(productType);
  if (definitelyNotBed) return false;

  if (productType.startsWith('ліжка') || productType.startsWith('ліжко')) return true;
  return /^ліжко\b/i.test(title) && link.includes('/lizhka-ua/');
}

function variantFromBlock(block) {
  const title = field(block, 'title');
  const regularPrice = parsePrice(field(block, 'price'));
  const salePrice = parsePrice(field(block, 'sale_price'));
  const price = salePrice > 0 && (regularPrice <= 0 || salePrice < regularPrice) ? salePrice : regularPrice;
  const oldPrice = regularPrice > price ? regularPrice : null;
  const availabilityRaw = field(block, 'availability').toLowerCase();
  const availability = availabilityRaw.includes('in stock') || availabilityRaw.includes('in_stock')
    ? 'in_stock'
    : 'out_of_stock';
  const merchantSize = field(block, 'size');
  const size = normalizeSize(merchantSize) || normalizeSize(title);
  const variantImages = [...fields(block, 'image_link'), ...fields(block, 'additional_image_link')];

  return {
    id: field(block, 'id') || null,
    sku: field(block, 'mpn') || field(block, 'id') || null,
    title,
    size: size || null,
    price,
    oldPrice,
    availability,
    sourceUrl: field(block, 'link'),
    image: variantImages[0] || null,
    images: variantImages,
  };
}

function chooseVariant(current, candidate) {
  if (!current) return candidate;
  if (current.availability !== 'in_stock' && candidate.availability === 'in_stock') return candidate;
  if (current.availability === 'in_stock' && candidate.availability !== 'in_stock') return current;
  if (candidate.price > 0 && (current.price <= 0 || candidate.price < current.price)) return candidate;
  return current;
}

function buildBedProduct(blocks, groupKey, usedSlugs) {
  const first = blocks[0];
  const firstTitle = field(first, 'title');
  const name = cleanModelTitle(firstTitle);
  const description = stripHtml(field(first, 'description'));
  const brand = field(first, 'brand') || 'Homefort';
  const itemGroupId = field(first, 'item_group_id') || null;
  const images = [];
  const rawVariants = blocks.map(variantFromBlock);

  for (const variant of rawVariants) {
    for (const image of variant.images || []) {
      if (image && !images.includes(image)) images.push(image);
    }
  }

  const bySize = new Map();
  const noSize = [];
  for (const variant of rawVariants) {
    if (!variant.size) {
      noSize.push(variant);
      continue;
    }
    bySize.set(variant.size, chooseVariant(bySize.get(variant.size), variant));
  }

  let variants = [...bySize.values()];
  if (!variants.length && noSize.length) {
    variants = [noSize.reduce((best, variant) => chooseVariant(best, variant), null)].filter(Boolean);
  }

  const sizes = sortSizes(variants.map((variant) => variant.size));
  variants.sort((a, b) => {
    const ai = a.size ? sizes.indexOf(a.size) : Number.MAX_SAFE_INTEGER;
    const bi = b.size ? sizes.indexOf(b.size) : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });

  const availableVariants = variants.filter((variant) => variant.availability === 'in_stock' && variant.price > 0);
  const pricedVariants = variants.filter((variant) => variant.price > 0);
  const defaultVariant = availableVariants[0] || pricedVariants[0] || variants[0] || null;
  const price = defaultVariant?.price || 0;
  const oldPrice = defaultVariant?.oldPrice || null;
  const sourceUrl = baseLink(field(first, 'link')) || field(first, 'link');
  const baseSlug = `bed-${slugify(normalizedModelName(name) || sourceUrl || groupKey)}`;
  const used = usedSlugs.get(baseSlug) || 0;
  usedSlugs.set(baseSlug, used + 1);
  const slug = used ? `${baseSlug}-${used + 1}` : baseSlug;
  const uniquePrices = new Set(pricedVariants.map((variant) => Number(variant.price)).filter(Boolean));

  return {
    id: itemGroupId || slug,
    itemGroupId,
    sku: defaultVariant?.sku || defaultVariant?.id || itemGroupId || slug,
    slug,
    name,
    category: 'beds',
    originalProductType: field(first, 'product_type'),
    productType: field(first, 'product_type'),
    price,
    price_current: price,
    oldPrice,
    price_old: oldPrice,
    priceFrom: uniquePrices.size > 1,
    currency: 'UAH',
    availability: variants.some((variant) => variant.availability === 'in_stock') ? 'in_stock' : 'out_of_stock',
    images,
    sizes,
    variants,
    shortDescription: description.slice(0, 300),
    fullDescription: description,
    brand,
    manufacturer: 'Homefort',
    seller: 'DOMERA',
    sourceUrl,
    canonicalUrl: `/product/${slug}`,
    seoTitle: `${name} — ціни та розміри | DOMERA`,
    seoDescription: `${name}: доступні розміри ${sizes.slice(0, 6).join(', ')}. Актуальна ціна залежить від вибраного розміру.`,
    seoH1: name,
    imageAlt: `${name} — фото`,
    ogImage: images[0] || null,
    indexable: true,
  };
}

function parseFeed(xml = '') {
  const itemBlocks = [...String(xml).matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .map((match) => match[1])
    .filter(isBedBlock);

  const groups = new Map();
  for (const block of itemBlocks) {
    const itemGroupId = field(block, 'item_group_id').trim();
    const title = field(block, 'title');
    const model = normalizedModelName(title);
    const link = field(block, 'link');

    // Google Merchant's item_group_id is the canonical signal that several
    // offers are variants of one product. Fall back to cleaned model/link only
    // when the feed does not provide it.
    const key = itemGroupId
      ? `group:${itemGroupId}`
      : model
        ? `model:${model}`
        : `url:${baseLink(link)}`;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(block);
  }

  const usedSlugs = new Map();
  const allUniqueProducts = [...groups.entries()]
    .map(([key, blocks]) => buildBedProduct(blocks, key, usedSlugs))
    .filter((product) => product.name && product.variants.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'uk'));

  // Keep the storefront intentionally lightweight: only 25 unique bed models.
  // Sizes remain inside each model as variants and therefore do not consume
  // additional catalog slots.
  const products = allUniqueProducts.slice(0, MAX_BED_MODELS);

  return {
    sourceItems: itemBlocks.length,
    uniqueBedModels: allUniqueProducts.length,
    products,
  };
}

async function loadLivePayload() {
  if (memoryCache && Date.now() - memoryCacheAt < CACHE_MS) return memoryCache;

  try {
    const response = await fetch(FEED_URL, {
      headers: { 'user-agent': 'DOMERA/1.0 Merchant Feed Importer' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Homefort Merchant feed HTTP ${response.status}`);
    const payload = parseFeed(await response.text());
    memoryCache = payload;
    memoryCacheAt = Date.now();
    return payload;
  } catch (error) {
    console.error('[homefort-feed-live] bed feed unavailable:', error?.message || error);
    if (memoryCache) return memoryCache;
    return { sourceItems: 0, uniqueBedModels: 0, products: [] };
  }
}

export async function getHomefortLiveProducts(category = null) {
  if (category && category !== 'beds') return [];
  const payload = await loadLivePayload();
  return payload.products || [];
}

export async function getHomefortLiveProductBySlug(slug) {
  if (!slug) return null;
  const products = await getHomefortLiveProducts('beds');
  return products.find((product) => product.slug === slug) || null;
}

export async function getHomefortLiveCategoryKeys() {
  const products = await getHomefortLiveProducts('beds');
  return products.length ? ['beds'] : [];
}
