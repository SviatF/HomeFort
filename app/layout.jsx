import '@/index.css';
import AppProviders from '@/components/AppProviders';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://domera.shop'),
  title: { default: 'DOMERA', template: '%s | DOMERA' },
  description: 'DOMERA — ліжка, матраци та текстиль нового покоління для вашого комфорту.',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: { siteName: 'DOMERA', locale: 'uk_UA', type: 'website' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
