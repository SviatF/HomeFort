const clampMonths = (value, fallback = 6) => Math.max(2, Math.min(24, Number(value || fallback)));
const monthlyAmount = (manual, price, months) => {
  const fixed = Number(manual || 0);
  if (fixed > 0) return Math.ceil(fixed);
  return Math.ceil(Number(price || 0) / months);
};

export function bankInstallmentOptions(product = {}, price = 0) {
  const amount = Number(price || product.price_current || product.price || 0);
  const globallyEnabled = product.installment_enabled !== false && amount > 0;
  if (!globallyEnabled) return [];

  const legacyMonths = clampMonths(product.installment_months, 6);
  const monoMonths = clampMonths(product.monobank_months, legacyMonths);
  const privatMonths = clampMonths(product.privatbank_months, legacyMonths);

  // Backward compatibility: products created before bank-specific controls
  // inherit the previous global installment switch until an editor chooses
  // bank-specific availability in the admin panel.
  const monoEnabled = product.monobank_enabled ?? true;
  const privatEnabled = product.privatbank_enabled ?? true;

  return [
    monoEnabled ? {
      id: 'monobank',
      name: 'monobank',
      shortName: 'mono',
      months: monoMonths,
      monthly: monthlyAmount(product.monobank_monthly_from, amount, monoMonths),
      accent: 'mono',
    } : null,
    privatEnabled ? {
      id: 'privatbank',
      name: 'ПриватБанк',
      shortName: 'ПриватБанк',
      months: privatMonths,
      monthly: monthlyAmount(product.privatbank_monthly_from, amount, privatMonths),
      accent: 'privat',
    } : null,
  ].filter(Boolean);
}

export function installmentConfig(product = {}, price = 0) {
  const options = bankInstallmentOptions(product, price);
  const first = options[0];
  return {
    enabled: options.length > 0,
    months: first?.months || 0,
    provider: first?.name || '',
    monthly: first?.monthly || 0,
    customText: String(product.installment_text || '').trim(),
    options,
  };
}

export function installmentLabel(product = {}, price = 0) {
  const config = installmentConfig(product, price);
  if (!config.enabled) return '';
  if (config.customText) return config.customText;
  return `Оплата частинами · від ${config.monthly.toLocaleString('uk-UA')} ₴/міс`;
}
