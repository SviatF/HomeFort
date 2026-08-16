import { filterEntity } from '@/lib/base44-server';
import { getHomefortBeds, mergeEditableProducts } from '@/lib/homefort-static';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://domera.shop';
  const now = new Date();
  const staticRoutes = [
    ['/', 1, 'weekly'], ['/partners', 0.6, 'monthly'], ['/delivery-payment', 0.5, 'monthly'], ['/quiz', 0.5, 'monthly'], ['/journal', 0.8, 'weekly'],
  ].map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, lastModified: now, priority, changeFrequency }));

  const categories = ['beds','mattresses','toppers','pillows','duvets','bedding','kids-mattresses'];
  const categoryRoutes = categories.map((key) => ({ url: `${base}/catalog/${key}`, lastModified: now, priority: 0.9, changeFrequency: 'daily' }));
  const [editableProducts, posts] = await Promise.all([filterEntity('Product', {}), filterEntity('Blog', { published: true })]);
  const editableBeds = editableProducts.filter((p) => p.category === 'beds');
  const otherProducts = editableProducts.filter((p) => p.category !== 'beds');
  const products = [...mergeEditableProducts(getHomefortBeds(), editableBeds), ...otherProducts];
  const productRoutes = products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(p.updated_date || p.created_date || now), priority: 0.8, changeFrequency: 'weekly', images: p.images?.slice(0, 3) }));
  const postRoutes = posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: new Date(p.updated_date || p.publishedAt || now), priority: 0.7, changeFrequency: 'monthly', images: p.coverImage ? [p.coverImage] : undefined }));
  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
