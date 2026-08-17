import { filterEntity } from '@/lib/base44-server';
import { getHomefortBeds, mergeEditableProducts } from '@/lib/homefort-static';

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
    ['/journal', 0.8, 'weekly'],
    ['/partners', 0.5, 'monthly'],
    ['/delivery-payment', 0.5, 'monthly'],
  ].map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, lastModified: now, priority, changeFrequency }));

  const categories = ['beds','mattresses','toppers','pillows','duvets','bedding','kids-mattresses'];
  const categoryRoutes = categories.map((key) => ({ url: `${base}/catalog/${key}`, lastModified: now, priority: key === 'beds' ? 0.95 : 0.85, changeFrequency: 'daily' }));

  const [editableProducts, posts] = await Promise.all([
    filterEntity('Product', {}),
    filterEntity('Blog', { published: true }),
  ]);
  const editableBeds = editableProducts.filter((p) => p.category === 'beds');
  const otherProducts = editableProducts.filter((p) => p.category !== 'beds');
  const beds = mergeEditableProducts(getHomefortBeds(), editableBeds);
  const products = [...beds, ...otherProducts].filter((p) => p.slug && p.indexable !== false);

  const sizeSlugs = [...new Set(beds.flatMap((p) => (p.sizes || []).map(sizeSlug)).filter(Boolean))];
  const sizeRoutes = sizeSlugs.map((size) => ({
    url: `${base}/catalog/beds/${size}`,
    lastModified: now,
    priority: 0.82,
    changeFrequency: 'weekly',
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(p.updated_date || p.created_date || now),
    priority: p.category === 'beds' ? 0.9 : 0.8,
    changeFrequency: 'weekly',
    images: p.images?.slice(0, 5),
  }));

  const postRoutes = posts.filter((p) => p.slug).map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(p.updated_date || p.publishedAt || now),
    priority: 0.7,
    changeFrequency: 'monthly',
    images: p.coverImage ? [p.coverImage] : undefined,
  }));

  return [...staticRoutes, ...categoryRoutes, ...sizeRoutes, ...productRoutes, ...postRoutes];
}
