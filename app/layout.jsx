import '@/index.css';
import AppProviders from '@/components/AppProviders';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://domera.shop';

export const metadata = {
  metadataBase: new URL(base),
  applicationName: 'DOMERA',
  title: { default: 'DOMERA — ліжка, матраци та текстиль', template: '%s | DOMERA' },
  description: 'DOMERA — ліжка, матраци та текстиль для сучасної спальні. Різні розміри, тканини та комплектації з доставкою по Україні.',
  category: 'home furniture',
  alternates: { canonical: '/', languages: { 'uk-UA': '/', 'x-default': '/' } },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    siteName: 'DOMERA',
    locale: 'uk_UA',
    type: 'website',
    title: 'DOMERA — ліжка, матраци та текстиль',
    description: 'Продуманий комфорт спальні: ліжка, матраци та текстиль DOMERA.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOMERA — ліжка, матраци та текстиль',
    description: 'Продуманий комфорт спальні: ліжка, матраци та текстиль DOMERA.',
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk-UA">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
