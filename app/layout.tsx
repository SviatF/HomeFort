import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({ subsets: ['latin', 'cyrillic'], weight: ['400','500','600'], variable: '--font-display', display: 'swap' });
const sans = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://domera.shop'),
  title: { default: 'DOMERA — ліжка, матраци та текстиль для дому', template: '%s | DOMERA' },
  description: 'Преміальні ліжка, матраци та домашній текстиль DOMERA. Власне виробництво, гарантія, оплата частинами та доставка по Україні.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'DOMERA — Home Textile & Living',
    description: 'Ліжка, матраци та текстиль, створені для вашого найкращого відпочинку.',
    type: 'website',
    locale: 'uk_UA',
    url: 'https://domera.shop',
    images: [{ url: '/domera-logo.png', width: 1200, height: 1200, alt: 'DOMERA' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uk"><body className={`${display.variable} ${sans.variable}`}>{children}</body></html>;
}
