import { notFound } from 'next/navigation';
import JournalArticle from '@/screens/JournalArticle';
import { filterEntity, listEntity } from '@/lib/base44-server';

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
  return {
    title: post.seoTitle || `${post.title} — DOMERA Journal`,
    description: post.seoDescription || post.excerpt || '',
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || '', images: post.coverImage ? [post.coverImage] : undefined, type: 'article' },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data.post) notFound();
  const p = data.post;
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, image: p.coverImage ? [p.coverImage] : undefined, description: p.excerpt || p.seoDescription || '', datePublished: p.publishedAt, author: { '@type': 'Organization', name: p.author || 'DOMERA' }, publisher: { '@type': 'Organization', name: 'DOMERA' }, mainEntityOfPage: `https://domera.shop/journal/${p.slug}` };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /><JournalArticle initialPost={p} initialRelated={data.related} /></>;
}
