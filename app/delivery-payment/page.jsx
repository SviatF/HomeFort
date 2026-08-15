import PageContent from '@/pages/DeliveryPayment';
export const metadata = {
  title: 'Доставка, оплата та гарантія — DOMERA',
  description: 'Умови доставки по Україні, способи оплати, гарантія та повернення товарів DOMERA.',
  alternates: { canonical: '/delivery-payment' }, robots: { index: true, follow: true }
};
export default function Page(){ return <PageContent/>; }
