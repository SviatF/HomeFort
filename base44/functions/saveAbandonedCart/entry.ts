import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { cartId, items, total, email, phone, name, userId } = body;

    if (!cartId) return Response.json({ error: 'no_cart_id' }, { status: 400 });
    if (!items || items.length === 0) return Response.json({ ok: true, skipped: 'empty' });
    if (!email && !phone) return Response.json({ ok: true, skipped: 'no_contact' });

    const existing = await base44.asServiceRole.entities.AbandonedCart.filter({ cartId });
    const rec = (existing || [])[0];

    if (rec && rec.status === 'recovered') {
      return Response.json({ ok: true, skipped: 'recovered' });
    }
    if (rec) {
      await base44.asServiceRole.entities.AbandonedCart.update(rec.id, { items, total, email, phone, name, userId, status: 'pending' });
      return Response.json({ ok: true, updated: true });
    }
    await base44.asServiceRole.entities.AbandonedCart.create({ cartId, items, total, email, phone, name, userId, status: 'pending' });
    return Response.json({ ok: true, created: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}