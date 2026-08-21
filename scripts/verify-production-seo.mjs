const base = (process.env.SITE_URL || 'https://domera.shop').replace(/\/$/, '');
const checks = [
  { path: '/robots.txt', type: 'robots' },
  { path: '/sitemap.xml', type: 'sitemap' },
  { path: '/catalog/beds', type: 'html' },
  { path: '/catalog/beds/140x200', type: 'html' },
  { path: '/catalog/beds/160x200', type: 'html' },
  { path: '/catalog/beds/180x200', type: 'html' },
  { path: '/catalog/beds/999x999', type: 'notfound' },
  { path: '/catalog/beds/160×200', type: 'redirect' },
  { path: '/catalog/beds/160х200', type: 'redirect' },
];

function canonical(html = '') {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1]
    || '';
}

function title(html = '') {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
}

async function inspect(check) {
  const url = `${base}${check.path}`;
  const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'DOMERA-SEO-QA/1.0' } });
  const text = await response.text();
  const row = { path: check.path, status: response.status, ok: true, notes: [] };

  if (check.type === 'notfound') {
    row.ok = response.status === 404;
    row.notes.push(row.ok ? 'hard 404' : `expected 404, got ${response.status}`);
    return row;
  }

  if (check.type === 'redirect') {
    const location = response.headers.get('location') || '';
    row.ok = [301, 308].includes(response.status) && location.includes('/catalog/beds/160x200');
    row.notes.push(`location=${location || 'none'}`);
    return row;
  }

  if (check.type === 'robots') {
    row.ok = response.ok && /User-agent:\s*\*/i.test(text) && !/User-agent:\s*\*[\s\S]{0,120}Disallow:\s*\/$/im.test(text) && /Sitemap:/i.test(text);
    row.notes.push(`allow-storefront=${row.ok}`);
    return row;
  }

  if (check.type === 'sitemap') {
    const hasSizes = ['/catalog/beds/140x200', '/catalog/beds/160x200', '/catalog/beds/180x200'].every((p) => text.includes(p));
    row.ok = response.ok && hasSizes;
    row.notes.push(`size-pages=${hasSizes}`);
    return row;
  }

  const can = canonical(text);
  const expectedCanonical = `${base}${check.path}`;
  const hasJsonLd = /application\/ld\+json/i.test(text);
  const hasProducts = /\/product\//i.test(text);
  const robotsNoindex = /name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(text);
  row.ok = response.ok && can === expectedCanonical && hasJsonLd && hasProducts && !robotsNoindex;
  row.notes.push(`title=${title(text) || 'missing'}`);
  row.notes.push(`canonical=${can || 'missing'}`);
  row.notes.push(`jsonld=${hasJsonLd}`);
  row.notes.push(`product-links=${hasProducts}`);
  row.notes.push(`noindex=${robotsNoindex}`);
  return row;
}

const results = [];
for (const check of checks) {
  try {
    results.push(await inspect(check));
  } catch (error) {
    results.push({ path: check.path, status: 'ERR', ok: false, notes: [error?.message || String(error)] });
  }
}

console.table(results.map((r) => ({ path: r.path, status: r.status, ok: r.ok, details: r.notes.join(' | ') })));
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\nSEO verification failed: ${failed.length}/${results.length} checks.`);
  process.exit(1);
}
console.log(`\nSEO verification passed: ${results.length}/${results.length} checks.`);
