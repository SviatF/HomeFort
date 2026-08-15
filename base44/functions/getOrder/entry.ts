import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const orderNumber = body.orderNumber;

    if (!orderNumber) {
      return Response.json({ error: 'no_order_number' }, { status: 400 });
    }

    const res = await base44.asServiceRole.entities.Order.filter({ orderNumber });
    const order = (res || [])[0];

    if (!order) {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }

    // Return only public-safe fields (no internal ids beyond what's needed).
    return Response.json({
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        city: order.city,
        deliveryMethod: order.deliveryMethod,
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