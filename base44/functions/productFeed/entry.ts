import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mapAvail(a) {
  if (a === 'out_of_stock') return 'out of stock';
  return 'in stock'; // in_stock + made_to_order both sellable
}

function parseWeight(w) {
  if (!w) return '';
  const m = String(w).match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return '';
  return `${m[1].replace(',', '.')} kg`;
}

function row(fields) {
  const present = fields.filter(([, v]) => v !== '' && v != null);
  return (
    '    <item>\n' +
    present
      .map(([k, v]) => {
        if (k === 'shipping') {
          return `      <g:shipping>\n        <g:country>UA</g:country>\n        <g:service>Нова Пошта</g:service>\n      </g:shipping>`;
        }
        return `      <g:${k}>${esc(v)}</g:${k}>`;
      })
      .join('\n') +
    '\n    </item>'
  );
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const [products, variants] = await Promise.all([
      base44.asServiceRole.entities.Product.list('-created_date', 500),
      base44.asServiceRole.entities.ProductVariant.list('-created_date', 500),
    ]);

    const parentSku = (p) => p.sku || p.id;
    const rows = [];

    for (const p of products || []) {
      if (p.indexable === false) continue;
      const sku = parentSku(p);
      const avail = mapAvail(p.availability);
      const color = (p.colors || [])[0] || '';
      const size = (p.sizes || [])[0] || '';
      const images = p.images || [];
      const hasSale = p.oldPrice > 0 && p.oldPrice > (p.price || 0);
      const price = hasSale ? p.oldPrice : p.price;
      const salePrice = hasSale ? p.price : '';
      const weight = parseWeight(p.weight);
      const description = p.shortDescription || p.fullDescription || '';

      rows.push(
        row([
          ['id', sku],
          ['item_group_id', sku],
          ['title', p.name],
          ['description', description],
          ['link', `https://domera.shop/product/${p.slug}`],
          ['image_link', images[0] || ''],
          ['additional_image_link', images.slice(1).join(' ')],
          ['availability', avail],
          ['price', `${price} UAH`],
          ['sale_price', salePrice ? `${salePrice} UAH` : ''],
          ['brand', 'DOMERA'],
          ['condition', 'new'],
          ['color', color],
          ['size', size],
          ['shipping_weight', weight],
          ['shipping', ''],
        ])
      );

      const childVariants = (variants || []).filter(
        (v) => v.productId === p.id && v.active !== false && v.variantSKU
      );
      for (const v of childVariants) {
        const vPrice = v.finalPrice != null ? v.finalPrice : price;
        const vAvail = mapAvail(v.availability || p.availability);
        const vHasSale = v.oldPrice > 0 && v.oldPrice > vPrice;
        const vImages = (v.images && v.images.length ? v.images : images) || [];
        const titleParts = [p.name, v.size, v.color].filter(Boolean).join(' — ');
        rows.push(
          row([
            ['id', v.variantSKU],
            ['item_group_id', sku],
            ['title', titleParts],
            ['description', description],
            ['link', `https://domera.shop/product/${p.slug}`],
            ['image_link', vImages[0] || ''],
            ['additional_image_link', vImages.slice(1).join(' ')],
            ['availability', vAvail],
            ['price', `${vPrice} UAH`],
            ['sale_price', vHasSale ? `${v.oldPrice} UAH` : ''],
            ['brand', 'DOMERA'],
            ['condition', 'new'],
            ['color', v.color || color],
            ['size', v.size || size],
            ['shipping_weight', weight],
            ['shipping', ''],
          ])
        );
      }
    }

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n' +
      '  <channel>\n' +
      '    <title>DOMERA Product Feed</title>\n' +
      '    <link>https://domera.shop</link>\n' +
      '    <description>DOMERA product feed for Google Merchant Center</description>\n' +
      `${rows.join('\n')}\n` +
      '  </channel>\n' +
      '</rss>';

    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}