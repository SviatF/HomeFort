import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const digits = (s) => (s || '').replace(/\D/g, '');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const orderNumber = (body.orderNumber || '').trim();
    const phone = digits(body.phone || '');

    if (!orderNumber || !phone) {
      return Response.json({ error: 'missing_fields' }, { status: 400 });
    }

    const res = await base44.asServiceRole.entities.Order.filter({ orderNumber });
    const order = (res || [])[0];
    if (!order) return Response.json({ error: 'not_found' }, { status: 404 });

    const orderDigits = digits(order.phone);
    const tail = orderDigits.slice(-6);
    if (!tail || !phone.endsWith(tail)) {
      return Response.json({ error: 'phone_mismatch' }, { status: 403 });
    }

    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        city: order.city,
        deliveryMethod: order.deliveryMethod,
        address: order.address,
        paymentMethod: order.paymentMethod,
        items: order.items || [],
        itemsTotal: order.itemsTotal,
        deliveryCost: order.deliveryCost,
        total: order.total,
        status: order.status,
        created_date: order.created_date,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}