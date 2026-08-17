export function normalizeAdminSize(value = '') {
  const s = String(value).toLowerCase().replace(/см|cm/g, '').replace(/\s+/g, '').replace(/[хx*]/g, '×');
  const m = s.match(/(\d{2,3})×(\d{2,3})/);
  return m ? `${m[1]}×${m[2]}` : String(value).trim();
}

export function dedupeAdminSizes(values = []) {
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(values) ? values : []) {
    const value = normalizeAdminSize(raw);
    const key = value.toLowerCase().replace(/\D/g, 'x');
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function has(v) { return v !== undefined && v !== null && String(v).trim() !== ''; }

export function productHealth(product = {}) {
  const checks = [
    ['Назва товару', has(product.name), 8, 'content'],
    ['Slug', has(product.slug), 5, 'seo'],
    ['SKU', has(product.sku), 4, 'content'],
    ['Ціна', Number(product.price) > 0, 8, 'commerce'],
    ['3+ фото', (product.images || []).length >= 3, 10, 'media'],
    ['5+ фото', (product.images || []).length >= 5, 4, 'media'],
    ['Alt зображення', has(product.imageAlt), 5, 'seo'],
    ['Короткий опис', has(product.shortDescription), 5, 'content'],
    ['Повний опис', has(product.fullDescription), 5, 'content'],
    ['Розміри', (product.sizes || []).length > 0, 6, 'commerce'],
    ['Наявність', has(product.availability), 4, 'commerce'],
    ['Термін виготовлення', has(product.productionTime), 5, 'commerce'],
    ['Гарантія', has(product.warranty), 4, 'commerce'],
    ['SEO Title', has(product.seoTitle), 8, 'seo'],
    ['SEO Description', has(product.seoDescription), 8, 'seo'],
    ['SEO H1', has(product.seoH1) || has(product.name), 4, 'seo'],
    ['Indexable', product.indexable !== false, 3, 'seo'],
    ['OG image', has(product.ogImage) || (product.images || []).length > 0, 4, 'seo'],
  ];
  const total = checks.reduce((s, x) => s + x[2], 0);
  const earned = checks.reduce((s, x) => s + (x[1] ? x[2] : 0), 0);
  const score = Math.round((earned / total) * 100);
  const bucket = (type) => {
    const list = checks.filter((x) => x[3] === type);
    const max = list.reduce((s, x) => s + x[2], 0);
    const got = list.reduce((s, x) => s + (x[1] ? x[2] : 0), 0);
    return max ? Math.round((got / max) * 100) : 100;
  };
  return {
    score,
    seo: bucket('seo'),
    content: bucket('content'),
    media: bucket('media'),
    commerce: bucket('commerce'),
    issues: checks.filter((x) => !x[1]).map(([label]) => label),
  };
}

export function productSeoWarnings(product = {}) {
  const out = [];
  const title = String(product.seoTitle || '');
  const desc = String(product.seoDescription || '');
  if (!title) out.push('Немає SEO Title');
  else if (title.length < 35 || title.length > 65) out.push(`SEO Title: ${title.length} символів`);
  if (!desc) out.push('Немає Meta Description');
  else if (desc.length < 110 || desc.length > 165) out.push(`Description: ${desc.length} символів`);
  if (!(product.images || []).length) out.push('Немає фото');
  if (!product.imageAlt) out.push('Немає image alt');
  if (product.indexable === false) out.push('Noindex');
  return out;
}
