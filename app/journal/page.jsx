import Journal from '@/screens/Journal';
import { filterEntity } from '@/lib/base44-server';

export const metadata = {
  title: 'Журнал DOMERA — про сон та інтерʼєр',
  description: 'Статті про вибір матраців, ліжка, текстиль та догляд за спальнею від DOMERA.',
  alternates: { canonical: '/journal' },
};

export default async function Page() {
  const posts = (await filterEntity('Blog', { published: true })).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  return <Journal initialPosts={posts} />;
}
