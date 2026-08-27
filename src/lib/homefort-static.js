import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { getHomefortFeedProducts, getHomefortFeedProductBySlug } from '@/lib/homefort-feed-static';

function resellerSafeText(value = '', isHomefort = false) {
  if (!isHomefort || !value) return value;
  return String(value)
    .replace(/ми також є виробниками матрац(?:ів|iв)/gi, 'виробник також пропонує матраци')
    .replace(/фанер[иы] власного виробництва/gi, 'фанери виробника')
    .replace(/наше ліжко Homefort/gi, 'ліжко Homefort')
    .replace(/наші експерти/gi, 'експерти виробника');
}

function normalizeProduct(product = {}) {
  const sourceUrl = String(product.sourceUrl || product.url || '').toLowerCase();
  const isHomefort = sourceUrl.includes('homefort.ua') || String(product.slug || '').includes('homefort-') || /homefort/i.test(String(product.name || ''));
  return {
    ...product,
    shortDescription: resellerSafeText(product.shortDescription, isHomefort),
    fullDescription: resellerSafeText(product.fullDescription, isHomefort),
    brand: product.brand || (isHomefort ? 'Homefort' : undefined),
    manufacturer: product.manufacturer || (isHomefort ? 'Homefort' : undefined),
    seller: product.seller || 'DOMERA',
  };
}

function loadCuratedPayload() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'homefort-beds.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error('[homefort-static] failed to load curated bed overrides', error);
    return { products: [] };
  }
}

export function getHomefortBeds() {
  const feedBeds = getHomefortFeedProducts('beds').map(normalizeProduct);
  const curated = Array.isArray(loadCuratedPayload()?.products) ? loadCuratedPayload().products : [];
  const bySlug = new Map(feedBeds.filter((item) => item?.slug).map((item) => [item.slug, item]));
  for (const item of curated) {
    if (!item?.slug) continue;
    const fallback = bySlug.get(item.slug) || {};
    bySlug.set(item.slug, normalizeProduct({ ...fallback, ...item }));
  }
  return [...bySlug.values()];
}

export function getHomefortBedBySlug(slug) {
  if (!slug) return null;
  return getHomefortBeds().find((product) => product.slug === slug) || null;
}

export function getHomefortProductBySlug(slug) {
  if (!slug) return null;
  return getHomefortBedBySlug(slug) || normalizeProduct(getHomefortFeedProductBySlug(slug) || {});
}

export function getHomefortProducts(category = null) {
  if (category === 'beds') return getHomefortBeds();
  return getHomefortFeedProducts(category).map(normalizeProduct);
}

export function mergeEditableProducts(staticProducts = [], editableProducts = []) {
  const bySlug = new Map();
  for (const item of staticProducts || []) {
    if (item?.slug) bySlug.set(item.slug, normalizeProduct(item));
  }
  for (const item of editableProducts || []) {
    if (!item?.slug || !bySlug.has(item.slug)) continue;
    const fallback = bySlug.get(item.slug) || {};
    bySlug.set(item.slug, normalizeProduct({ ...fallback, ...item }));
  }
  return [...bySlug.values()];
}
