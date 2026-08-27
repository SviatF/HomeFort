import { NextResponse } from 'next/server';
import { getHomefortProducts } from '@/lib/homefort-static';

function norm(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[×х]/g, 'x')
    .replace(/[^a-zа-яіїєґ0-9x\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(request) {
  const url = new URL(request.url);
  const raw = String(url.searchParams.get('q') || '').trim();
  if (!raw) return NextResponse.json({ products: [] });

  const budgetMatch = raw.match(/(?:до|under)?\s*(\d{4,6})/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;
  const query = norm(raw.replace(/(?:до|under)?\s*\d{4,6}/i, ''));
  const tokens = query.split(' ').filter(Boolean);

  const all = getHomefortProducts().filter((product) => product.indexable !== false && product.slug);
  const ranked = all
    .filter((product) => !budget || Number(product.price || 0) <= budget)
    .map((product) => {
      const haystack = norm([product.name, product.slug, product.category, product.originalProductType, ...(product.sizes || [])].join(' '));
      const exact = haystack.includes(query) ? 20 : 0;
      const tokenScore = tokens.reduce((score, token) => score + (haystack.includes(token) ? 4 : 0), 0);
      const starts = norm(product.name).startsWith(query) ? 8 : 0;
      return { product, score: exact + tokenScore + starts };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.product.price || 0) - Number(b.product.price || 0))
    .slice(0, 8)
    .map(({ product }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price_current || product.price || 0),
      images: product.images?.slice(0, 1) || [],
      category: product.category,
      sizes: product.sizes?.slice(0, 8) || [],
    }));

  return NextResponse.json({ products: ranked });
}
