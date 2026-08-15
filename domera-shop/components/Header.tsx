import Link from 'next/link';
import { BagIcon, CompareIcon, HeartIcon, SearchIcon, UserIcon } from './Icons';

export default function Header({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`site-header ${dark ? 'is-dark' : ''}`}>
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="DOMERA home">DOMERA<span>HOME TEXTILE & LIVING</span></Link>
        <nav className="desktop-nav" aria-label="Основна навігація">
          <Link href="/catalog">Каталог</Link>
          <Link href="/catalog/beds">Ліжка</Link>
          <Link href="/catalog">Матраци</Link>
          <Link href="/catalog">Текстиль</Link>
          <Link href="/about">Про DOMERA</Link>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Пошук"><SearchIcon /></button>
          <button className="icon-button desktop-icon" aria-label="Порівняння"><CompareIcon /></button>
          <button className="icon-button" aria-label="Обране"><HeartIcon /></button>
          <button className="icon-button desktop-icon" aria-label="Особистий кабінет"><UserIcon /></button>
          <Link className="icon-button cart-link" href="/cart" aria-label="Кошик"><BagIcon /><span>0</span></Link>
        </div>
      </div>
    </header>
  );
}
