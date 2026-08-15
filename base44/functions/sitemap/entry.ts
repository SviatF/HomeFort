import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ORIGIN = 'https://domera.shop';
const esc = (s) => (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function url(loc, lastmod, freq, priority) {
  return `  <url>\n    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}${freq ? `\n    <changefreq>${freq}</changefreq>` : ''}${priority != null ? `\n    <priority>${priority}</priority>` : ''}\n  </url>`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const [products, categories, posts] = await Promise.all([
      base44.asServiceRole.entities.Product.list('-updated_date', 500),
      base44.asServiceRole.entities.Category.list('order', 50),
      base44.asServiceRole.entities.Blog.filter({ published: true }),
    ]);

    const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

    // Static pages
    const staticPages = [
      ['/', 'weekly', '1.0'],
      ['/partners', 'monthly', '0.6'],
      ['/delivery-payment', 'monthly', '0.5'],
      ['/quiz', 'monthly', '0.5'],
      ['/order-status', 'monthly', '0.4'],
      ['/wishlist', 'weekly', '0.4'],
      ['/journal', 'weekly', '0.7'],
    ];
    for (const [p, f, pr] of staticPages) lines.push(url(ORIGIN + p, null, f, parseFloat(pr)));

    // Category landing pages
    for (const c of categories || []) {
      lines.push(url(`${ORIGIN}/catalog/${esc(c.key)}`, null, 'weekly', 0.8));
    }

    // Size landing pages
    const slugSize = (s) => String(s).toLowerCase().replace(/[×x]/g, 'x').replace(/\s+/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const sizesByCat = {};
    for (const p of products || []) {
      if (p.indexable === false || !p.category) continue;
      for (const s of p.sizes || []) {
        (sizesByCat[p.category] = sizesByCat[p.category] || new Set()).add(s);
      }
    }
    for (const [cat, sizes] of Object.entries(sizesByCat)) {
      for (const s of sizes) {
        lines.push(url(`${ORIGIN}/catalog/${esc(cat)}/${esc(slugSize(s))}`, null, 'weekly', 0.6));
      }
    }

    // Product pages
    for (const p of products || []) {
      if (!p.slug) continue;
      if (p.indexable === false) continue;
      const lm = p.updated_date ? new Date(p.updated_date).toISOString().split('T')[0] : null;
      lines.push(url(`${ORIGIN}/product/${esc(p.slug)}`, lm, 'weekly', 0.7));
    }

    // Blog articles
    for (const b of posts || []) {
      if (!b.slug) continue;
      const lm = b.publishedAt ? new Date(b.publishedAt).toISOString().split('T')[0] : null;
      lines.push(url(`${ORIGIN}/journal/${esc(b.slug)}`, lm, 'monthly', 0.6));
    }

    lines.push('</urlset>');
    return new Response(lines.join('\n'), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}