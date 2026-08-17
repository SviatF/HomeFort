import Home from '@/screens/Home';
import { buildMetadata, websiteSchema } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'DOMERA — ліжка, матраци та текстиль для спальні',
  description: 'Український бренд продуманого комфорту спальні. Ліжка, матраци та текстиль DOMERA: різні розміри, тканини й комплектації з доставкою по Україні.',
  canonical: '/',
  keywords: ['ліжка', 'матраци', 'текстиль для спальні', 'купити ліжко', 'DOMERA'],
});

export default function Page() {
  const jsonLd = websiteSchema();
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Home /></>;
}
