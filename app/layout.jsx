import '@/index.css';
import '@/ui-a-f.css';
import AppProviders from '@/components/AppProviders';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://domera.shop';
const GTM_ID = 'GTM-WRXMB8X5';

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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
