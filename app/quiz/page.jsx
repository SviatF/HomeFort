import PageContent from '@/screens/Quiz';
export const metadata = {
  title: 'Підбір сну — DOMERA',
  description: 'Пройдіть короткий підбір і отримайте індивідуальну рекомендацію матраца, подушки та ковдри DOMERA.',
  alternates: { canonical: '/quiz' }, robots: { index: true, follow: true }
};
export default function Page(){ return <PageContent/>; }
