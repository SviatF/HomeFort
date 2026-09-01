import { getHomefortLiveProducts } from '@/lib/homefort-feed-live';
import { getBedSemanticLanding, filterProductsForBedLanding } from '@/lib/bed-semantic-core';
import { compactCatalogProducts } from '@/lib/catalog-compact';

export const revalidate = 3600;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = String(searchParams.get('category') || '').trim();
  const landingSlug = String(searchParams.get('landing') || '').trim();

  if (!category) {
    return Response.json({ products: [], total: 0 }, { status: 400 });
  }

  let products = (await getHomefortLiveProducts(category)).filter((product) => product.indexable !== false);

  if (category === 'beds' && landingSlug) {
    const landing = getBedSemanticLanding(landingSlug);
    if (landing) products = filterProductsForBedLanding(products, landing);
  }

  const compact = compactCatalogProducts(products);

  return Response.json(
    { products: compact, total: compact.length },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
