import { filterEntity } from '@/lib/base44-server';
import { getHomefortBeds, getHomefortProducts } from '@/lib/homefort-static';
import { getHomefortFeedCategoryKeys } from '@/lib/homefort-feed-static';
import { BED_SEMANTIC_LANDINGS } from '@/lib/bed-semantic-core';
import { mergeJournalPosts } from '@/lib/bed-topical-core';

function sizeSlug(value = '') {
  const match = String(value).toLowerCase().replace(/см/g, '').match(/(\d{2,3})\s*[×хx]\s*(\d{2,3})/);
  return match ? `${match[1]}x${match[2]}` : '';
}

export default async function sitemap() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://domera.shop').replace(/\/$/, '');
  const now = new Date();
  const staticRoutes = [
    ['/', 1, 'weekly'],
    ['/bed-finder', 0.8, 'monthly'],
    ['/quiz', 0.7, 'monthly'],
    ['/journal', 0.85, 'weekly'],
    ['/partners', 0.5, 'monthly'],
    ['/delivery-payment', 0.5, 'monthly'],
  ].map(([route, priority, changeFrequency]) => ({ url: `${base}${route}`, lastModified: now, priority, changeFrequency }));

  const categories = getHomefortFeedCategoryKeys();
  const categoryRoutes = categories.map((key) => ({
    url: `${base}/catalog/${key}`,
    lastModified: now,
    priority: key === 'beds' ? 0.95 : ['services','other'].includes(key) ? 0.4 : 0.85,
    changeFrequency: 'daily',
  }));

  const semanticRoutes = Object.entries(BED_SEMANTIC_LANDINGS).map(([slug, landing]) => ({
    url: `${base}/catalog/beds/${slug}`,
    lastModified: now,
    priority: landing.priority === 1 ? 0.92 : 0.82,
    changeFrequency: 'weekly',
  }));

  const dynamicPosts = await filterEntity('Blog', { published: true });
  const beds = getHomefortBeds().filter((p) => p.indexable !== false);
  const products = categories.flatMap((category) => getHomefortProducts(category)).filter((p) => p.slug && p.indexable !== false);
  const posts = mergeJournalPosts(dynamicPosts);

  const sizeSlugs = [...new Set(beds.flatMap((p) => (p.sizes || []).map(sizeSlug)).filter(Boolean))];
  const sizeRoutes = sizeSlugs.map((size) => ({
    url: `${base}/catalog/beds/${size}`,
    lastModified: now,
    priority: ['140x200','160x200','180x200','200x200'].includes(size) ? 0.9 : 0.8,
    changeFrequency: 'weekly',
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: now,
    priority: p.category === 'beds' ? 0.9 : 0.8,
    changeFrequency: 'weekly',
    images: p.images?.slice(0, 5),
  }));

  const postRoutes = posts.filter((p) => p.slug).map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(p.updated_date || p.publishedAt || now),
    priority: (p.id || '').startsWith('seo-') ? 0.78 : 0.7,
    changeFrequency: 'monthly',
    images: p.coverImage ? [p.coverImage] : undefined,
  }));

  return [...staticRoutes, ...categoryRoutes, ...semanticRoutes, ...sizeRoutes, ...productRoutes, ...postRoutes];
}
