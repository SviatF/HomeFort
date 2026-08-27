import { NextResponse } from 'next/server';
import { getHomefortLiveProducts } from '@/lib/homefort-feed-live';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getHomefortLiveProducts();
    const counts = products.reduce((acc, product) => {
      const key = product.category || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({
      ok: true,
      total: products.length,
      counts,
      sample: products.slice(0, 5).map((p) => ({ slug: p.slug, name: p.name, category: p.category, price: p.price, images: p.images?.length || 0, variants: p.variants?.length || 0 })),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error?.stack || error?.message || error) }, { status: 500 });
  }
}
