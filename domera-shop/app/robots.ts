import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent:'*', allow:'/', disallow:['/admin/','/checkout/'] }, sitemap:'https://domera.shop/sitemap.xml', host:'https://domera.shop' }; }
