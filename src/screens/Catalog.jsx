'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from '@/lib/router';
import { SlidersHorizontal, ChevronDown, X, Plus, Minus, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, buildItem } from '@/lib/analytics';
import { sizeToSlug, sizeMatches } from '@/lib/variant';
import { BED_SEMANTIC_LANDINGS } from '@/lib/bed-semantic-core';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import ProductCard from '@/components/domera/ProductCard';
import Reveal from '@/components/domera/Reveal';
import Seo from '@/components/Seo';
import CategoryGuide from '@/components/domera/CategoryGuide';

const fallbackTitles = {
  beds: { title: 'Ліжка', intro: 'М’які ліжка Homefort у каталозі DOMERA: моделі з різними розмірами, комплектаціями та підйомним механізмом.' },
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
  { value: 'price-asc', label: 'Від дешевших' },
  { value: 'price-desc', label: 'Від дорожчих' },
  { value: 'rating', label: 'За рейтингом' },
];

function normalizeSize(value = '') {
  const match = String(value)
    .toLowerCase()
    .replace(/см/g, '')
    .replace(/[xх×]/g, '×')
    .replace(/\s+/g, '')
    .match(/(\d{2,3})×(\d{2,3})/);
  return match ? `${match[1]}×${match[2]}` : String(value).trim();
}

export default function Catalog({ initialProducts = null, initialCategory = null } = {}) {
  const { category, size: rawRouteSize } = useParams();
  const size = rawRouteSize && /^\d{2,3}(?:x|х|×)\d{2,3}$/i.test(String(rawRouteSize)) ? rawRouteSize : '';
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
    if (category === 'beds') {
      fetch('/data/homefort-beds.json', { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('catalog fetch failed')))
        .then((payload) => {
          setAll(Array.isArray(payload?.products) ? payload.products : []);
          setCat({
            key: 'beds',
            name: 'Ліжка',
            h1: 'Ліжка',
            seoTitle: 'Ліжка купити в Україні — ціни та фото | DOMERA',
            seoDescription: fallbackTitles.beds.intro,
            seoIntro: fallbackTitles.beds.intro,
            canonicalUrl: '/catalog/beds',
            indexable: true,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
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
    }
    setSizesSel([]); setMaterialsSel([]); setOnlyStock(false); setPriceMax(60000);
    setColorsSel([]); setFabricsSel([]); setLiftingSel('any');
  }, [category, initialProducts, initialCategory]);

  const allSizes = useMemo(() => {
    const values = all.flatMap((p) => (p.sizes || []).map(normalizeSize)).filter(Boolean);
    return [...new Set(values)].sort((a, b) => {
      const [aw = 0, al = 0] = a.split('×').map(Number);
      const [bw = 0, bl = 0] = b.split('×').map(Number);
      return aw - bw || al - bl;
    });
  }, [all]);
  const allMaterials = useMemo(() => [...new Set(all.map((p) => p.material).filter(Boolean))], [all]);
  const allColors = useMemo(() => [...new Set(all.flatMap((p) => p.colors || []))], [all]);
  const allFabrics = useMemo(() => [...new Set(all.flatMap((p) => p.fabrics || []))], [all]);
  const hasLifting = useMemo(() => all.some((p) => p.liftingMechanism), [all]);
  const maxPrice = useMemo(() => Math.max(60000, ...all.map((p) => p.price || 0)), [all]);

  const sizeDisplay = useMemo(() => {
    if (!size) return '';
    const p = all.find((pp) => (pp.sizes || []).some((s) => sizeMatches(s, size)));
    const s = p?.sizes?.find((x) => sizeMatches(x, size));
    return normalizeSize(s || size);
  }, [all, size]);

  const filtered = useMemo(() => {
    let list = size ? all.filter((p) => (p.sizes || []).some((s) => sizeMatches(s, size))) : all;
    list = list.filter((p) => p.price <= priceMax);
    if (sizesSel.length) {
      list = list.filter((p) => (p.sizes || []).some((s) => sizesSel.includes(normalizeSize(s))));
    }
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

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;
    try {
      const key = `domera-scroll:${window.location.pathname}`;
      const saved = Number(sessionStorage.getItem(key) || 0);
      if (saved > 0) requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: 'auto' }));
      sessionStorage.removeItem(key);
    } catch {}
  }, [loading, category, size]);

  useEffect(() => {
    if (!loading && all.length) {
      track('view_item_list', {
        item_list_id: size ? `${category}-${sizeToSlug(size)}` : category,
        item_list_name: meta.title,
        items: filtered.map((p) => buildItem(p)),
      });
    }
  }, [loading, category, size]);

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
  const faqLd = faqList.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a || '' },
    })),
  } : null;

  const jsonLd = [breadcrumbLd, collectionLd, ...(faqLd ? [faqLd] : [])];
  const indexable = cat ? cat.indexable !== false : true;
  const toggle = (arr, set, value) => set(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  const hasActiveFilters = priceMax < maxPrice || sizesSel.length || materialsSel.length || colorsSel.length || fabricsSel.length || liftingSel !== 'any' || onlyStock;
  const resetFilters = () => {
    setPriceMax(maxPrice);
    setSizesSel([]);
    setMaterialsSel([]);
    setColorsSel([]);
    setFabricsSel([]);
    setLiftingSel('any');
    setOnlyStock(false);
  };

  const Filters = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha">Бюджет до</p>
          <span className="font-heading text-lg text-espresso">{priceMax.toLocaleString('uk-UA')} ₴</span>
        </div>
        <input type="range" min="1000" max={maxPrice} step="500" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-espresso" />
      </div>

      {!size && allSizes.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha mb-4">Спальне місце</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button key={s} onClick={() => toggle(sizesSel, setSizesSel, s)} className={`px-3 py-2 border text-[12px] transition-all ${sizesSel.includes(s) ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 text-espresso hover:border-espresso/50'}`}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {allMaterials.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha mb-4">Матеріал</p>
          <div className="space-y-2.5">
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
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha mb-4">Колір</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => <button key={c} onClick={() => toggle(colorsSel, setColorsSel, c)} aria-label={c} className={`w-8 h-8 rounded-full border-2 transition-all ${colorsSel.includes(c) ? 'border-espresso scale-110' : 'border-espresso/15'}`} style={{ background: c }} />)}
          </div>
        </div>
      )}

      {allFabrics.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha mb-4">Тканина</p>
          <div className="flex flex-wrap gap-2">
            {allFabrics.map((f) => <button key={f} onClick={() => toggle(fabricsSel, setFabricsSel, f)} className={`px-3 py-2 border text-sm transition-all ${fabricsSel.includes(f) ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{f}</button>)}
          </div>
        </div>
      )}

      {hasLifting && (
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-mocha mb-4">Підйомний механізм</p>
          <div className="flex flex-wrap gap-2">
            {[{ v: 'any', l: 'Усі' }, { v: 'yes', l: 'Є' }, { v: 'no', l: 'Без' }].map((o) => (
              <button key={o.v} onClick={() => setLiftingSel(o.v)} className={`px-3 py-2 border text-[12px] transition-all ${liftingSel === o.v ? 'border-espresso bg-espresso text-milk' : 'border-espresso/15 text-espresso hover:border-espresso/50'}`}>{o.l}</button>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer text-sm text-espresso">
        <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} className="accent-espresso w-4 h-4" />
        Тільки в наявності
      </label>

      {hasActiveFilters && (
        <button onClick={resetFilters} className="inline-flex items-center gap-2 text-[10px] tracking-[0.16em] uppercase text-mocha hover:text-espresso transition-colors">
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.4} /> Скинути фільтри
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-milk min-h-screen">
      <Seo title={meta.title} description={meta.description} canonical={meta.canonical} image={cat?.ogImage || cat?.image} jsonLd={jsonLd} noindex={!indexable} />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-12 py-10 md:py-16">
          <nav className="text-[11px] text-mocha mb-8 flex gap-2 flex-wrap tracking-[0.04em]">
            <Link to="/" className="hover:text-espresso">Головна</Link>
            <span>/</span>
            {size ? <><Link to={`/catalog/${category}`} className="hover:text-espresso">{baseMeta.title}</Link><span>/</span><span className="text-espresso">{sizeDisplay}</span></> : <span className="text-espresso">{baseMeta.title}</span>}
          </nav>

          <Reveal>
            <div className="grid lg:grid-cols-[1fr_0.75fr] gap-8 lg:gap-16 items-end border-b border-espresso/10 pb-10 md:pb-14">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-mocha mb-4">DOMERA COLLECTION</p>
                <h1 className="font-heading text-[clamp(3rem,6vw,5.4rem)] leading-[0.96] tracking-[-0.025em] text-espresso">{meta.h1}</h1>
              </div>
              <div className="lg:pb-1">
                <p className="max-w-xl text-mocha text-base md:text-lg leading-relaxed">{meta.description}</p>
                <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-mocha">
                  <span className="text-espresso font-semibold">{filtered.length}</span><span>моделей у колекції</span>
                </div>
              </div>
            </div>
          </Reveal>

          {!size && allSizes.length > 1 && (
            <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[10px] tracking-[0.18em] uppercase text-mocha whitespace-nowrap mr-2">Популярні розміри</span>
              {allSizes.slice(0, 8).map((s) => (
                <Link key={s} to={`/catalog/${category}/${sizeToSlug(s)}`} className="whitespace-nowrap px-3.5 py-2 border border-espresso/15 text-[11px] text-espresso hover:border-espresso hover:bg-espresso hover:text-milk transition-all">
                  {s}
                </Link>
              ))}
            </div>
          )}

          {!size && category === 'beds' && (
            <div className="mt-5 border-t border-espresso/10 pt-5">
              <div className="flex items-start gap-4 flex-col lg:flex-row lg:items-center">
                <span className="text-[10px] tracking-[0.18em] uppercase text-mocha whitespace-nowrap">Популярні категорії</span>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {Object.entries(BED_SEMANTIC_LANDINGS)
                    .filter(([, item]) => item.priority === 1)
                    .slice(0, 9)
                    .map(([slug, item]) => (
                      <a key={slug} href={`/catalog/beds/${slug}`} className="text-[13px] text-espresso border-b border-espresso/20 hover:border-espresso transition-colors pb-0.5">
                        {item.h1}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between gap-4 border-y border-espresso/10 py-3.5">
            <button onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-espresso">
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.35} /> Фільтри
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-clay" />}
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-[11px] text-mocha">{filtered.length} товарів</span>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent pr-7 py-1.5 text-[11px] uppercase tracking-[0.1em] text-espresso cursor-pointer focus:outline-none">
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 text-mocha pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] gap-10 xl:gap-14 items-start">
            <aside className="hidden lg:block sticky top-[104px] pr-2">
              <Filters />
            </aside>
            <div>
              {loading ? (
                <div className="catalog-grid grid grid-cols-2 xl:grid-cols-3 gap-x-5 md:gap-x-7 gap-y-12 md:gap-y-16">
                  {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] skeleton" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-24 text-center border-y border-espresso/10">
                  <p className="font-heading text-3xl text-espresso">Нічого не знайдено</p>
                  <p className="mt-2 text-sm text-mocha">Спробуйте змінити параметри вибору.</p>
                  <button onClick={resetFilters} className="mt-6 text-[10px] uppercase tracking-[0.16em] border-b border-espresso/40 pb-1 text-espresso">Скинути фільтри</button>
                </div>
              ) : (
                <div className="catalog-grid grid grid-cols-2 xl:grid-cols-3 gap-x-5 md:gap-x-7 gap-y-12 md:gap-y-16">
                  {filtered.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}
                </div>
              )}
            </div>
          </div>

          <CategoryGuide category={category} cat={cat} size={size} sizeDisplay={sizeDisplay} allSizes={allSizes} />

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

      <div className="catalog-mobile-toolbar" aria-label="Фільтри та сортування">
        <button type="button" onClick={() => setMobileFilters(true)} className="ui-action flex items-center justify-center gap-2 text-[13px] uppercase"><SlidersHorizontal className="w-4 h-4" />Фільтри{hasActiveFilters ? ' · активні' : ''}</button>
        <label className="ui-radius-sm border border-espresso/15 bg-milk px-2 flex items-center"><span className="sr-only">Сортування</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full min-h-12 bg-transparent text-[13px] text-espresso outline-none">{sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      </div>

      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${mobileFilters ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-espresso/45 backdrop-blur-[2px]" onClick={() => setMobileFilters(false)} />
        <div className={`absolute bottom-0 left-0 right-0 lg:left-auto lg:top-0 lg:w-[420px] max-h-[88vh] lg:max-h-none lg:h-full bg-milk rounded-t-2xl lg:rounded-none p-6 md:p-8 overflow-y-auto transition-transform duration-300 ${mobileFilters ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-espresso/10">
            <div><span className="font-heading text-3xl text-espresso">Фільтри</span><p className="mt-1 text-xs text-mocha">Знайдіть модель під вашу спальню</p></div>
            <button onClick={() => setMobileFilters(false)}><X className="w-6 h-6 text-espresso" strokeWidth={1.4} /></button>
          </div>
          <Filters />
          <button onClick={() => setMobileFilters(false)} className="ui-action ui-radius-sm sticky bottom-0 mt-8 w-full py-4 text-[13px] tracking-[0.12em] uppercase">Показати {filtered.length} моделей</button>
        </div>
      </div>
    </div>
  );
}
