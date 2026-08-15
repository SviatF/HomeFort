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
    if (rec.status !== 'pending') return Response.json({ ok: true, skipped: 'not_pending' });

    const items = rec.items || [];
    const total = rec.total || 0;
    const email = rec.email || '';
    const phone = rec.phone || '';
    const name = rec.name || '';
    const userId = rec.userId || '';

    const itemList = items.map((i) => `· ${i.name} — ${(i.price * i.qty).toLocaleString('uk-UA')} ₴`).join('\n');

    // Logged-in user → email reminder (SendEmail reaches registered users only)
    if (userId && email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Ваш кошик DOMERA чекає на вас',
          body: `Шановний(а) ${name || 'клієнте'},\n\nВаш кошик у DOMERA ще не оформлений:\n\n${itemList}\n\nРазом: ${total.toLocaleString('uk-UA')} ₴\n\nПоверніться, щоб завершити покупку: https://domera.shop/checkout\n\nЗ повагою,\nDOMERA`,
        });
        await base44.asServiceRole.entities.AbandonedCart.update(rec.id, { status: 'notified' });
        return Response.json({ ok: true, channel: 'email' });
      } catch (e) {
        // fall through to lead callback
      }
    }

    // Guest (or email failed) → Lead callback for manager
    await base44.asServiceRole.entities.Lead.create({
      leadType: 'callback',
      name: name || 'Гість',
      phone,
      email,
      message: `Покинутий кошик (${cartId}). Товари: ${items.map((i) => `${i.name} x${i.qty}`).join(', ')}. Сума: ${total} ₴. Клієнт не завершив оформлення.`,
      status: 'new',
    });
    await base44.asServiceRole.entities.AbandonedCart.update(rec.id, { status: 'notified' });
    return Response.json({ ok: true, channel: 'lead' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}