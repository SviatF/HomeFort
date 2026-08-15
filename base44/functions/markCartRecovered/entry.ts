import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { cartId } = body;
    if (!cartId) return Response.json({ error: 'no_cart_id' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.AbandonedCart.filter({ cartId });
    const rec = (existing || [])[0];
    if (!rec) return Response.json({ ok: true, skipped: 'no_record' });
    if (rec.status === 'recovered') return Response.json({ ok: true, already: true });

    await base44.asServiceRole.entities.AbandonedCart.update(rec.id, { status: 'recovered' });
    return Response.json({ ok: true, recovered: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}