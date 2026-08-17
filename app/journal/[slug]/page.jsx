import { notFound } from 'next/navigation';
import JournalArticle from '@/screens/JournalArticle';
import { filterEntity, listEntity } from '@/lib/base44-server';
import { buildMetadata, breadcrumbSchema, absoluteUrl, stripText } from '@/lib/seo';

async function getData(slug) {
  const posts = await filterEntity('Blog', { slug, published: true });
  const post = posts[0] || null;
  if (!post) return { post: null, related: [] };
  let related = [];
  if (post.relatedProductIds?.length) {
    const all = await listEntity('Product', '-updated_date', 100);
    related = all.filter((p) => post.relatedProductIds.includes(p.id)).slice(0, 3);
  }
  return { post, related };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getData(slug);
  if (!post) return { title: 'Статтю не знайдено', robots: { index: false, follow: false } };
  return buildMetadata({
    title: post.seoTitle || `${post.title} — DOMERA Journal`,
    description: post.seoDescription || post.excerpt || '',
    canonical: `/journal/${post.slug}`,
    image: post.coverImage,
    type: 'article',
    keywords: post.tags || [],
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data.post) notFound();
  const p = data.post;
  const url = absoluteUrl(`/journal/${p.slug}`);
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: p.title,
    image: p.coverImage ? [absoluteUrl(p.coverImage)] : undefined,
    description: stripText(p.excerpt || p.seoDescription || '', 500),
    datePublished: p.publishedAt || undefined,
    dateModified: p.updated_date || p.publishedAt || undefined,
    inLanguage: 'uk-UA',
    author: { '@type': 'Organization', name: p.author || 'DOMERA', url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'DOMERA', url: absoluteUrl('/') },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
  const schemas = [
    articleLd,
    breadcrumbSchema([
      { name: 'Головна', url: '/' },
      { name: 'Журнал', url: '/journal' },
      { name: p.title, url: `/journal/${p.slug}` },
    ]),
  ];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} /><JournalArticle initialPost={p} initialRelated={data.related} /></>;
}
