'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from '@/lib/router';
import { Star, Check, Truck, Shield, RotateCcw, ChevronDown, ArrowRight, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, buildItem, trackMeta } from '@/lib/analytics';
import { buildVariantSKU, sizeMatches, sizeToSlug } from '@/lib/variant';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import ProductCard from '@/components/domera/ProductCard';
import ProductGallery from '@/components/domera/ProductGallery';
import FabricSelector from '@/components/domera/FabricSelector';
import ProductDimensions from '@/components/domera/ProductDimensions';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import Seo from '@/components/Seo';
import LeadModal from '@/components/domera/LeadModal';
import { Image } from '@/components/ui/image';
import { ProductBenefits, PriceValueBlock, DeliveryPromise, PurchaseSummary, InteriorGallery, ReviewSummary, CompareModels, StickyBuyBar, FloatingConsultation, ReassuranceRow } from '@/components/domera/ProductConversionSections';
import { DeliveryEstimator, ShareConfiguration, RecentlyViewedRail } from '@/components/domera/CROPhase2Sections';
import { useRecentlyViewed } from '@/lib/RecentlyViewedContext';

const CATEGORY_NAMES = {
  beds: 'Ліжка',
  mattresses: 'Матраци',
  toppers: 'Наматрацники',
  pillows: 'Подушки',
  duvets: 'Ковдри',
  bedding: 'Постільна білизна',
  'kids-mattresses': 'Дитячі матраци',
};

const normalizeProductSize = (value = '') => {
  const raw = String(value).trim().toLowerCase().replace(/\s+/g, '');
  const match = raw.match(/(\d{2,3})\D+(\d{2,3})/);
  if (!match) return String(value).trim();
  return `${Number(match[1])}×${Number(match[2])}`;
};

const uniqueProductSizes = (sizes = []) => {
  const seen = new Set();
  return sizes
    .map(normalizeProductSize)
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
};

export default function Product({ initialProduct = null, initialRelated = [], initialMattresses = [], initialCrossSell = [] } = {}) {
  const { slug } = useParams();
  const [product, setProduct] = useState(initialProduct);
  const [related, setRelated] = useState(initialRelated);
  const [loading, setLoading] = useState(!initialProduct);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(normalizeProductSize(initialProduct?.sizes?.[0] || ''));
  const [color, setColor] = useState(initialProduct?.colors?.[0] || '');
  const [fabric, setFabric] = useState(initialProduct?.fabrics?.[0] || '');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('about');
  const [lifting, setLifting] = useState(false);
  const [mattresses, setMattresses] = useState(initialMattresses);
  const [mattress, setMattress] = useState(null);
  const [lead, setLead] = useState(null);
  const [crossSell, setCrossSell] = useState(initialCrossSell);
  const { add } = useCart();
  const { has: hasWish, toggle: toggleWish } = useWishlist();
  const recentlyViewed = useRecentlyViewed();

  const LIFTING_SURCHARGE = 2400;
  const isBed = product?.category === 'beds';
  const livePrice = useMemo(() => {
    if (!product) return 0;
    let p = product.price;
    if (isBed && lifting) p += LIFTING_SURCHARGE;
    if (mattress) {
      const m = mattresses.find((x) => x.id === mattress);
      if (m) p += m.price;
    }
    return p;
  }, [product, isBed, lifting, mattress, mattresses]);

  const recommendations = useMemo(() => {
    if (!isBed) return related;
    if (!size) return crossSell.slice(0, 3);
    const matched = crossSell.filter((p) => (p.sizes || []).some((s) => sizeMatches(s, size)));
    return (matched.length ? matched : crossSell).slice(0, 3);
  }, [isBed, related, crossSell, size]);

  useEffect(() => {
    if (initialProduct && initialProduct.slug === slug) {
      setProduct(initialProduct);
      setRelated(initialRelated || []);
      setMattresses(initialMattresses || []);
      setCrossSell(initialCrossSell || []);
      setSize(normalizeProductSize(initialProduct.sizes?.[0] || ''));
      setColor(initialProduct.colors?.[0] || '');
      setFabric(initialProduct.fabrics?.[0] || '');
      setLoading(false);
      return;
    }
    setLoading(true);
    base44.entities.Product.filter({ slug })
      .then(async (res) => {
        const p = (res || [])[0];
        setProduct(p);
        if (p) {
          setSize(normalizeProductSize(p.sizes?.[0] || ''));
          setColor(p.colors?.[0] || '');
          setFabric(p.fabrics?.[0] || '');
          setActiveImg(0);
          const rel = await base44.entities.Product.filter({ category: p.category });
          setRelated((rel || []).filter((r) => r.id !== p.id).slice(0, 3));
          if (p.category === 'beds') {
            const [mats, tops, bed, pil] = await Promise.all([
              base44.entities.Product.filter({ category: 'mattresses' }),
              base44.entities.Product.filter({ category: 'toppers' }),
              base44.entities.Product.filter({ category: 'bedding' }),
              base44.entities.Product.filter({ category: 'pillows' }),
            ]);
            setMattresses((mats || []).slice(0, 4));
            setCrossSell([...(mats || []), ...(tops || []), ...(bed || []), ...(pil || [])].filter((r) => r.id !== p.id));
          }
        }
        setMattress(null);
        setLifting(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, initialProduct, initialRelated, initialMattresses, initialCrossSell]);

  useEffect(() => {
    if (product) {
      recentlyViewed.add(product);
      track('view_item', { items: [buildItem(product, { variantSKU: buildVariantSKU(product.sku, { size, color, fabric, lifting: isBed && lifting }), size, color, fabric, price: livePrice })] });
      trackMeta('ViewContent', { currency: 'UAH', value: livePrice, content_name: product.name, content_ids: [product.sku], content_type: 'product' });
    }
  }, [product?.id]);

  if (loading) {
    return (
      <div className="bg-milk min-h-screen">
        <Header />
        <div className="pt-[120px] mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[4/5] bg-sand animate-pulse" />
            <div className="space-y-4"><div className="h-10 bg-sand animate-pulse" /><div className="h-6 w-1/2 bg-sand animate-pulse" /><div className="h-40 bg-sand animate-pulse" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-milk min-h-screen">
        <Header />
        <div className="pt-[140px] pb-32 text-center px-6">
          <h1 className="font-heading text-4xl text-espresso">Товар не знайдено</h1>
          <Link to="/catalog/beds" className="mt-6 inline-block text-mocha underline">Повернутись до каталогу</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAdd = () => {
    const bedUnitPrice = product.price + (isBed && lifting ? LIFTING_SURCHARGE : 0);
    const bedVariantSKU = buildVariantSKU(product.sku, { size, color, fabric, lifting: isBed && lifting });
    const items = [buildItem(product, { variantSKU: bedVariantSKU, size, color, fabric, quantity: qty, price: bedUnitPrice })];
    add({ productId: product.id, variantSKU: bedVariantSKU, slug: product.slug, name: product.name, price: bedUnitPrice, image: product.images[0], size, color, fabric, qty });
    let value = bedUnitPrice * qty;
    if (mattress) {
      const m = mattresses.find((x) => x.id === mattress);
      if (m) {
        const mSKU = buildVariantSKU(m.sku, { size: m.sizes?.[0] });
        items.push(buildItem(m, { variantSKU: mSKU, quantity: 1 }));
        add({ productId: m.id, variantSKU: mSKU, slug: m.slug, name: m.name, price: m.price, image: m.images?.[0], size: m.sizes?.[0] || '', qty: 1 });
        value += m.price;
      }
    }
    track('add_to_cart', { value, items });
    trackMeta('AddToCart', { currency: 'UAH', value, contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity })), content_type: 'product' });
  };

  const tabs = [
    { id: 'about', label: 'Про модель' },
    { id: 'specs', label: 'Характеристики' },
    { id: 'dimensions', label: 'Розміри' },
    { id: 'materials', label: 'Матеріали' },
    { id: 'delivery', label: 'Доставка' },
  ];

  const availMap = { in_stock: 'https://schema.org/InStock', made_to_order: 'https://schema.org/PreOrder', out_of_stock: 'https://schema.org/OutOfStock' };
  const availSchema = availMap[product.availability] || 'https://schema.org/PreOrder';
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.fullDescription || '',
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'DOMERA' },
    offers: {
      '@type': 'Offer',
      url: `https://domera.shop/product/${product.slug}`,
      priceCurrency: 'UAH',
      price: product.price,
      availability: availSchema,
    },
  };
  if (product.reviewsCount > 0) {
    productLd.aggregateRating = { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewsCount };
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: 'https://domera.shop/' },
      { '@type': 'ListItem', position: 2, name: CATEGORY_NAMES[product.category] || product.category, item: `https://domera.shop/catalog/${product.category}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://domera.shop/product/${product.slug}` },
    ],
  };

  return (
    <div className="bg-milk min-h-screen pb-24 lg:pb-0">
      <Seo
        title={product.seoTitle || `${product.name} — купити від ${product.price.toLocaleString('uk-UA')} ₴ | DOMERA`}
        description={product.seoDescription || product.shortDescription || product.fullDescription || ''}
        canonical={product.canonicalUrl || `/product/${product.slug}`}
        image={product.ogImage || product.images?.[0]}
        noindex={product.indexable === false}
        jsonLd={[productLd, breadcrumbLd]}
      />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 md:py-12">
          <nav className="text-xs text-mocha mb-6 flex gap-2 flex-wrap">
            <Link to="/" className="hover:text-espresso">Головна</Link><span>/</span>
            <Link to={`/catalog/${product.category}`} className="hover:text-espresso">{CATEGORY_NAMES[product.category] || product.category}</Link><span>/</span>
            <span className="text-espresso">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Gallery */}
            <div className="lg:col-span-7">
              <ProductGallery key={product.id} images={product.images} videoUrl={product.videoUrl} salePercent={product.salePercent} name={product.imageAlt || product.name} />
            </div>

            {/* Config */}
            <div className="lg:col-span-5">
              {product.reviewsCount > 0 && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-0.5 text-champagne">
                    {[...Array(5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-champagne" strokeWidth={0} />)}
                  </div>
                  <span className="text-sm text-mocha">{product.rating} · {product.reviewsCount} відгуків</span>
                </div>
              )}
              <h1 className="font-heading text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.1] text-espresso">{product.seoH1 || product.name}</h1>
              <p className="text-sm text-mocha mt-2">Артикул: {product.sku}</p>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-heading text-4xl text-espresso">{livePrice.toLocaleString('uk-UA')} ₴</span>
                {product.oldPrice > 0 && <span className="text-lg text-mocha line-through">{product.oldPrice.toLocaleString('uk-UA')} ₴</span>}
              </div>
              <p className="text-sm text-mocha mt-2">або від {Math.round(livePrice / 6).toLocaleString('uk-UA')} ₴/міс без переплат</p>
              <PriceValueBlock price={livePrice} oldPrice={product.oldPrice} salePercent={product.salePercent} />
              {(isBed && lifting) || mattress ? (
                <div className="mt-2 text-xs text-mocha space-y-0.5">
                  {isBed && lifting && <p>· підйомний механізм +{LIFTING_SURCHARGE.toLocaleString('uk-UA')} ₴</p>}
                  {mattress && (() => { const m = mattresses.find((x) => x.id === mattress); return m ? <p key={m.id}>· матрац {m.name} +{m.price.toLocaleString('uk-UA')} ₴</p> : null; })()}
                </div>
              ) : null}

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${product.availability === 'in_stock' ? 'bg-[#C6A17A]' : 'bg-[#937C68]'}`} />
                <span className="text-espresso">{product.availability === 'in_stock' ? 'В наявності' : `Виготовлення: ${product.productionTime}`}</span>
              </div>

              <ProductBenefits product={product} />
              <DeliveryPromise product={product} />
              <DeliveryEstimator productionTime={product.productionTime} />

              {/* Size */}
              {uniqueProductSizes(product.sizes).length > 0 && (
                <div className="mt-7">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-3"><span className="text-champagne mr-2">01</span>Спальне місце</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueProductSizes(product.sizes).map((s) => (
                      <button key={s} onClick={() => { setSize(s); track('select_size', { item_id: product.sku, size: s }); }} className={`px-4 py-2.5 border text-sm transition-all ${size === s ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{s}</button>
                    ))}
                  </div>
                  {size && <Link to={`/catalog/${product.category}/${sizeToSlug(size)}`} className="mt-3 inline-block text-xs text-champagne underline underline-offset-4 hover:text-espresso">Дивитись усі {CATEGORY_NAMES[product.category]?.toLowerCase() || 'товари'} {size} →</Link>}
                </div>
              )}

              {/* Color */}
              {product.colors?.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-3">Колір</p>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((c) => (
                      <button key={c} onClick={() => { setColor(c); track('select_color', { item_id: product.sku, color: c }); }} aria-label={c} className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-espresso scale-110' : 'border-espresso/15'}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Fabric */}
              {product.fabrics?.length > 0 && (
                <>
                  <div className="mt-6"><p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-1"><span className="text-champagne mr-2">02</span>Тканина та колір</p><FabricSelector fabrics={product.fabrics} value={fabric} onChange={(value) => { setFabric(value); track('select_fabric', { item_id: product.sku, fabric: value }); }} /></div>
                  <button onClick={() => setLead('fabric_sample')} className="mt-3 text-xs text-champagne underline underline-offset-4 hover:text-espresso">Замовити зразки тканини →</button>
                </>
              )}

              {/* Lifting mechanism (beds) */}
              {isBed && (
                <div className="mt-6">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-3"><span className="text-champagne mr-2">03</span>Комплектація</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setLifting(true); track('select_mechanism', { item_id: product.sku, mechanism: 'lifting' }); }} className={`flex-1 px-4 py-3 border text-sm flex items-center justify-between transition-all ${lifting ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>
                      З механізмом <span className="text-xs opacity-80">+{LIFTING_SURCHARGE.toLocaleString('uk-UA')} ₴</span>
                    </button>
                    <button onClick={() => { setLifting(false); track('select_mechanism', { item_id: product.sku, mechanism: 'standard' }); }} className={`flex-1 px-4 py-3 border text-sm transition-all ${!lifting ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>
                      Без механізму
                    </button>
                  </div>
                </div>
              )}

              {/* Compatible mattress (beds) */}
              {isBed && mattresses.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-end justify-between gap-4 mb-3"><div><p className="text-[11px] tracking-[0.22em] uppercase text-mocha"><span className="text-champagne mr-2">04</span>Матрац до комплекту</p><p className="text-xs text-mocha mt-1">Один комплект — одна доставка</p></div></div>
                  <div className="space-y-2">
                    <button onClick={() => { setMattress(null); track('add_mattress', { item_id: product.sku, mattress: 'none' }); }} className={`w-full px-4 py-3 border text-sm text-left transition-all ${!mattress ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>
                      Без матраца
                    </button>
                    {mattresses.map((m) => (
                      <button key={m.id} onClick={() => { setMattress(m.id); track('add_mattress', { item_id: product.sku, mattress_id: m.id, mattress_name: m.name, value: m.price }); }} className={`w-full px-4 py-3 border text-sm text-left flex items-center justify-between gap-3 transition-all ${mattress === m.id ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="w-10 h-10 flex-shrink-0 overflow-hidden bg-sand"><Image src={m.images?.[0]} alt="" className="w-full h-full" /></span>
                          <span className="min-w-0"><span className="block truncate">{m.name}</span><span className="block text-xs opacity-70 truncate">{m.shortDescription}</span></span>
                        </span>
                        <span className="flex-shrink-0">+{m.price.toLocaleString('uk-UA')} ₴</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <PurchaseSummary size={size} fabric={fabric} lifting={lifting} mattress={mattress} mattresses={mattresses} price={livePrice} />
              <ShareConfiguration product={product} size={size} fabric={fabric} lifting={lifting} price={livePrice} />

              {/* Qty + Add */}
              <div className="mt-8 flex items-stretch gap-3">
                <div className="flex items-center border border-espresso/20">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 text-espresso hover:bg-espresso/5">−</button>
                  <span className="w-10 text-center text-espresso">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-11 h-12 text-espresso hover:bg-espresso/5">+</button>
                </div>
                <button onClick={handleAdd} className="group flex-1 py-4 bg-espresso text-milk text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-espresso-soft transition-colors">
                  Додати в кошик <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
                </button>
                <button aria-label="В обране" onClick={() => { const inW = hasWish(product.id); toggleWish({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] }); track(inW ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] }); }} className={`w-12 border flex items-center justify-center transition-colors ${hasWish(product.id) ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}><Heart className="w-5 h-5" fill={hasWish(product.id) ? 'currentColor' : 'none'} strokeWidth={1.4} /></button>
              </div>

              <div className="mt-3 flex gap-3">
                <button onClick={() => { track('one_click_open', { item_id: product.sku, value: livePrice, size }); setLead('one_click'); }} className="flex-1 py-3 border border-espresso/25 text-[11px] tracking-[0.18em] uppercase text-espresso hover:bg-espresso hover:text-milk transition-colors">Купити в 1 клік</button>
                <button onClick={() => { track('consultation_open', { item_id: product.sku, source: 'product_buttons' }); setLead('consultation'); }} className="flex-1 py-3 border border-espresso/25 text-[11px] tracking-[0.18em] uppercase text-espresso hover:bg-espresso hover:text-milk transition-colors">Консультація</button>
              </div>

              <ReassuranceRow />
            </div>
          </div>

          {/* Tabs / content */}
          <div className="mt-16 md:mt-24 border-t border-espresso/10 pt-10">
            <div className="flex flex-wrap gap-6 mb-8">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`text-[12px] tracking-[0.18em] uppercase pb-2 border-b-2 transition-colors ${tab === t.id ? 'border-espresso text-espresso' : 'border-transparent text-mocha hover:text-espresso'}`}>{t.label}</button>
              ))}
            </div>
            <div className="max-w-3xl text-mocha leading-relaxed">
              {tab === 'about' && <p>{product.fullDescription}</p>}
              {tab === 'specs' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                    {[
                      ['Артикул', product.sku], ['Категорія', product.category], ['Габарити', product.dimensions], ['Висота', product.height], ['Вага', product.weight],
                      ['Матеріал', product.material], ['Жорсткість', product.hardness], ['Тип пружин', product.springType], ['Навантаження на спальне місце', product.loadPerSleeper],
                      ['Чохол', product.coverMaterial], ['Знімний чохол', product.coverRemovable ? 'Так' : ''], ['Гарантія', product.warranty], ['Термін виготовлення', product.productionTime], ['Сертифікація', product.certifications],
                    ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-espresso/10 py-2"><span className="text-mocha">{k}</span><span className="text-espresso text-right">{v}</span></div>
                    ))}
                  </div>
                  {product.specifications?.length > 0 && (
                    <div>
                      <p className="text-[11px] tracking-[0.22em] uppercase text-mocha mb-3">Додаткові характеристики</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                        {product.specifications.map((s, i) => (
                          <div key={i} className="flex justify-between border-b border-espresso/10 py-2"><span className="text-mocha">{s.label}</span><span className="text-espresso text-right">{s.value}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {tab === 'dimensions' && <ProductDimensions product={product} />}
              {tab === 'materials' && (
                <div className="space-y-6">
                  <p>Матеріали сертифіковані Oeko-Tex Standard 100. {product.material}. Тканини проходять попередню декатировку для збереження форми та кольору.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                    {[
                      ['Матеріал каркаса', product.frameMaterial],
                      ['Тип піни', product.foamType],
                      ['Щільність піни', product.foamDensity],
                      ['Фурнітура', product.hardware],
                      ['Склад тканини', product.fabricComposition],
                      ['Зносостійкість тканини', product.fabricDurability],
                      ['Виробник механізму', product.mechanismManufacturer],
                      ['Матеріал ніжок', product.legsMaterial],
                    ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-espresso/10 py-2"><span className="text-mocha">{k}</span><span className="text-espresso text-right">{v}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'delivery' && <p>Доставка по Україні через Нову Пошту або власною логістикою DOMERA. У великих містах — збірка та підйом. Оплата частинами без переплат на 3–6 платежів.</p>}
            </div>
          </div>

          <InteriorGallery product={product} />
          <ReviewSummary product={product} />
          <CompareModels products={related} />

          <RecentlyViewedRail currentId={product.id} />

          {/* Upsell */}
          {recommendations.length > 0 && (
            <div className="mt-20 md:mt-28">
              <h2 className="font-heading text-[clamp(1.8rem,3.5vw,2.6rem)] text-espresso mb-3">{isBed ? 'Доповніть спальню' : 'Завершіть комплект'}</h2>
              {isBed && size && <p className="text-sm text-mocha mb-8">Підібрано під розмір {size}</p>}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {recommendations.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <LeadModal open={lead !== null} onClose={() => setLead(null)} leadType={lead} product={product} context={{ variantSKU: buildVariantSKU(product?.sku, { size, color, fabric, lifting: isBed && lifting }), configuration: [size, color, fabric, isBed && lifting ? 'підйомний механізм' : ''].filter(Boolean).join(' / '), fabrics: fabric ? [fabric] : [], price: livePrice }} />

      <StickyBuyBar product={product} price={livePrice} size={size} onBuy={handleAdd} onQuickBuy={() => { track('one_click_open', { item_id: product.sku, value: livePrice, size, source: 'sticky' }); setLead('one_click'); }} />
      <FloatingConsultation onClick={() => { track('consultation_open', { item_id: product.sku, source: 'floating' }); setLead('consultation'); }} />
    </div>
  );
}