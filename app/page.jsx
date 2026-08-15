import Home from '@/pages/Home';

export const metadata = {
  title: 'DOMERA — ліжка, матраци та текстиль для спальні | Власне виробництво',
  description: 'Український бренд продуманого комфорту спальні. Ліжка, матраци, подушки та текстиль від власного виробництва. Виготовлення 7–10 днів, гарантія до 5 років, доставка по Україні.',
  alternates: { canonical: '/' },
};

export default function Page() {
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'DOMERA', url: 'https://domera.shop', description: 'Український бренд продуманого комфорту спальні — ліжка, матраци та текстиль від власного виробництва.', sameAs: ['https://instagram.com/domera.shop'] },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'DOMERA', url: 'https://domera.shop' },
  ];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Home /></>;
}
