'use client';
import { Link } from '@/lib/router';
import { Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '@/lib/useSettings';

const linkPaths = {
  'Ліжка': '/catalog/beds',
  'Матраци': '/catalog/mattresses',
  'Наматрацники': '/catalog/toppers',
  'Подушки': '/catalog/pillows',
  'Ковдри': '/catalog/duvets',
  'Постільна білизна': '/catalog/bedding',
  'Дитячі матраци': '/catalog/kids-mattresses',
  'Доставка та оплата': '/delivery-payment',
  'Гарантія': '/delivery-payment',
  'Повернення': '/delivery-payment',
  'Відстежити замовлення': '/order-status',
  'Trade-In': '/#trade-in',
  'Шоурум': '/#footer',
  'Конфігуратор': '/bed-finder',
  'Обране': '/wishlist',
  'Порівняння': '/catalog/beds',
  'Філософія': '/#philosophy',
  'Власне виробництво': '/#production',
  'Матеріали': '/#materials',
  'Журнал': '/journal',
  'Відгуки': '/#reviews',
  'Контакти': '/#footer',
  'Для партнерів': '/partners',
  'Опт': '/partners',
  'Dropshipping': '/partners',
  'Для готелів': '/partners',
  'Для дизайнерів': '/partners',
  'Каталог PDF': '/partners',
};

const cols = [
  { title: 'Каталог', links: ['Ліжка', 'Матраци', 'Наматрацники', 'Подушки', 'Ковдри', 'Постільна білизна', 'Дитячі матраци'] },
  { title: 'Покупцям', links: ['Доставка та оплата', 'Гарантія', 'Відстежити замовлення', 'Trade-In', 'Шоурум', 'Конфігуратор', 'Обране', 'Порівняння'] },
  { title: 'Про DOMERA', links: ['Філософія', 'Власне виробництво', 'Матеріали', 'Журнал', 'Відгуки', 'Контакти'] },
  { title: 'B2B', links: ['Для партнерів', 'Опт', 'Dropshipping', 'Для готелів', 'Для дизайнерів', 'Каталог PDF'] },
];

export default function Footer() {
  const settings = useSettings();
  const instagram = settings?.instagram || settings?.instagramUrl || settings?.socialInstagram || '';

  return (
    <footer id="footer" className="bg-espresso text-milk pt-20 md:pt-28 pb-10">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-milk/15">
          <div className="lg:col-span-4">
            <div className="mb-6">
              <span className="font-heading text-3xl tracking-[0.22em] font-medium">DOMERA</span>
              <p className="text-[10px] tracking-[0.28em] mt-2 text-milk/60 font-medium">{settings?.brandDescriptor || 'Ліжка та матраци власного виробництва'}</p>
            </div>
            <p className="text-milk/75 leading-relaxed max-w-sm">Ліжка, матраци та текстиль нового покоління для вашого комфорту. Власне виробництво, продумані рішення для сну.</p>
            <div className="mt-7 space-y-3 text-sm text-milk/85">
              {settings?.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-3 hover:text-champagne transition-colors"><Phone className="w-4 h-4" strokeWidth={1.5} /> {settings.phone}</a>}
              {settings?.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-3 hover:text-champagne transition-colors"><Mail className="w-4 h-4" strokeWidth={1.5} /> {settings.email}</a>}
              {settings?.address && <p className="flex items-center gap-3"><MapPin className="w-4 h-4" strokeWidth={1.5} /> {settings.address}</p>}
              {settings?.workingHours && <p className="pl-7 text-milk/55">{settings.workingHours}</p>}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="text-[10px] tracking-[0.32em] uppercase text-champagne mb-5 font-medium">{c.title}</p>
                <ul className="space-y-2.5">{c.links.map((l) => <li key={l}><Link to={linkPaths[l]} className="text-sm text-milk/70 hover:text-milk transition-colors">{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-milk/55 text-sm">
          <p>© {new Date().getFullYear()} DOMERA. Усі права захищені.</p>
          <div className="flex items-center gap-6">
            {instagram && <a href={instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-milk transition-colors"><Instagram className="w-4 h-4" strokeWidth={1.5} /> Instagram</a>}
            <Link to="/delivery-payment" className="hover:text-milk transition-colors">Доставка, оплата та гарантія</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
