'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import {
  Search, Phone, GitCompare, Heart, User, ShoppingBag, Menu, X, ChevronDown,
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { track } from '@/lib/analytics';
import { useWishlist } from '@/lib/WishlistContext';
import { useCompare } from '@/lib/CompareContext';
import { useSettings } from '@/lib/useSettings';
import SearchOverlay from './SearchOverlay';

const catalog = [
  {
    title: 'Ліжка',
    items: [
      { label: "М'які", to: '/catalog/beds/myaki-lizhka' },
      { label: 'З підйомним механізмом', to: '/catalog/beds/lizhka-z-pidiomnym-mekhanizmom' },
      { label: 'Двоспальні', to: '/catalog/beds/dvospalni-lizhka' },
      { label: 'Для спальні', to: '/catalog/beds/lizhka-dlya-spalni' },
      { label: 'Сучасні', to: '/catalog/beds/suchasni-lizhka' },
      { label: 'Дизайнерські', to: '/catalog/beds/dyzainerski-lizhka' },
    ],
  },
  {
    title: 'Матраци',
    items: [
      { label: 'Усі матраци', to: '/catalog/mattresses' },
      { label: 'Підібрати за розміром', to: '/catalog/mattresses' },
      { label: 'Для двоспального ліжка', to: '/catalog/mattresses' },
      { label: 'Підібрати сон', to: '/quiz' },
    ],
  },
  {
    title: 'Текстиль',
    items: [
      { label: 'Наматрацники', to: '/catalog/toppers' },
      { label: 'Подушки', to: '/catalog/pillows' },
      { label: 'Ковдри', to: '/catalog/duvets' },
      { label: 'Постільна білизна', to: '/catalog/bedding' },
    ],
  },
  {
    title: 'Дитячі матраци',
    items: [
      { label: 'Усі дитячі матраци', to: '/catalog/kids-mattresses' },
      { label: 'Підбір сну', to: '/quiz' },
      { label: 'Консультація', to: '/#footer' },
    ],
  },
];

const navLinks = [
  { label: 'Ліжка', to: '/catalog/beds' },
  { label: 'Матраци', to: '/catalog/mattresses' },
  { label: 'Підбір сну', to: '/quiz' },
  { label: 'Текстиль', to: '/catalog/textile' },
  { label: 'Для партнерів', to: '/partners' },
  { label: 'Про DOMERA', to: '/#philosophy' },
  { label: 'Контакти', to: '/#footer' },
];

export default function Header({ dark = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, open } = useCart();
  const { count: wishCount } = useWishlist();
  const { count: compareCount, open: openCompare } = useCompare();
  const settings = useSettings();

  const d = dark;
  const bar = d ? (scrolled ? 'bg-espresso' : 'bg-espresso/92') : (scrolled ? 'bg-milk' : 'bg-milk/92');
  const borderIdle = d ? 'border-milk/8' : 'border-espresso/8';
  const borderScroll = d ? 'border-champagne/40' : 'border-espresso/12';
  const logo = d ? 'text-milk' : 'text-espresso';
  const sub = d ? 'text-champagne' : 'text-espresso/70';
  const nav = d ? 'text-milk' : 'text-espresso';
  const hover = d ? 'hover:text-champagne' : 'hover:text-clay';
  const icon = d ? 'text-milk' : 'text-espresso';
  const badge = d ? 'bg-milk text-espresso' : 'bg-espresso text-milk';
  const megaBg = d ? 'bg-espresso' : 'bg-milk';
  const megaBorder = d ? 'border-milk/10' : 'border-espresso/10';
  const megaNum = d ? 'text-champagne' : 'text-mocha';
  const megaTitle = d ? 'text-milk' : 'text-espresso';
  const megaItem = d ? 'text-milk/70 hover:text-milk' : 'text-mocha hover:text-espresso';
  const mobileBg = d ? 'bg-espresso' : 'bg-milk';
  const mobileBorder = d ? 'border-milk/10' : 'border-espresso/10';
  const mobileSub = d ? 'text-milk/60' : 'text-mocha';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 100);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-md border-b ${bar} ${scrolled ? `${borderScroll} shadow-card` : borderIdle}`}>
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="flex items-center justify-between h-[78px]">
            <Link to="/" className="flex flex-col leading-none select-none">
              <span className={`font-heading text-[26px] tracking-[0.22em] ${logo} font-medium`}>DOMERA</span>
              <span className={`text-[9px] tracking-[0.36em] mt-1 ${sub} font-bold`}>HOME TEXTILE &amp; LIVING</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <div onMouseEnter={() => setMega(true)}>
                <button className={`flex items-center gap-1 text-[12px] tracking-[0.16em] uppercase font-medium ${nav} ${hover} transition-colors`}>Каталог <ChevronDown className="w-3 h-3" /></button>
              </div>
              {navLinks.map((l) => <Link key={l.label} to={l.to} className={`text-[12px] tracking-[0.16em] uppercase font-medium ${nav} ${hover} transition-colors`}>{l.label}</Link>)}
            </nav>

            <div className={`flex items-center gap-5 ${icon}`}>
              <button aria-label="Пошук" onClick={() => setSearchOpen(true)} className={`hidden sm:block ${hover} transition-colors`}><Search className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
              {settings?.phone && <a href={`tel:${settings.phone}`} aria-label="Телефон" onClick={() => track('phone_click')} className={`hidden md:block ${hover} transition-colors`}><Phone className="w-[18px] h-[18px]" strokeWidth={1.5} /></a>}
              <button aria-label="Порівняти" onClick={openCompare} className={`hidden sm:block relative ${hover} transition-colors`}><GitCompare className="w-[18px] h-[18px]" strokeWidth={1.5} />{compareCount > 0 && <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${badge} text-[9px] flex items-center justify-center font-medium`}>{compareCount}</span>}</button>
              <Link to="/wishlist" aria-label="Обране" className={`relative ${hover} transition-colors`}><Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />{wishCount > 0 && <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${badge} text-[9px] flex items-center justify-center font-medium`}>{wishCount}</span>}</Link>
              <button aria-label="Акаунт" className={`hidden sm:block ${hover} transition-colors`}><User className="w-[18px] h-[18px]" strokeWidth={1.5} /></button>
              <button aria-label="Кошик" onClick={open} className={`relative ${hover} transition-colors`}><ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} /><span key={count} className={`cart-count-pop absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${badge} text-[13px] flex items-center justify-center font-medium`}>{count}</span></button>
              <button aria-label="Меню" onClick={() => setMobile(true)} className="lg:hidden ml-1"><Menu className="w-6 h-6" strokeWidth={1.5} /></button>
            </div>
          </div>
        </div>

        <div onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)} className={`absolute left-0 right-0 top-full transition-all duration-300 origin-top ${mega ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className={`${megaBg} border-t ${megaBorder} shadow-elevated`}>
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 grid grid-cols-4 gap-10">
              {catalog.map((c, i) => (
                <div key={c.title}>
                  <span className={`text-[10px] tracking-[0.32em] ${megaNum} uppercase block mb-4 font-medium`}>0{i + 1}</span>
                  <h3 className={`font-heading text-2xl ${megaTitle} mb-4`}>{c.title}</h3>
                  <ul className="space-y-2.5">{c.items.map((it) => <li key={it.label}><Link to={it.to} className={`text-sm ${megaItem} transition-colors`}>{it.label}</Link></li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${mobile ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-espresso/50" onClick={() => setMobile(false)} />
        <div className={`absolute right-0 top-0 h-full w-[88%] max-w-[420px] ${mobileBg} transition-transform duration-500 ${mobile ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className={`flex items-center justify-between px-6 h-[78px] border-b ${mobileBorder}`}>
            <span className={`font-heading text-2xl tracking-[0.22em] ${logo} font-medium`}>DOMERA</span>
            <button aria-label="Закрити" onClick={() => setMobile(false)}><X className={`w-6 h-6 ${logo}`} strokeWidth={1.5} /></button>
          </div>
          <div className="px-6 py-8 overflow-y-auto h-[calc(100%-78px)]">
            <p className={`text-[10px] tracking-[0.32em] ${mobileSub} uppercase mb-4 font-medium`}>Каталог</p>
            <div className="space-y-1 mb-8">
              {catalog.map((c) => (
                <div key={c.title} className={`py-2 border-b ${mobileBorder}`}>
                  <span className={`font-heading text-xl ${megaTitle}`}>{c.title}</span>
                  <ul className="mt-2 space-y-1.5">{c.items.map((it) => <li key={it.label}><Link to={it.to} onClick={() => setMobile(false)} className={`text-sm ${mobileSub}`}>{it.label}</Link></li>)}</ul>
                </div>
              ))}
            </div>
            <nav className="space-y-3">{navLinks.map((l) => <Link key={l.label} to={l.to} onClick={() => setMobile(false)} className={`block text-sm tracking-[0.16em] uppercase ${nav} font-medium`}>{l.label}</Link>)}</nav>
            {(settings?.phone || settings?.email || settings?.address || settings?.workingHours) && (
              <div className={`mt-8 pt-6 border-t ${mobileBorder} space-y-3 ${mobileSub}`}>
                {settings?.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" strokeWidth={1.5} /> {settings.phone}</a>}
                {settings?.email && <a href={`mailto:${settings.email}`} className="text-sm block">{settings.email}</a>}
                {settings?.address && <p className="text-sm">{settings.address}</p>}
                {settings?.workingHours && <p className="text-sm opacity-70">{settings.workingHours}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
