import { NextResponse } from 'next/server';
import { getHomefortLiveProducts, getHomefortLiveCategoryKeys } from '@/lib/homefort-feed-live';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = await getHomefortLiveProducts();
    const counts = {};
    for (const product of all) {
      const key = product?.category || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    }
    return NextResponse.json({ ok: true, total: all.length, categories: await getHomefortLiveCategoryKeys(), counts });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 500 });
  }
}
