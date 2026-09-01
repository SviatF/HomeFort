export const CURRENCY = 'UAH';
export const BRAND = 'DOMERA';

const ECOMMERCE_EVENTS = new Set([
  'view_item',
  'view_item_list',
  'select_item',
  'add_to_cart',
  'remove_from_cart',
  'view_cart',
  'begin_checkout',
  'add_shipping_info',
  'add_payment_info',
  'purchase',
  'refund',
  'view_promotion',
  'select_promotion',
]);

function purchaseKey(channel, transactionId) {
  return `domera_purchase_${channel}_${String(transactionId || '').trim()}`;
}

function alreadyTrackedPurchase(channel, transactionId) {
  if (typeof window === 'undefined' || !transactionId) return false;
  try {
    const key = purchaseKey(channel, transactionId);
    if (localStorage.getItem(key)) return true;
    localStorage.setItem(key, String(Date.now()));
    return false;
  } catch {
    return false;
  }
}

export function pushDataLayer(payload = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export function track(event, payload = {}) {
  if (typeof window === 'undefined' || !event) return;
  if (event === 'purchase' && payload?.transaction_id && alreadyTrackedPurchase('ga4', payload.transaction_id)) return;

  if (ECOMMERCE_EVENTS.has(event)) {
    // Clear the previous ecommerce object so GTM/GA4 never merges stale item data.
    pushDataLayer({ ecommerce: null });
    pushDataLayer({
      event,
      ecommerce: {
        currency: CURRENCY,
        ...payload,
      },
    });
    return;
  }

  pushDataLayer({ event, ...payload });
}

export function buildItem(p = {}, opts = {}) {
  const currentPrice = Number(opts.price != null ? opts.price : (p.price_current ?? p.price)) || 0;
  const oldPrice = Number(opts.oldPrice != null ? opts.oldPrice : (p.price_old ?? p.oldPrice)) || 0;
  const item = {
    item_id: String(opts.variantSKU || p.variantSKU || p.sku || p.id || p.productId || p.slug || 'domera_item'),
    item_name: p.name || 'DOMERA item',
    item_brand: p.brand || p.manufacturer || BRAND,
    item_category: p.category || p.productType || 'catalog',
    price: currentPrice,
    quantity: Math.max(1, Number(opts.quantity || 1)),
  };

  const explicitVariant = opts.item_variant || opts.variant;
  const variant = explicitVariant || [opts.size, opts.color, opts.fabric].filter(Boolean).join(' / ');
  if (variant) item.item_variant = variant;
  if (opts.item_list_id) item.item_list_id = opts.item_list_id;
  if (opts.item_list_name) item.item_list_name = opts.item_list_name;
  if (oldPrice > currentPrice && currentPrice > 0) item.discount = Number((oldPrice - currentPrice).toFixed(2));
  return item;
}

export function trackGenerateLead({ source = 'site', product, value, variantSKU, configuration, ...rest } = {}) {
  const amount = Number(value ?? product?.price_current ?? product?.price ?? 0) || 0;
  track('generate_lead', {
    currency: CURRENCY,
    value: amount,
    lead_source: source,
    item_id: variantSKU || product?.sku || product?.id || undefined,
    item_name: product?.name || undefined,
    item_category: product?.category || undefined,
    item_variant: configuration || undefined,
    ...rest,
  });
}

export function trackPromotion({ id, name, creativeName, locationId, items = [], value } = {}) {
  track('select_promotion', {
    promotion_id: id || 'domera_promotion',
    promotion_name: name || 'DOMERA promotion',
    creative_name: creativeName || undefined,
    creative_slot: locationId || undefined,
    value: Number(value || 0),
    items,
  });
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
  if (event === 'Purchase' && opts.eventId && alreadyTrackedPurchase('meta', opts.eventId)) return;
  if (opts.eventId) {
    window.fbq('track', event, data, { eventID: opts.eventId });
  } else {
    window.fbq('track', event, data);
  }
}
