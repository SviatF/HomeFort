import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Link from 'next/link';

export const metadata = { title: 'Сторінку не знайдено', robots: { index: false, follow: false } };

export default function NotFound() {
  return <div className="bg-milk min-h-screen"><Header/><main className="pt-[140px] pb-32 text-center px-6"><h1 className="font-heading text-4xl text-espresso">Сторінку не знайдено</h1><Link href="/" className="mt-6 inline-block text-mocha underline">На головну</Link></main><Footer/></div>;
}
