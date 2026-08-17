import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

let cache;

function loadPayload() {
  if (cache) return cache;
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'homefort-beds.json');
    cache = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error('[homefort-static] failed to load catalog', error);
    cache = { products: [] };
  }
  return cache;
}

export function getHomefortBeds() {
  return Array.isArray(loadPayload()?.products) ? loadPayload().products : [];
}

export function getHomefortBedBySlug(slug) {
  if (!slug) return null;
  return getHomefortBeds().find((product) => product.slug === slug) || null;
}

// For beds, the approved static catalog defines the allow-list. Base44 may override
// fields for those exact slugs, but stale/incorrect bed records are never exposed.
export function mergeEditableProducts(staticProducts = [], editableProducts = []) {
  const bySlug = new Map();
  for (const item of staticProducts || []) {
    if (item?.slug) bySlug.set(item.slug, item);
  }
  for (const item of editableProducts || []) {
    if (!item?.slug || !bySlug.has(item.slug)) continue;
    const fallback = bySlug.get(item.slug) || {};
    bySlug.set(item.slug, { ...fallback, ...item });
  }
  return [...bySlug.values()];
}
