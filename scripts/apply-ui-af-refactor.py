from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def read(path): return (ROOT / path).read_text(encoding='utf-8')
def write(path, text): (ROOT / path).write_text(text, encoding='utf-8')
def rep(text, old, new, label):
    if old not in text:
        raise SystemExit(f'MISSING PATCH: {label}')
    return text.replace(old, new, 1)

# Product card -> Next image optimizer + scroll memory
p = read('src/components/domera/ProductCard.jsx')
p = rep(p, "import { Image } from '@/components/ui/image';", "import ProductImage from '@/components/domera/ProductImage';", 'card image import')
p = rep(p, "  const goToImage = (step) => {", "  const rememberScroll = () => {\n    try { sessionStorage.setItem(`domera-scroll:${window.location.pathname}`, String(window.scrollY)); } catch {}\n  };\n\n  const goToImage = (step) => {", 'card scroll helper')
p = p.replace("onClick={() => track('select_item', { items: [buildItem(product)] })}", "onClick={() => { rememberScroll(); track('select_item', { items: [buildItem(product)] }); }}")
p = p.replace("<Image src={activeImage} alt={product.imageAlt || product.name} width=\"800\" height=\"1000\" loading=\"lazy\" decoding=\"async\" className=\"w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.018]\" />", "<ProductImage src={activeImage} alt={product.imageAlt || product.name} sizes=\"(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 28vw\" quality={60} className=\"w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.018]\" />")
write('src/components/domera/ProductCard.jsx', p)

# Gallery -> Next image optimizer
p = read('src/components/domera/ProductGallery.jsx')
p = rep(p, "import { Image } from '@/components/ui/image';", "import ProductImage from '@/components/domera/ProductImage';", 'gallery image import')
p = p.replace("<Image src={current.url} alt={name} width=\"1200\" height=\"1500\" loading={active === 0 ? 'eager' : 'lazy'} fetchPriority={active === 0 ? 'high' : 'auto'} decoding=\"async\" className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} style={zoom ? { transform: 'scale(1.7)', transformOrigin: `${pos.x}% ${pos.y}%` } : {}} />", "<ProductImage src={current.url} alt={name} priority={active === 0} sizes=\"(max-width: 1023px) 100vw, 58vw\" quality={72} className={`w-full h-full transition-transform duration-300 ${zoom ? 'scale-[1.7] cursor-zoom-out' : 'cursor-zoom-in'}`} />")
p = p.replace("<Image src={s.url} alt=\"\" width=\"128\" height=\"160\" loading=\"lazy\" decoding=\"async\" className=\"w-full h-full object-cover\" />", "<ProductImage src={s.url} alt=\"\" sizes=\"64px\" quality={60} className=\"w-full h-full\" />")
write('src/components/domera/ProductGallery.jsx', p)

# Product conversion sections: sticky visibility + dimensions/fit block
p = read('src/components/domera/ProductConversionSections.jsx')
p = rep(p, "'use client';\n\nimport", "'use client';\n\nimport { useEffect, useState } from 'react';\nimport", 'conversion react hooks')
p = p.replace("bg-[#F3EEE7]", "bg-ivory")
insert_at = "export function StickyBuyBar({ product, price, size, onBuy, onQuickBuy }) {"
if insert_at not in p: raise SystemExit('MISSING PATCH: sticky function')
delivery = r'''export function DeliveryFitCard({ product }) {
  const values = [
    ['Габарити', product?.dimensions],
    ['Ширина', product?.externalWidth],
    ['Довжина', product?.externalLength],
    ['Висота узголів’я', product?.headboardHeight],
    ['Вага', product?.weight],
  ].filter(([, value]) => value);
  if (!values.length && !product?.technicalDrawing) return null;
  return (
    <div className="delivery-fit-card mt-6">
      <p className="text-[13px] uppercase tracking-[0.12em] text-mocha">Габарити та занесення</p>
      <div className="mt-3 grid sm:grid-cols-2 gap-4 items-start">
        {product?.technicalDrawing && <Image src={product.technicalDrawing} alt={`Габаритне креслення ${product.name}`} className="w-full aspect-[4/3] object-contain bg-milk ui-radius-sm" />}
        <div className="space-y-2">
          {values.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-espresso/10 pb-2 text-[14px]"><span className="text-mocha">{label}</span><strong className="text-espresso text-right">{value}</strong></div>)}
          <p className="pt-2 text-[14px] text-espresso font-semibold">Чи пройде у під’їзд?</p>
          <p className="text-[13px] text-mocha">Звірте ширину найвужчого проходу, дверей і сходового майданчика з габаритами вище. Якщо сумніваєтесь — надішліть заміри менеджеру.</p>
        </div>
      </div>
    </div>
  );
}

'''
p = p.replace(insert_at, delivery + insert_at, 1)
old_sticky = re.search(r"export function StickyBuyBar\(\{ product, price, size, onBuy, onQuickBuy \}\) \{.*?\n\}\n\nexport function FloatingConsultation", p, re.S)
if not old_sticky: raise SystemExit('MISSING PATCH: sticky block')
new_sticky = r'''export function StickyBuyBar({ product, price, size, onBuy, onQuickBuy }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 200);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div data-visible={visible ? 'true' : 'false'} className="mobile-sticky-buy fixed bottom-0 inset-x-0 z-40 bg-milk/95 backdrop-blur-xl border-t border-espresso/10 px-3 md:px-8 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[1440px] flex items-center gap-3 md:gap-7">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-mocha truncate">{size ? `${size} · ${product.name}` : product.name}</p>
          <p className="font-heading text-[24px] md:text-2xl font-extrabold text-espresso">{money(price)} ₴</p>
        </div>
        <button type="button" onClick={onQuickBuy} className="hidden md:block px-6 py-3 border border-espresso/20 ui-radius-sm text-[13px] uppercase text-espresso">В 1 клік</button>
        <button type="button" onClick={onBuy} className="ui-action ui-radius-sm min-w-[132px] sm:min-w-[240px] px-4 md:px-6 text-[13px] uppercase tracking-[0.1em] flex items-center justify-center gap-2">Купити <ArrowRight className="w-4 h-4" strokeWidth={1.4} /></button>
      </div>
    </div>
  );
}

export function FloatingConsultation'''
p = p[:old_sticky.start()] + new_sticky + p[old_sticky.end():]
write('src/components/domera/ProductConversionSections.jsx', p)

# Catalog mobile filters / grid / scroll restore / true anchors
p = read('src/screens/Catalog.jsx')
anchor = "  useEffect(() => {\n    if (!loading && all.length) {"
if anchor not in p: raise SystemExit('MISSING PATCH: catalog analytics effect')
restore = "  useEffect(() => {\n    if (loading || typeof window === 'undefined') return;\n    try {\n      const key = `domera-scroll:${window.location.pathname}`;\n      const saved = Number(sessionStorage.getItem(key) || 0);\n      if (saved > 0) requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: 'auto' }));\n      sessionStorage.removeItem(key);\n    } catch {}\n  }, [loading, category, size]);\n\n"
p = p.replace(anchor, restore + anchor, 1)
p = p.replace('className="grid grid-cols-2 xl:grid-cols-3 gap-x-5 md:gap-x-7 gap-y-12 md:gap-y-16"', 'className="catalog-grid grid grid-cols-2 xl:grid-cols-3 gap-x-5 md:gap-x-7 gap-y-12 md:gap-y-16"')
p = p.replace('className="aspect-[4/5] bg-sand animate-pulse"', 'className="aspect-[4/5] skeleton"')
old_link = "<Link key={slug} to={`/catalog/beds/${slug}`} className=\"text-[12px] text-espresso border-b border-espresso/20 hover:border-espresso transition-colors pb-0.5\">\n                        {item.h1}\n                      </Link>"
new_link = "<a key={slug} href={`/catalog/beds/${slug}`} className=\"text-[13px] text-espresso border-b border-espresso/20 hover:border-espresso transition-colors pb-0.5\">\n                        {item.h1}\n                      </a>"
p = rep(p, old_link, new_link, 'semantic anchors')
overlay_marker = "      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${mobileFilters ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>"
toolbar = "      <div className=\"catalog-mobile-toolbar\" aria-label=\"Фільтри та сортування\">\n        <button type=\"button\" onClick={() => setMobileFilters(true)} className=\"ui-action flex items-center justify-center gap-2 text-[13px] uppercase\"><SlidersHorizontal className=\"w-4 h-4\" />Фільтри{hasActiveFilters ? ' · активні' : ''}</button>\n        <label className=\"ui-radius-sm border border-espresso/15 bg-milk px-2 flex items-center\"><span className=\"sr-only\">Сортування</span><select value={sort} onChange={(e) => setSort(e.target.value)} className=\"w-full min-h-12 bg-transparent text-[13px] text-espresso outline-none\">{sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>\n      </div>\n\n"
p = rep(p, overlay_marker, toolbar + overlay_marker, 'mobile catalog toolbar')
p = p.replace('className="mt-8 w-full py-4 bg-espresso text-milk text-[11px] tracking-[0.18em] uppercase"', 'className="ui-action ui-radius-sm sticky bottom-0 mt-8 w-full py-4 text-[13px] tracking-[0.12em] uppercase"')
write('src/screens/Catalog.jsx', p)

# Header cart count animation
p = read('src/components/domera/Header.jsx')
old = "<span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${badge} text-[9px] flex items-center justify-center font-medium`}>{count}</span>"
new = "<span key={count} className={`cart-count-pop absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${badge} text-[13px] flex items-center justify-center font-medium`}>{count}</span>"
p = rep(p, old, new, 'header cart count')
write('src/components/domera/Header.jsx', p)

# Product PDP
p = read('src/screens/Product.jsx')
p = p.replace('StickyBuyBar, FloatingConsultation, ReassuranceRow', 'StickyBuyBar, FloatingConsultation, ReassuranceRow, DeliveryFitCard')
p = rep(p, "  const recentlyViewed = useRecentlyViewed();", "  const recentlyViewed = useRecentlyViewed();\n  const [priceFlash, setPriceFlash] = useState(false);", 'product price state')
recommend_end = "  }, [isBed, related, crossSell, size]);\n\n"
compatible = "  const compatibleMattresses = useMemo(() => {\n    if (!size) return mattresses;\n    const matched = mattresses.filter((m) => (m.sizes || []).some((s) => sizeMatches(s, size)));\n    return matched.length ? matched : mattresses;\n  }, [mattresses, size]);\n\n"
p = rep(p, recommend_end, recommend_end + compatible, 'compatible mattresses')
view_effect = "  useEffect(() => {\n    if (product) {\n      recentlyViewed.add(product);"
sync_effects = "  useEffect(() => {\n    if (!product || typeof window === 'undefined') return;\n    const params = new URLSearchParams(window.location.search);\n    const querySize = params.get('size');\n    const queryFabric = params.get('fabric');\n    const queryLift = params.get('lifting');\n    if (querySize && uniqueProductSizes(product.sizes || []).some((s) => sizeMatches(s, querySize))) setSize(normalizeProductSize(querySize));\n    if (queryFabric && (product.fabrics || []).some((f) => (typeof f === 'string' ? f : f?.name) === queryFabric)) setFabric(queryFabric);\n    if (queryLift === '1') setLifting(true);\n  }, [product?.id]);\n\n  useEffect(() => {\n    if (!product || typeof window === 'undefined') return;\n    const url = new URL(window.location.href);\n    if (size) url.searchParams.set('size', size); else url.searchParams.delete('size');\n    if (fabric) url.searchParams.set('fabric', fabric); else url.searchParams.delete('fabric');\n    if (lifting) url.searchParams.set('lifting', '1'); else url.searchParams.delete('lifting');\n    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);\n  }, [product?.id, size, fabric, lifting]);\n\n  useEffect(() => {\n    if (!product) return;\n    setPriceFlash(true); const timer = setTimeout(() => setPriceFlash(false), 200);\n    return () => clearTimeout(timer);\n  }, [livePrice]);\n\n"
p = rep(p, view_effect, sync_effects + view_effect, 'product URL and price effects')
p = p.replace('className="aspect-[4/5] bg-sand animate-pulse"', 'className="aspect-[4/5] skeleton"')
p = p.replace('className="h-10 bg-sand animate-pulse"', 'className="h-10 skeleton"').replace('className="h-6 w-1/2 bg-sand animate-pulse"', 'className="h-6 w-1/2 skeleton"').replace('className="h-40 bg-sand animate-pulse"', 'className="h-40 skeleton"')
p = p.replace('<nav className="text-xs text-mocha mb-6 flex gap-2 flex-wrap">', '<nav className="pdp-breadcrumb text-[13px] text-mocha mb-4 md:mb-6 flex gap-2 flex-wrap">')
p = rep(p, '<ProductGallery key={product.id} images={product.images} videoUrl={product.videoUrl} salePercent={product.salePercent} name={product.imageAlt || product.name} />', '<ProductGallery key={product.id} images={product.images} videoUrl={product.videoUrl} salePercent={product.salePercent} name={product.imageAlt || product.name} activeIndex={activeImg} onActiveChange={setActiveImg} />', 'controlled gallery')
old_head = "              {product.reviewsCount > 0 && (\n                <div className=\"flex items-center gap-3 mb-3\">\n                  <div className=\"flex gap-0.5 text-champagne\">\n                    {[...Array(5)].map((_, k) => <Star key={k} className=\"w-4 h-4 fill-champagne\" strokeWidth={0} />)}\n                  </div>\n                  <span className=\"text-sm text-mocha\">{product.rating} · {product.reviewsCount} відгуків</span>\n                </div>\n              )}\n              <h1 className=\"font-heading text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.1] text-espresso\">{product.seoH1 || product.name}</h1>\n              <p className=\"text-sm text-mocha mt-2\">Артикул: {product.sku}</p>"
new_head = "              <h1 className=\"font-heading text-[clamp(1.7rem,3.5vw,2.8rem)] leading-[1.06] text-espresso\">{product.seoH1 || product.name}</h1>\n              {product.reviewsCount > 0 && (\n                <div className=\"flex items-center gap-3 mt-2\">\n                  <div className=\"flex gap-0.5 text-champagne\">{[...Array(5)].map((_, k) => <Star key={k} className=\"w-4 h-4 fill-champagne\" strokeWidth={0} />)}</div>\n                  <span className=\"text-[13px] text-mocha\">{product.rating} · {product.reviewsCount} відгуків</span>\n                </div>\n              )}\n              <p className=\"text-[13px] text-mocha mt-2\">Артикул: {buildVariantSKU(product.sku, { size, color, fabric, lifting: isBed && lifting })}</p>"
p = rep(p, old_head, new_head, 'mobile PDP order')
p = p.replace('<span className="font-heading text-4xl text-espresso">{livePrice.toLocaleString(\'uk-UA\')} ₴</span>', '<span className={`font-heading text-4xl font-extrabold text-espresso px-1 -mx-1 ${priceFlash ? \'price-updated\' : \'\'}`}>{livePrice.toLocaleString(\'uk-UA\')} ₴</span>')
old_av = "              <div className=\"mt-3 flex items-center gap-2 text-sm\">\n                <span className={`w-2 h-2 rounded-full ${product.availability === 'in_stock' ? 'bg-[#C6A17A]' : 'bg-[#937C68]'}`} />\n                <span className=\"text-espresso\">{product.availability === 'in_stock' ? 'В наявності' : `Виготовлення: ${product.productionTime}`}</span>\n              </div>"
new_av = "              <div className=\"mt-3\"><span className=\"product-status-badge\">{product.availability === 'in_stock' ? 'В наявності' : product.productionTime ? `Виготовлення ${product.productionTime}` : 'Під замовлення'}</span></div>"
p = rep(p, old_av, new_av, 'availability badge')
p = p.replace("className={`px-4 py-2.5 border text-sm transition-all ${size === s ?", "className={`ui-radius-sm min-h-12 px-4 py-2.5 border text-sm transition-all ${size === s ?")
p = rep(p, "<FabricSelector fabrics={product.fabrics} value={fabric} onChange={(value) => { setFabric(value); track('select_fabric', { item_id: product.sku, fabric: value }); }} />", "<FabricSelector fabrics={product.fabrics} value={fabric} onChange={(value, index) => { setFabric(value); setActiveImg(Math.min(index + (product.videoUrl ? 1 : 0), Math.max(0, (product.images || []).length - 1))); track('select_fabric', { item_id: product.sku, fabric: value }); }} />", 'fabric gallery change')
p = p.replace('{isBed && mattresses.length > 0 && (', '{isBed && compatibleMattresses.length > 0 && (')
p = p.replace('<div className="mt-6">\n                  <div className="flex items-end justify-between gap-4 mb-3"><div><p className="text-[11px] tracking-[0.22em] uppercase text-mocha"><span className="text-champagne mr-2">04</span>Матрац до комплекту</p><p className="text-xs text-mocha mt-1">Один комплект — одна доставка</p></div></div>', '<div className="ui-radius-md mt-6 bg-espresso text-milk p-4 md:p-5">\n                  <div className="flex items-end justify-between gap-4 mb-3"><div><p className="text-[13px] tracking-[0.12em] uppercase text-milk/60"><span className="text-champagne mr-2">04</span>Комплект з матрацом</p><p className="text-[13px] text-milk/70 mt-1">Показуємо тільки сумісні з розміром {size || \'ліжка\'}</p></div></div>')
p = p.replace('{mattresses.map((m) => (', '{compatibleMattresses.map((m) => (')
p = p.replace("mattress === m.id ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'", "mattress === m.id ? 'border-milk bg-milk text-espresso' : 'border-milk/20 text-milk hover:border-milk/60'")
p = p.replace("!mattress ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'", "!mattress ? 'border-milk bg-milk text-espresso' : 'border-milk/20 text-milk hover:border-milk/60'")
p = p.replace('<span className="flex-shrink-0">+{m.price.toLocaleString(\'uk-UA\')} ₴</span>', '<span className="flex-shrink-0 text-right">+{m.price.toLocaleString(\'uk-UA\')} ₴{m.oldPrice > m.price && <small className="block text-[13px] text-champagne">Економія {(m.oldPrice - m.price).toLocaleString(\'uk-UA\')} ₴</small>}</span>')
p = p.replace('matrress={mattress}', 'matrress={mattress}')
p = p.replace('mattresses={mattresses} price={livePrice}', 'mattresses={compatibleMattresses} price={livePrice}')
p = p.replace('className="group flex-1 py-4 bg-espresso text-milk text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-espresso-soft transition-colors"', 'className="ui-action ui-radius-sm group flex-1 py-4 text-[13px] tracking-[0.12em] uppercase flex items-center justify-center gap-2"')
# replace long tabs area with readable intro + accordions
start = p.find('          {/* Tabs / content */}')
end = p.find('          <InteriorGallery product={product} />', start)
if start < 0 or end < 0: raise SystemExit('MISSING PATCH: product long content area')
new_content = r'''          {/* Compact long-form content */}
          <section className="mt-14 md:mt-20 border-t border-espresso/10 pt-8">
            <div className="max-w-[780px] space-y-4">
              {formatProductDescription(product.fullDescription || product.shortDescription).slice(0, 3).map((paragraph, index) => (
                <p key={index} className={`leading-[1.75] ${index === 0 ? 'text-[18px] text-espresso' : 'text-[16px] text-mocha'}`}>{paragraph}</p>
              ))}
            </div>
            <DeliveryFitCard product={product} />
            <div className="product-accordion mt-8 max-w-4xl">
              <details><summary>Характеристики <span aria-hidden="true">＋</span></summary><div><ProductDimensions product={product} /><div className="mt-5 grid sm:grid-cols-2 gap-x-10 gap-y-2">{[
                ['Артикул', buildVariantSKU(product.sku, { size, color, fabric, lifting: isBed && lifting })], ['Габарити', product.dimensions], ['Вага', product.weight], ['Матеріал', product.material], ['Гарантія', product.warranty], ['Термін виготовлення', product.productionTime]
              ].filter(([,v]) => v).map(([k,v]) => <div key={k} className="flex justify-between gap-4 border-b border-espresso/10 py-2"><span>{k}</span><strong className="text-espresso text-right">{v}</strong></div>)}</div></div></details>
              <details><summary>Доставка <span aria-hidden="true">＋</span></summary><div>Доставка по Україні. Точний спосіб, вартість, підйом і збірку менеджер підтвердить разом із конфігурацією замовлення.</div></details>
              <details><summary>Гарантія <span aria-hidden="true">＋</span></summary><div>{product.warranty ? `Гарантія: ${product.warranty}.` : 'Умови гарантії та сервісу підтверджуються для конкретної комплектації перед оформленням.'}</div></details>
            </div>
          </section>

'''
p = p[:start] + new_content + p[end:]
write('src/screens/Product.jsx', p)

print('A-F refactor patches applied successfully')
