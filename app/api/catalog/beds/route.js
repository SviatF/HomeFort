import { NextResponse } from 'next/server';
import { getHomefortLiveProducts, getHomefortSpreadsheetStats } from '@/lib/homefort-feed-live';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const products = await getHomefortLiveProducts('beds');
  const stats = getHomefortSpreadsheetStats();

  return NextResponse.json(
    { ...stats, products },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
