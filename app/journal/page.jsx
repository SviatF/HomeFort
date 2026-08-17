import Journal from '@/screens/Journal';
import { filterEntity } from '@/lib/base44-server';
import { buildMetadata, breadcrumbSchema, absoluteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Журнал DOMERA — про сон, ліжка та інтер’єр',
  description: 'Практичні матеріали DOMERA про вибір ліжка й матраца, текстиль, догляд за спальнею та комфортний сон.',
  canonical: '/journal',
  keywords: ['журнал про сон', 'як вибрати ліжко', 'як вибрати матрац', 'DOMERA Journal'],
});

export default async function Page() {
  const posts = (await filterEntity('Blog', { published: true })).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl('/journal')}#collection`,
      name: 'Журнал DOMERA',
      url: absoluteUrl('/journal'),
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
