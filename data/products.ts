export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  badge?: string;
  image: string;
  gallery: string[];
  sizes: string[];
  colors: string[];
  material: string;
  description: string;
  sku: string;
};

const bedGallery = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=85',
  'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1800&q=85',
];

export const products: Product[] = [
  {
    slug: 'milano-soft', name: 'Milano', subtitle: 'М’яке двоспальне ліжко', category: 'М’які ліжка',
    price: 34900, oldPrice: 38900, rating: 4.9, badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['140×200', '160×200', '180×200', '200×200'], colors: ['Ivory', 'Sand', 'Mocca', 'Graphite'], material: 'Bouclé / велюр',
    description: 'М’яке ліжко з виразним узголів’ям, створене для спокійних сучасних інтер’єрів. Каркас власного виробництва, продумана ергономіка та тактильна оббивка.', sku: 'DM-MIL-01'
  },
  {
    slug: 'luna-lift', name: 'Luna', subtitle: 'Ліжко з підйомним механізмом', category: 'Підйомний механізм',
    price: 29900, rating: 4.8, badge: 'New',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['140×200', '160×200', '180×200'], colors: ['Cream', 'Taupe', 'Olive', 'Charcoal'], material: 'Велюр Easy Clean',
    description: 'Лаконічне ліжко з місткою нішею для зберігання. Газовий підйомний механізм працює плавно й тихо, а м’які форми додають інтер’єру затишку.', sku: 'DM-LUN-02'
  },
  {
    slug: 'verona-premium', name: 'Verona', subtitle: 'Преміальне ліжко', category: 'Premium',
    price: 48900, oldPrice: 52900, rating: 5.0, badge: 'Signature',
    image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['160×200', '180×200', '200×200'], colors: ['Milk', 'Caramel', 'Cacao'], material: 'Premium textile',
    description: 'Флагманська модель DOMERA з широким м’яким узголів’ям та глибокою посадкою. Акцентний предмет для спальні в стилі quiet luxury.', sku: 'DM-VER-03'
  },
  {
    slug: 'como-air', name: 'Como', subtitle: 'Двоспальне ліжко', category: 'Двоспальні',
    price: 37500, rating: 4.8,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['160×200', '180×200'], colors: ['Ivory', 'Stone', 'Graphite'], material: 'Рогожка',
    description: 'Збалансована модель із тонким силуетом і високим комфортним узголів’ям. Добре працює як у мінімалістичних, так і в теплих сучасних інтер’єрах.', sku: 'DM-COM-04'
  },
  {
    slug: 'siena-soft', name: 'Siena', subtitle: 'М’яке ліжко', category: 'М’які ліжка',
    price: 31900, rating: 4.7,
    image: 'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['140×200', '160×200', '180×200'], colors: ['Beige', 'Mushroom', 'Brown'], material: 'Шеніл',
    description: 'М’яка геометрія, ніжна фактура та універсальна палітра. Siena створена для інтер’єрів, де важливі тиша, тактильність і довговічність.', sku: 'DM-SIE-05'
  },
  {
    slug: 'alba-single', name: 'Alba', subtitle: 'Односпальне ліжко', category: 'Односпальні',
    price: 21900, rating: 4.8,
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['90×200', '120×200'], colors: ['Cream', 'Sand', 'Sage'], material: 'Велюр',
    description: 'Компактна модель для гостьової, підліткової або невеликої спальні. Виглядає легко, але має повноцінний м’який каркас.', sku: 'DM-ALB-06'
  },
  {
    slug: 'mia-kids', name: 'Mia', subtitle: 'Дитяче ліжко', category: 'Дитячі',
    price: 18500, rating: 4.9,
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['80×190', '90×200'], colors: ['Milk', 'Blush', 'Sky'], material: 'Easy Clean',
    description: 'Безпечне м’яке ліжко з заокругленими формами та зносостійкою тканиною. Створене для щоденного використання у дитячій кімнаті.', sku: 'DM-MIA-07'
  },
  {
    slug: 'royal-signature', name: 'Royal', subtitle: 'Signature bed', category: 'Premium',
    price: 56900, rating: 5.0, badge: 'Limited',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85', gallery: bedGallery,
    sizes: ['180×200', '200×200'], colors: ['Pearl', 'Truffle', 'Black'], material: 'Luxury bouclé',
    description: 'Велике статусне ліжко з архітектурним узголів’ям. Модель для просторих спалень, де меблі є частиною композиції інтер’єру.', sku: 'DM-ROY-08'
  }
];

export const categories = [
  { name: 'Ліжка', note: 'М’які · Premium · З механізмом', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85', href: '/catalog/beds' },
  { name: 'Матраци', note: 'Підтримка для глибокого сну', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85', href: '/catalog' },
  { name: 'Постіль', note: 'Тактильний текстиль', image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=85', href: '/catalog' },
  { name: 'Подушки', note: 'Щоденний комфорт', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=1200&q=85', href: '/catalog' },
  { name: 'Ковдри', note: 'Легкість і тепло', image: 'https://images.unsplash.com/photo-1583845112203-454c2254edb4?auto=format&fit=crop&w=1200&q=85', href: '/catalog' },
  { name: 'Наматрацники', note: 'Захист і свіжість', image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85', href: '/catalog' },
];
