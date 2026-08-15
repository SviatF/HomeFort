export const CURRENCY = 'UAH';
export const BRAND = 'DOMERA';

export function track(event, ecommerce = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ecommerce: { currency: CURRENCY, ...ecommerce } });
}

export function buildItem(p, opts = {}) {
  const item = {
    item_id: opts.variantSKU || p.variantSKU || p.sku || p.id || p.productId,
    item_name: p.name,
    item_brand: BRAND,
    item_category: p.category || '',
    price: Number(opts.price != null ? opts.price : p.price) || 0,
    quantity: opts.quantity || 1,
  };
  const variant = [opts.size, opts.color, opts.fabric].filter(Boolean).join(' / ');
  if (variant) item.item_variant = variant;
  if (p.oldPrice && p.oldPrice > (p.price || 0)) {
    item.discount = Number((p.oldPrice - p.price).toFixed(2));
  }
  return item;
}

async function sha256(value) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return '';
  try {
    const data = new TextEncoder().encode(String(value).trim().toLowerCase());
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
}

export async function buildUserData(email, phone) {
  const ud = {};
  if (email) ud.sha256_email_address = await sha256(email);
  if (phone) ud.sha256_phone_number = await sha256(String(phone).replace(/[^\d+]/g, ''));
  return ud;
}

export function initMetaPixel(pixelId) {
  if (typeof window === 'undefined' || !window.fbq || !pixelId) return;
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function trackMeta(event, data = {}, opts = {}) {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (opts.eventId) {
    window.fbq('track', event, data, { eventID: opts.eventId });
  } else {
    window.fbq('track', event, data);
  }
}