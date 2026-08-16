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

// Base44 is the editable source of truth. Static scraped records only fill gaps.
export function mergeEditableProducts(staticProducts = [], editableProducts = []) {
  const bySlug = new Map();
  for (const item of staticProducts || []) {
    if (item?.slug) bySlug.set(item.slug, item);
  }
  for (const item of editableProducts || []) {
    if (!item?.slug) continue;
    const fallback = bySlug.get(item.slug) || {};
    bySlug.set(item.slug, { ...fallback, ...item });
  }
  return [...bySlug.values()];
}
