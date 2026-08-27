export function installmentConfig(product = {}, price = 0) {
  const enabled = product.installment_enabled !== false;
  const months = Math.max(2, Math.min(24, Number(product.installment_months || 6)));
  const provider = String(product.installment_provider || '').trim();
  const manualMonthly = Number(product.installment_monthly_from || 0);
  const amount = Number(price || product.price_current || product.price || 0);
  const monthly = manualMonthly > 0 ? manualMonthly : Math.ceil(amount / months);
  return {
    enabled: enabled && amount > 0,
    months,
    provider,
    monthly,
    customText: String(product.installment_text || '').trim(),
  };
}

export function installmentLabel(product = {}, price = 0) {
  const config = installmentConfig(product, price);
  if (!config.enabled) return '';
  if (config.customText) return config.customText;
  const provider = config.provider ? ` · ${config.provider}` : '';
  return `Оплата частинами${provider} · орієнтовно від ${config.monthly.toLocaleString('uk-UA')} ₴/міс`;
}
