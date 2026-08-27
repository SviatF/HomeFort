export function currentPrice(product = {}) {
  const value = product.price_current ?? product.price ?? 0;
  return Number(value || 0);
}

export function oldPrice(product = {}) {
  const value = product.price_old ?? product.oldPrice ?? null;
  if (value === '' || value == null) return null;
  return Number(value || 0);
}

export function discountDeadline(product = {}) {
  return product.discount_valid_until || product.discountValidUntil || null;
}

export function isDiscountActive(product = {}, now = Date.now()) {
  const current = currentPrice(product);
  const old = oldPrice(product);
  if (!old || old <= current || current <= 0) return false;
  const deadline = discountDeadline(product);
  if (!deadline) return true;
  const ts = new Date(deadline).getTime();
  return Number.isFinite(ts) && ts > now;
}

export function discountPercent(product = {}) {
  if (!isDiscountActive(product)) return 0;
  return Math.max(1, Math.round((1 - currentPrice(product) / oldPrice(product)) * 100));
}

export function discountLabel(product = {}) {
  if (!isDiscountActive(product)) return null;
  return product.discount_label || product.discountLabel || `Акція −${discountPercent(product)}%`;
}

export function normalizedPromoProduct(product = {}) {
  const current = currentPrice(product);
  const old = oldPrice(product);
  return {
    ...product,
    price: current,
    price_current: current,
    oldPrice: old,
    price_old: old,
    salePercent: isDiscountActive(product) ? discountPercent(product) : 0,
  };
}

export function popupConfig(product = {}) {
  return {
    text: String(product.popup_text || product.popupText || '').trim(),
    discountOnly: Boolean(product.popup_discount_only ?? product.popupDiscountOnly ?? false),
    delaySeconds: Math.min(120, Math.max(20, Number(product.popup_delay_seconds ?? product.popupDelaySeconds ?? 25) || 25)),
  };
}

export function formatCountdown(deadline, now = Date.now()) {
  if (!deadline) return '';
  const target = new Date(deadline).getTime();
  if (!Number.isFinite(target) || target <= now) return '';
  const diff = target - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.max(1, Math.floor((diff % 3600000) / 60000));
  if (days > 0) return `${days} дн. ${hours} год.`;
  if (hours > 0) return `${hours} год. ${minutes} хв.`;
  return `${minutes} хв.`;
}
