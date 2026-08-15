import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="wordmark light">DOMERA<span>HOME TEXTILE & LIVING</span></div>
          <p>Предмети для сну та дому, створені з повагою до матеріалу, комфорту й тиші.</p>
        </div>
        <div className="footer-column"><h4>Каталог</h4><Link href="/catalog/beds">Ліжка</Link><Link href="/catalog">Матраци</Link><Link href="/catalog">Наматрацники</Link><Link href="/catalog">Подушки</Link><Link href="/catalog">Текстиль</Link></div>
        <div className="footer-column"><h4>Покупцям</h4><Link href="/delivery">Доставка</Link><Link href="/payment">Оплата</Link><Link href="/warranty">Гарантія</Link><Link href="/contacts">Контакти</Link></div>
        <div className="footer-column"><h4>DOMERA</h4><Link href="/about">Про компанію</Link><Link href="/blog">Journal</Link><Link href="/contacts">B2B / дизайнерам</Link><a href="#">Instagram</a><a href="#">Pinterest</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 DOMERA</span><span>Політика конфіденційності · Публічна оферта</span><span>Made for better rest.</span></div>
    </footer>
  );
}
