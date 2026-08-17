export default function robots() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://domera.shop').replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/order-success/',
          '/order-status',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/wishlist',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
