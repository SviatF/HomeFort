'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from '@/lib/router';
import { SlidersHorizontal, ChevronDown, X, Plus, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, buildItem } from '@/lib/analytics';
import { sizeToSlug, sizeMatches } from '@/lib/variant';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import ProductCard from '@/components/domera/ProductCard';
import Reveal from '@/components/domera/Reveal';
import Seo from '@/components/Seo';
import CategoryGuide from '@/components/domera/CategoryGuide';

const fallbackTitles = {
  beds: { title: 'Ліжка', intro: 'М’які ліжка, моделі з підйомним механізмом та преміум-рішення від власного виробництва DOMERA.' },
  mattresses: { title: 'Матраци', intro: 'Анатомічні та ортопедичні матраци з незалежним пружинним блоком та memory foam.' },
  toppers: { title: 'Наматрацники', intro: 'Наматрацники, що пом’якшують поверхню та покращують мікроклімат вашого сну.' },
  pillows: { title: 'Подушки', intro: 'Подушки з натуральним наповненням та льняними чохлами для правильної підтримки.' },
  duvets: { title: 'Ковдри', intro: 'Легкі всесезонні ковдри з дихаючим наповненням та натуральним льоном.' },
  bedding: { title: 'Постільна білизна', intro: 'Льняна постільна білизна з попередньою декатировкою — м’яка та дихаюча.' },
  'kids-mattresses': { title: 'Дитячі матраци', intro: 'Ортопедичні матраці для дітей з гіпоалергенних матеріалів.' },
};

const sortOptions = [
  { value: 'featured', label: 'Рекомендовані' },
  { value: 'new', label: 'Новинки' },
  { value: 'price-asc', label: 'Ціна ↑' },
  { value: 'price-desc', label: 'Ціна ↓' },
  { value: 'rating', label: 'Рейтинг' },
];

export default function Catalog({ initialProducts = null, initialCategory = null } = {}) {
  const { category, size } = useParams();
  const [all, setAll] = useState(initialProducts || []);
  const [cat, setCat] = useState(initialCategory || null);
  const [loading, setLoading] = useState(!initialProducts);
  const [sort, setSort] = useState('featured');
  const [priceMax, setPriceMax] = useState(60000);
  const [sizesSel, setSizesSel] = useState([]);
  const [materialsSel, setMaterialsSel] = useState([]);
  const [onlyStock, setOnlyStock] = useState(false);
  const [colorsSel, setColorsSel] = useState([]);
  const [fabricsSel, setFabricsSel] = useState([]);
  const [liftingSel, setLiftingSel] = useState('any');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (initialProducts && initialCategory && (initialCategory.key === category || !initialCategory.key)) {
      setAll(initialProducts); setCat(initialCategory); setLoading(false);
      setSizesSel([]); setMaterialsSel([]); setOnlyStock(false); setPriceMax(60000);
      setColorsSel([]); setFabricsSel([]); setLiftingSel('any');
      return;
    }
    setLoading(true);
    Promise.all([
      base44.entities.Product.filter({ category }),
      base44.entities.Category.filter({ key: category }),
    ])
      .then(([prods, cats]) => {
        setAll(prods || []);
        setCat((cats || [])[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    setSizesSel([]); setMaterialsSel([]); setOnlyStock(false); setPriceMax(60000);
    setColorsSel([]); setFabricsSel([]); setLiftingSel('any');
  }, [category, initialProducts, initialCategory]);

  useEffect(() => {
    if (!loading && all.length) {
      track('view_item_list', {
        item_list_id: size ? `${category}-${sizeToSlug(size)}` : category,
        item_list_name: meta.title,
        items: filtered.map((p) => buildItem(p)),
      });
    }
  }, [loading, category, size]);

  const allSizes = useMemo(() => [...new Set(all.flatMap((p) => p.sizes || []))], [all]);
  const allMaterials = useMemo(() => [...new Set(all.map((p) => p.material).filter(Boolean))], [all]);
  const allColors = useMemo(() => [...new Set(all.flatMap((p) => p.colors || []))], [all]);
  const allFabrics = useMemo(() => [...new Set(all.flatMap((p) => p.fabrics || []))], [all]);
  const hasLifting = useMemo(() => all.some((p) => p.liftingMechanism), [all]);
  const maxPrice = useMemo(() => Math.max(60000, ...all.map((p) => p.price || 0)), [all]);

  const sizeDisplay = useMemo(() => {
    if (!size) return '';
    const p = all.find((pp) => (pp.sizes || []).some((s) => sizeMatches(s, size)));
    const s = p?.sizes?.find((x) => sizeMatches(x, size));
    return s || size;
  }, [all, size]);

  const filtered = useMemo(() => {
    let list = size ? all.filter((p) => (p.sizes || []).some((s) => sizeMatches(s, size))) : all;
    list = list.filter((p) => p.price <= priceMax);
    if (sizesSel.length) list = list.filter((p) => (p.sizes || []).some((s) => sizesSel.includes(s)));
    if (materialsSel.length) list = list.filter((p) => materialsSel.includes(p.material));
    if (colorsSel.length) list = list.filter((p) => (p.colors || []).some((c) => colorsSel.includes(c)));
    if (fabricsSel.length) list = list.filter((p) => (p.fabrics || []).some((f) => fabricsSel.includes(f)));
    if (liftingSel === 'yes') list = list.filter((p) => p.liftingMechanism);
    if (liftingSel === 'no') list = list.filter((p) => !p.liftingMechanism);
    if (onlyStock) list = list.filter((p) => p.availability === 'in_stock');
    switch (sort) {
      case 'new': list = [...list].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break;
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating': list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [all, size, priceMax, sizesSel, materialsSel, colorsSel, fabricsSel, liftingSel, onlyStock, sort]);

  const baseMeta = cat
    ? { title: cat.name, intro: cat.seoIntro || cat.seoDescription || '' }
    : fallbackTitles[category] || { title: 'Каталог', intro: '' };
  const h1 = cat?.h1 || baseMeta.title;
  const meta = size
    ? {
        title: `${baseMeta.title} ${sizeDisplay} купити — ціни | DOMERA`,
        description: `${baseMeta.intro} Розмір ${sizeDisplay}.`,
        h1: `${h1} ${sizeDisplay}`,
        canonical: `/catalog/${category}/${sizeToSlug(size)}`,
      }
    : {
        title: cat?.seoTitle || `${baseMeta.title} купити — ціни | DOMERA`,
        description: cat?.seoDescription || baseMeta.intro,
        h1,
        canonical: cat?.canonicalUrl || `/catalog/${category}`,
      };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://domera.shop/' },
      { '@type': 'ListItem', position: 2, name: baseMeta.title, item: `https://domera.shop/catalog/${category}` },
      ...(size ? [{ '@type': 'ListItem', position: 3, name: sizeDisplay, item: `https://domera.shop/catalog/${category}/${sizeToSlug(size)}` }] : []),
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.h1,
    description: meta.description,
    url: `https://domera.shop${meta.canonical}`,
    breadcrumb: breadcrumbLd,
    mainEntity: {
      '@type': 'ItemList',
      name: meta.h1,
      itemListElement: filtered.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `https://domera.shop/product/${p.slug}`,
      })),
    },
  };
  const faqList = (cat?.faq || []).filter((f) => f && f.q);
  const faqLd = faqList.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a || '' },
        })),
      }
    : null;

  const jsonLd = [breadcrumbLd, collectionLd, ...(faqLd ? [faqLd] : [])];
  const indexable = cat ? cat.indexable !== false : true;

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const Filters = () => (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-4">Ціна до</p>
        <input type="range" min="1000" max={maxPrice} step="500" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-espresso" />
        <p className="text-sm text-espresso mt-2">{priceMax.toLocaleString('uk-UA')} ₴</p>
      </div>
      {!size && allSizes.length > 0 && (
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-4">Розмір</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button key={s} onClick={() => toggle(sizesSel, setSizesSel, s)} className={`px-3 py-2 border text-sm transition-all ${sizesSel.includes(s) ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {allMaterials.length > 0 && (
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-4">Матеріал</p>
          <div className="space-y-2">
            {allMaterials.map((m) => (
              <label key={m} className="flex items-center gap-3 cursor-pointer text-sm text-espresso">
                <input type="checkbox" checked={materialsSel.includes(m)} onChange={() => toggle(materialsSel, setMaterialsSel, m)} className="accent-espresso w-4 h-4" />
                {m}
              </label>
            ))}
          </div>
        </div>
      )}
      {allColors.length > 0 && (
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-4">Колір</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => (
              <button key={c} onClick={() => toggle(colorsSel, setColorsSel, c)} aria-label={c} className={`w-8 h-8 rounded-full border-2 transition-all ${colorsSel.includes(c) ? 'border-espresso scale-110' : 'border-espresso/15'}`} style={{ background: c }} />
            ))}
          </div>
        </div>
      )}
      {allFabrics.length > 0 && (
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-4">Тканина</p>
          <div className="flex flex-wrap gap-2">
            {allFabrics.map((f) => (
              <button key={f} onClick={() => toggle(fabricsSel, setFabricsSel, f)} className={`px-3 py-2 border text-sm transition-all ${fabricsSel.includes(f) ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{f}</button>
            ))}
          </div>
        </div>
      )}
      {hasLifting && (
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-4">Підйомний механізм</p>
          <div className="flex gap-2">
            {[{ v: 'any', l: 'Усі' }, { v: 'yes', l: 'З механізмом' }, { v: 'no', l: 'Без механізму' }].map((o) => (
              <button key={o.v} onClick={() => setLiftingSel(o.v)} className={`px-3 py-2 border text-sm transition-all ${liftingSel === o.v ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{o.l}</button>
            ))}
          </div>
        </div>
      )}
      <label className="flex items-center gap-3 cursor-pointer text-sm text-espresso">
        <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} className="accent-espresso w-4 h-4" />
        Тільки в наявності
      </label>
    </div>
  );

  return (
    <div className="bg-milk min-h-screen">
      <Seo
        title={meta.title}
        description={meta.description}
        canonical={meta.canonical}
        image={cat?.ogImage || cat?.image}
        jsonLd={jsonLd}
        noindex={!indexable}
      />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 md:py-20">
          <nav className="text-xs text-mocha mb-6 flex gap-2 flex-wrap">
            <Link to="/" className="hover:text-espresso">Головна</Link>
            <span>/</span>
            {size ? (
              <>
                <Link to={`/catalog/${category}`} className="hover:text-espresso">{baseMeta.title}</Link>
                <span>/</span>
                <span className="text-espresso">{sizeDisplay}</span>
              </>
            ) : (
              <span className="text-espresso">{baseMeta.title}</span>
            )}
          </nav>

          <Reveal>
            <h1 className="font-heading text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] text-espresso">{meta.h1}</h1>
            <p className="mt-4 max-w-2xl text-mocha text-lg leading-relaxed">{meta.description}</p>
            <p className="mt-3 text-sm text-mocha">{filtered.length} товарів</p>
          </Reveal>

          {/* Size landing chips (internal linking) */}
          {!size && allSizes.length > 1 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <Link key={s} to={`/catalog/${category}/${sizeToSlug(s)}`} className="px-4 py-2 border border-espresso/20 text-sm text-espresso hover:border-espresso hover:bg-espresso hover:text-milk transition-all">
                  {baseMeta.title} {s}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4 border-y border-espresso/10 py-4">
            <button onClick={() => setMobileFilters(true)} className="lg:hidden inline-flex items-center gap-2 text-sm text-espresso">
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.4} /> Фільтри
            </button>
            <div className="hidden lg:block" />
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent border border-espresso/20 pl-4 pr-10 py-2.5 text-sm text-espresso cursor-pointer focus:outline-none focus:border-espresso">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-mocha pointer-events-none" />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <aside className="hidden lg:block lg:col-span-3">
              <Filters />
            </aside>
            <div className="lg:col-span-9">
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-sand animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-mocha py-20 text-center">За обраними фільтрами товарів не знайдено.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </div>

          {/* Category guide & internal linking */}
          <CategoryGuide category={category} cat={cat} size={size} sizeDisplay={sizeDisplay} allSizes={allSizes} />

          {/* FAQ */}
          {faqList.length > 0 && (
            <div className="mt-20 md:mt-28 max-w-3xl">
              <h2 className="font-heading text-3xl text-espresso mb-8">Поширені запитання</h2>
              <div className="divide-y divide-espresso/10 border-t border-b border-espresso/10">
                {faqList.map((f, i) => (
                  <div key={i}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
                      <span className="font-heading text-xl text-espresso">{f.q}</span>
                      {openFaq === i ? <Minus className="w-5 h-5 text-mocha flex-shrink-0" strokeWidth={1.4} /> : <Plus className="w-5 h-5 text-mocha flex-shrink-0" strokeWidth={1.4} />}
                    </button>
                    {openFaq === i && <p className="pb-5 text-mocha leading-relaxed">{f.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Mobile filters */}
      <div className={`fixed inset-0 z-[70] lg:hidden transition-all duration-300 ${mobileFilters ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-espresso/40" onClick={() => setMobileFilters(false)} />
        <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-milk rounded-t-2xl p-6 overflow-y-auto transition-transform duration-300 ${mobileFilters ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-between mb-6">
            <span className="font-heading text-2xl text-espresso">Фільтри</span>
            <button onClick={() => setMobileFilters(false)}><X className="w-6 h-6 text-espresso" strokeWidth={1.4} /></button>
          </div>
          <Filters />
          <button onClick={() => setMobileFilters(false)} className="mt-8 w-full py-4 bg-espresso text-milk text-[12px] tracking-[0.22em] uppercase">Показати {filtered.length}</button>
        </div>
      </div>
    </div>
  );
}