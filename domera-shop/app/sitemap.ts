import type { MetadataRoute } from 'next';
import { products } from '@/data/products';
export default function sitemap(): MetadataRoute.Sitemap { const base='https://domera.shop'; return [
  {url:base,lastModified:new Date(),changeFrequency:'weekly',priority:1},
  ...['catalog','catalog/beds','about','delivery','payment','warranty','contacts','blog'].map(path=>({url:`${base}/${path}`,lastModified:new Date(),changeFrequency:'weekly' as const,priority:.7})),
  ...products.map(p=>({url:`${base}/product/${p.slug}`,lastModified:new Date(),changeFrequency:'weekly' as const,priority:.8}))
]; }
