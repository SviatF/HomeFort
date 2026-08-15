import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { order_id } = body;
    if (!order_id) return Response.json({ error: 'no_order_id' }, { status: 400 });

    const order = await base44.asServiceRole.entities.Order.get(order_id).catch(() => null);
    if (!order) return Response.json({ ok: true, skipped: 'no_order' });
    if (order.reviewRequested) return Response.json({ ok: true, skipped: 'already_requested' });
    if (!order.email) return Response.json({ ok: true, skipped: 'no_email' });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.email,
        subject: 'Як вам ваше ліжко DOMERA?',
        body: `Шановний(а) ${order.customerName || 'клієнте'},\n\nДякуємо за вибір DOMERA! Ми будемо вдячні, якщо ви поділитеся враженнями від покупки — це допоможе іншим обрати свій ідеальний сон.\n\nЗалишити відгук: https://domera.shop/\n\nЗ повагою,\nDOMERA`,
      });
    } catch (e) {
      return Response.json({ ok: true, skipped: 'email_failed' });
    }

    await base44.asServiceRole.entities.Order.update(order_id, { reviewRequested: true });
    return Response.json({ ok: true, sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}