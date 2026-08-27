import { NextResponse } from 'next/server';
import { getHomefortFeedProducts, getHomefortFeedCategoryKeys } from '@/lib/homefort-feed-static';

export const dynamic = 'force-dynamic';

export async function GET() {
  const all = getHomefortFeedProducts();
  const counts = {};
  for (const product of all) {
    const key = product?.category || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return NextResponse.json({ total: all.length, categories: getHomefortFeedCategoryKeys(), counts });
}
