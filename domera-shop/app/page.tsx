import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ArrowIcon } from '@/components/Icons';
import { categories, products } from '@/data/products';

const perks = [
  ['01', 'Власне виробництво', 'Контролюємо матеріали, конструкцію та якість на кожному етапі.'],
  ['02', 'Гарантія якості', 'Меблі та текстиль створені для щоденного використання роками.'],
  ['03', 'Оплата частинами', 'Комфортна покупка без необхідності відкладати оновлення спальні.'],
  ['04', 'Доставка по Україні', 'Дбайливо доставляємо замовлення у ваше місто.'],
];

const reviews = [
  ['5.0', '“Наживо Milano виглядає ще краще, ніж на фото. Дуже приємна тканина і реально якісна збірка.”', 'Олена, Київ'],
  ['5.0', '“Замовили ліжко одразу з матрацом і текстилем. Спальня нарешті виглядає цілісно.”', 'Марія, Львів'],
  ['4.9', '“Сподобалось, що можна було підібрати тканину під наш інтер’єр. Менеджер допоміг із розміром.”', 'Андрій, Дніпро'],
];

const faq = [
  ['Чи можна змінити тканину та колір ліжка?', 'Так. Для більшості моделей доступна палітра тканин і кольорів. Менеджер DOMERA допоможе підібрати варіант під ваш інтер’єр.'],
  ['Скільки часу займає виготовлення?', 'Термін залежить від моделі та комплектації. Орієнтовний строк буде вказано на сторінці товару та підтверджено після оформлення замовлення.'],
  ['Чи є оплата частинами?', 'Так, ми передбачаємо оплату частинами. Доступні варіанти показуються під ціною товару та під час checkout.'],
  ['Чи доставляєте по Україні?', 'Так. Доставка доступна по Україні. Великогабаритні меблі доставляються за узгодженим сценарієм, текстиль — поштовими службами.'],
  ['Чи можна замовити комплект спальня під ключ?', 'Так. На сайті доступні комплекти з ліжком, матрацом, наматрацником, подушками й текстилем.'],
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <Header dark />
        <Image
          src="https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=2200&q=90"
          alt="Преміальна спальня DOMERA"
          fill priority sizes="100vw" className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="hero-content container">
          <p className="hero-kicker">HOME TEXTILE & LIVING · MADE IN UKRAINE</p>
          <h1>Простір, створений<br/><em>для відпочинку.</em></h1>
          <p className="hero-copy">Ліжка, матраци та текстиль власного виробництва — для спальні, в яку хочеться повертатися.</p>
          <div className="hero-actions">
            <Link href="/catalog/beds" className="button button-light">Обрати ліжко <ArrowIcon /></Link>
            <Link href="/catalog" className="text-link light-link">Переглянути каталог <ArrowIcon /></Link>
          </div>
        </div>
        <div className="hero-index"><span>01</span><div/><span>DOMERA COLLECTION 2026</span></div>
      </section>

      <section className="trust-strip">
        {perks.map(([n, title]) => <div className="trust-item" key={title}><span>{n}</span><strong>{title}</strong></div>)}
      </section>

      <section className="section container intro-section">
        <div className="section-label">Колекції</div>
        <div className="intro-heading"><h2>Усе, що формує<br/><em>культуру відпочинку.</em></h2><p>Ми поєднуємо меблі та текстиль в одну спокійну систему — так, щоб спальня виглядала цілісно, а кожна деталь працювала на комфорт.</p></div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link href={category.href} className={`category-card category-${index + 1}`} key={category.name}>
              <Image src={category.image} alt={category.name} fill sizes="(max-width: 800px) 100vw, 50vw" />
              <div className="category-shade" />
              <div className="category-content"><span>{String(index + 1).padStart(2,'0')}</span><div><h3>{category.name}</h3><p>{category.note}</p></div><ArrowIcon /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section product-section">
        <div className="container section-head">
          <div><div className="section-label">Вибір клієнтів</div><h2>Хіти <em>DOMERA</em></h2></div>
          <Link href="/catalog/beds" className="text-link">Дивитися всі ліжка <ArrowIcon /></Link>
        </div>
        <div className="product-row container-wide">
          {products.slice(0,4).map(product => <ProductCard key={product.slug} product={product} />)}
        </div>
      </section>

      <section className="brand-story">
        <div className="brand-visual"><Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=90" alt="Інтер'єр DOMERA" fill sizes="60vw" /></div>
        <div className="brand-copy">
          <div className="section-label">Our philosophy</div>
          <p className="big-quote">“Не просто ліжко.<br/><em>Місце, куди хочеться повертатися.”</em></p>
          <p>DOMERA створює предмети для спальні в естетиці quiet luxury: природна палітра, м’які форми, тактильні тканини й конструкції, розраховані на роки.</p>
          <Link href="/about" className="text-link">Дізнатися про DOMERA <ArrowIcon /></Link>
        </div>
      </section>

      <section className="section bundle-section container">
        <div className="bundle-copy">
          <div className="section-label">DOMERA Set</div>
          <h2>Все для ідеального сну.<br/><em>В одному комплекті.</em></h2>
          <p>Зібрали повну спальню так, щоб вам не довелося поєднувати різні бренди та відтінки.</p>
          <ul>
            <li><span>01</span>Ліжко Milano 160×200 <b>34 900 ₴</b></li>
            <li><span>02</span>Матрац Balance Pro <b>21 500 ₴</b></li>
            <li><span>03</span>Наматрацник SoftGuard <b>2 490 ₴</b></li>
            <li><span>04</span>2 × подушки Cloud <b>3 580 ₴</b></li>
          </ul>
          <div className="bundle-total"><span>Комплект</span><div><del>62 470 ₴</del><strong>56 900 ₴</strong></div></div>
          <Link href="/checkout" className="button button-dark">Купити комплект <ArrowIcon /></Link>
        </div>
        <div className="bundle-visual"><Image src="https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1800&q=90" alt="Комплект DOMERA" fill sizes="55vw" /><span className="floating-note">SAVE 5 570 ₴</span></div>
      </section>

      <section className="craft-section">
        <div className="container craft-head"><div className="section-label light-label">Власне виробництво</div><h2>Від матеріалу<br/><em>до останнього шва.</em></h2><p>Контролюємо кожен етап — від каркаса до фінальної перевірки. Це дозволяє відповідати не лише за вигляд, а й за те, як ліжко відчувається через роки використання.</p></div>
        <div className="craft-gallery container-wide">
          <div className="craft-main"><Image src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=85" alt="Виробництво DOMERA" fill sizes="55vw" /></div>
          <div className="craft-side"><Image src="https://images.unsplash.com/photo-1601221998688-67b91a7f5d7b?auto=format&fit=crop&w=1200&q=85" alt="Тканини DOMERA" fill sizes="35vw" /><div className="craft-stat"><strong>5+</strong><span>етапів контролю<br/>якості кожного виробу</span></div></div>
        </div>
        <div className="container craft-perks">{perks.map(([n, title, text]) => <div key={title}><span>{n}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="section textile-section container">
        <div className="section-label">The finishing touch</div>
        <div className="textile-head"><h2>Текстиль, який завершує<br/><em>відчуття дому.</em></h2><Link href="/catalog" className="text-link">Перейти до текстилю <ArrowIcon /></Link></div>
        <div className="textile-grid">
          <div className="textile-large"><Image src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1600&q=90" alt="Текстиль DOMERA" fill sizes="65vw" /><div><p>LINEN COLLECTION</p><h3>Тактильність,<br/>яку відчуваєш.</h3></div></div>
          <div className="textile-small"><Image src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=1000&q=85" alt="Подушки DOMERA" fill sizes="30vw" /><h3>Cloud Pillow</h3><p>від 1 790 ₴</p></div>
        </div>
      </section>

      <section className="section reviews-section">
        <div className="container section-head"><div><div className="section-label">Відгуки</div><h2>Дім говорить<br/><em>за нас.</em></h2></div><div className="google-score"><strong>4.9</strong><span>★★★★★<small>Google Reviews</small></span></div></div>
        <div className="review-grid container">
          {reviews.map(([score, text, author]) => <article key={author}><div className="review-top"><strong>{score}</strong><span>★★★★★</span></div><blockquote>{text}</blockquote><p>{author}</p></article>)}
        </div>
      </section>

      <section className="section journal-section container">
        <div className="section-head"><div><div className="section-label">DOMERA Journal</div><h2>Простір для<br/><em>кращого вибору.</em></h2></div><Link href="/blog" className="text-link">Усі матеріали <ArrowIcon /></Link></div>
        <div className="journal-grid">
          {[
            ['Як вибрати розмір ліжка і не помилитися', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85', '7 хв'],
            ['Матрац: жорсткість, наповнення і ваш сон', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=85', '9 хв'],
            ['Текстиль у спальні: як зібрати спокійну палітру', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85', '5 хв'],
          ].map(([title, image, time], i) => <Link href="/blog" className="journal-card" key={title}><div className="journal-image"><Image src={image} alt={title} fill sizes="33vw" /></div><span>0{i+1} · {time}</span><h3>{title}</h3><div className="text-link">Читати <ArrowIcon /></div></Link>)}
        </div>
      </section>

      <section className="section faq-section container">
        <div className="faq-intro"><div className="section-label">FAQ</div><h2>Питання,<br/><em>які важливо знати.</em></h2><p>Не знайшли відповіді? Напишіть нам — менеджер допоможе з вибором, тканиною, розміром і доставкою.</p><Link href="/contacts" className="button button-outline">Зв’язатися з нами</Link></div>
        <div className="faq-list">{faq.map(([q,a], i) => <details key={q}><summary><span>{String(i+1).padStart(2,'0')}</span>{q}<b>+</b></summary><p>{a}</p></details>)}</div>
      </section>

      <Footer />
    </main>
  );
}
