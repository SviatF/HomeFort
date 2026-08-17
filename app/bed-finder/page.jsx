import BedFinder from '@/screens/BedFinder';

export const metadata = {
  title: 'Підібрати ліжко за 60 секунд',
  description: 'Smart Finder DOMERA підбере моделі ліжок за розміром, бюджетом та стилем.',
  alternates: { canonical: '/bed-finder' },
};

export default function Page() { return <BedFinder />; }
