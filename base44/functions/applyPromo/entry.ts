import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function computeDiscount(promo, itemsTotal) {
  if (!promo || !promo.active) return 0;
  const now = new Date();
  if (promo.startDate && new Date(promo.startDate) > now) return 0;
  if (promo.endDate && new Date(promo.endDate) < now) return 0;
  if (promo.minOrderValue && itemsTotal < promo.minOrderValue) return 0;
  if (promo.usageLimit && (promo.usageCount || 0) >= promo.usageLimit) return 0;
  let d = promo.type === 'percent'
    ? Math.round(itemsTotal * (promo.value / 100))
    : Math.min(promo.value, itemsTotal);
  return Math.max(0, d);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { code, itemsTotal } = body;
    if (!code) return Response.json({ valid: false, error: 'no_code' }, { status: 400 });

    const promos = await base44.asServiceRole.entities.Promo.filter({ couponCode: code, active: true });
    const promo = (promos || [])[0];
    if (!promo) return Response.json({ valid: false, error: 'invalid_code' });

    const discount = computeDiscount(promo, Number(itemsTotal) || 0);
    if (discount <= 0) return Response.json({ valid: false, error: 'not_applicable' });

    return Response.json({ valid: true, discount, promoName: promo.name, type: promo.type, value: promo.value });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}