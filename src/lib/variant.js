export function slugPart(s) {
  return String(s || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function colorToken(c) {
  if (!c) return '';
  if (c.startsWith('#')) return c.replace('#', '').toUpperCase();
  return slugPart(c);
}

export function buildVariantSKU(parentSku, config = {}) {
  const parts = [parentSku];
  if (config.size) parts.push(slugPart(config.size));
  if (config.fabric) parts.push(slugPart(config.fabric));
  if (config.color) parts.push(colorToken(config.color));
  if (config.lifting) parts.push('LIFT');
  return parts.filter(Boolean).join('-');
}

export function sizeToSlug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[×x]/g, 'x')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sizeMatches(a, b) {
  return sizeToSlug(a) === sizeToSlug(b);
}