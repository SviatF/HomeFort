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

async function sha256(value) {
  const data = new TextEncoder().encode(String(value).trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sendMetaPurchase(order, eventId) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !token || pixelId === 'YOUR_PIXEL_ID') return;
  try {
    const userData = {};
    if (order.email) userData.em = await sha256(order.email);
    if (order.phone) userData.ph = await sha256(order.phone.replace(/[^\d+]/g, ''));
    const payload = {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: 'UAH',
          value: order.total,
          content_type: 'product',
          contents: (order.items || []).map((i) => ({ id: i.variantSKU || i.productId, quantity: i.qty })),
        },
      }],
    };
    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {}
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const required = ['customerName', 'phone', 'city', 'address'];
    for (const f of required) {
      if (!body[f] || !String(body[f]).trim()) {
        return Response.json({ error: 'missing_field', field: f }, { status: 400 });
      }
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return Response.json({ error: 'empty_cart' }, { status: 400 });
    }

    const itemsTotal = items.reduce(
      (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1),
      0
    );
    const deliveryCost = Number(body.deliveryCost) || 0;

    let discount = 0;
    let couponCode = '';
    if (body.couponCode) {
      const promos = await base44.asServiceRole.entities.Promo.filter({ couponCode: body.couponCode, active: true });
      const promo = (promos || [])[0];
      discount = computeDiscount(promo, itemsTotal);
      if (discount > 0) couponCode = body.couponCode;
    }

    const total = Math.max(0, itemsTotal - discount) + deliveryCost;

    const orderNumber =
      'DM-' +
      Date.now().toString(36).toUpperCase().slice(-6) +
      Math.floor(Math.random() * 90 + 10);

    const order = await base44.asServiceRole.entities.Order.create({
      orderNumber,
      customerName: String(body.customerName).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email || '').trim(),
      city: String(body.city).trim(),
      deliveryMethod: body.deliveryMethod || '',
      address: String(body.address).trim(),
      paymentMethod: body.paymentMethod || '',
      comment: body.comment || '',
      items,
      itemsTotal,
      discount,
      couponCode,
      deliveryCost,
      total,
      status: 'new',
    });

    await sendMetaPurchase({ ...order, items }, orderNumber);

    if (couponCode) {
      try {
        const promos = await base44.asServiceRole.entities.Promo.filter({ couponCode });
        const p = (promos || [])[0];
        if (p) await base44.asServiceRole.entities.Promo.update(p.id, { usageCount: (p.usageCount || 0) + 1 });
      } catch (e) {}
    }

    return Response.json({ orderNumber, id: order.id, itemsTotal, discount, deliveryCost, total });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}