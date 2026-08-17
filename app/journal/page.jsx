import Journal from '@/screens/Journal';
import { filterEntity } from '@/lib/base44-server';
import { buildMetadata, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { mergeJournalPosts } from '@/lib/bed-topical-core';

export const metadata = buildMetadata({
  title: 'Журнал DOMERA — про сон, ліжка та інтер’єр',
  description: 'Практичні матеріали DOMERA про вибір ліжка й матраца, розміри 140×200, 160×200 і 180×200, підйомні механізми, тканини та комфорт спальні.',
  canonical: '/journal',
  keywords: ['як вибрати ліжко', 'розміри ліжка', 'ліжко 160 чи 180', 'ліжко з підйомним механізмом', 'як вибрати матрац', 'DOMERA Journal'],
});

export default async function Page() {
  const dynamicPosts = await filterEntity('Blog', { published: true });
  const posts = mergeJournalPosts(dynamicPosts);
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl('/journal')}#collection`,
      name: 'Журнал DOMERA',
      url: absoluteUrl('/journal'),
      about: ['ліжка', 'матраци', 'сон', 'ергономіка спальні', 'інтер’єр'],
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: posts.length,
        itemListElement: posts.map((p, index) => ({ '@type': 'ListItem', position: index + 1, name: p.title, url: absoluteUrl(`/journal/${p.slug}`) })),
      },
    },
    breadcrumbSchema([{ name: 'Головна', url: '/' }, { name: 'Журнал', url: '/journal' }]),
  ];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} /><Journal initialPosts={posts} /></>;
}
