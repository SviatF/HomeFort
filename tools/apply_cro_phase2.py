from pathlib import Path


def replace(path, old, new, label):
    p = Path(path)
    s = p.read_text()
    if old not in s:
        raise SystemExit(f'Missing pattern {label} in {path}')
    p.write_text(s.replace(old, new, 1))

# AppProviders
replace('src/components/AppProviders.jsx',
"import { WishlistProvider } from '@/lib/WishlistContext';",
"import { WishlistProvider } from '@/lib/WishlistContext';\nimport { CompareProvider } from '@/lib/CompareContext';\nimport { RecentlyViewedProvider } from '@/lib/RecentlyViewedContext';",
'app provider imports')
replace('src/components/AppProviders.jsx',
"import ScrollProgress from '@/components/domera/ScrollProgress';",
"import ScrollProgress from '@/components/domera/ScrollProgress';\nimport CompareDrawer from '@/components/domera/CompareDrawer';",
'compare drawer import')
replace('src/components/AppProviders.jsx',
"          <WishlistProvider>\n            <ScrollProgress />\n            {children}\n            <CartDrawer />\n            <Toaster />\n          </WishlistProvider>",
"          <WishlistProvider>\n            <CompareProvider>\n              <RecentlyViewedProvider>\n                <ScrollProgress />\n                {children}\n                <CartDrawer />\n                <CompareDrawer />\n                <Toaster />\n              </RecentlyViewedProvider>\n            </CompareProvider>\n          </WishlistProvider>",
'provider nesting')

# Header compare
replace('src/components/domera/Header.jsx',
"import { useWishlist } from '@/lib/WishlistContext';",
"import { useWishlist } from '@/lib/WishlistContext';\nimport { useCompare } from '@/lib/CompareContext';",
'header compare import')
replace('src/components/domera/Header.jsx',
"  const { count: wishCount } = useWishlist();",
"  const { count: wishCount } = useWishlist();\n  const { count: compareCount, open: openCompare } = useCompare();",
'header compare hook')
replace('src/components/domera/Header.jsx',
"              <button aria-label=\"Порівняти\" className={`hidden sm:block ${hover} transition-colors`}><GitCompare className=\"w-[18px] h-[18px]\" strokeWidth={1.5} /></button>",
"              <button aria-label=\"Порівняти\" onClick={openCompare} className={`hidden sm:block relative ${hover} transition-colors`}><GitCompare className=\"w-[18px] h-[18px]\" strokeWidth={1.5} />{compareCount > 0 && <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${badge} text-[9px] flex items-center justify-center font-medium`}>{compareCount}</span>}</button>",
'header compare button')

# ProductCard compare
replace('src/components/domera/ProductCard.jsx',
"import { Heart, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';",
"import { Heart, ChevronLeft, ChevronRight, ArrowUpRight, GitCompare } from 'lucide-react';",
'product card icon')
replace('src/components/domera/ProductCard.jsx',
"import { useWishlist } from '@/lib/WishlistContext';",
"import { useWishlist } from '@/lib/WishlistContext';\nimport { useCompare } from '@/lib/CompareContext';",
'product card compare import')
replace('src/components/domera/ProductCard.jsx',
"  const inWishlist = has(product.id);",
"  const inWishlist = has(product.id);\n  const compare = useCompare();\n  const inCompare = compare.has(product.id);",
'product card compare hook')
old_btn = '''          <button
            type="button"
            aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: images[0] });
              track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] });
            }}
            className="pointer-events-auto w-10 h-10 bg-milk/92 backdrop-blur-md flex items-center justify-center text-espresso transition-transform hover:scale-105"
          >
            <Heart className="w-[17px] h-[17px]" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.45} />
          </button>'''
new_btn = '''          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              type="button"
              aria-label={inWishlist ? 'Видалити з обраного' : 'Додати в обране'}
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                toggle({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: images[0] });
                track(inWishlist ? 'remove_from_wishlist' : 'add_to_wishlist', { items: [buildItem(product)] });
              }}
              className="w-10 h-10 bg-milk/92 backdrop-blur-md flex items-center justify-center text-espresso transition-transform hover:scale-105"
            ><Heart className="w-[17px] h-[17px]" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.45} /></button>
            <button type="button" aria-label="Порівняти" onClick={(e)=>{e.preventDefault();e.stopPropagation();compare.toggle(product);track(inCompare?'compare_remove':'compare_add',{item_id:product.sku});}} className={`w-10 h-10 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 ${inCompare ? 'bg-espresso text-milk' : 'bg-milk/92 text-espresso'}`}><GitCompare className="w-[17px] h-[17px]" strokeWidth={1.45}/></button>
          </div>'''
replace('src/components/domera/ProductCard.jsx', old_btn, new_btn, 'product card buttons')

# Product phase2
replace('src/screens/Product.jsx',
"import { ProductBenefits, PriceValueBlock, DeliveryPromise, PurchaseSummary, InteriorGallery, ReviewSummary, CompareModels, StickyBuyBar, FloatingConsultation, ReassuranceRow } from '@/components/domera/ProductConversionSections';",
"import { ProductBenefits, PriceValueBlock, DeliveryPromise, PurchaseSummary, InteriorGallery, ReviewSummary, CompareModels, StickyBuyBar, FloatingConsultation, ReassuranceRow } from '@/components/domera/ProductConversionSections';\nimport { DeliveryEstimator, ShareConfiguration, RecentlyViewedRail } from '@/components/domera/CROPhase2Sections';\nimport { useRecentlyViewed } from '@/lib/RecentlyViewedContext';",
'product phase2 imports')
replace('src/screens/Product.jsx',
"  const { has: hasWish, toggle: toggleWish } = useWishlist();",
"  const { has: hasWish, toggle: toggleWish } = useWishlist();\n  const recentlyViewed = useRecentlyViewed();",
'product recent hook')
replace('src/screens/Product.jsx',
"  useEffect(() => {\n    if (product) {\n      track('view_item'",
"  useEffect(() => {\n    if (product) {\n      recentlyViewed.add(product);\n      track('view_item'",
'product recent add')
replace('src/screens/Product.jsx',
"              <ProductBenefits product={product} />\n              <DeliveryPromise product={product} />",
"              <ProductBenefits product={product} />\n              <DeliveryPromise product={product} />\n              <DeliveryEstimator productionTime={product.productionTime} />",
'product delivery estimator')
replace('src/screens/Product.jsx',
"              <PurchaseSummary size={size} fabric={fabric} lifting={lifting} mattress={mattress} mattresses={mattresses} price={livePrice} />",
"              <PurchaseSummary size={size} fabric={fabric} lifting={lifting} mattress={mattress} mattresses={mattresses} price={livePrice} />\n              <ShareConfiguration product={product} size={size} fabric={fabric} lifting={lifting} price={livePrice} />",
'product share')
replace('src/screens/Product.jsx',
"          {/* Upsell */}",
"          <RecentlyViewedRail currentId={product.id} />\n\n          {/* Upsell */}",
'product recently viewed rail')

# Home finder CTA
replace('src/screens/Home.jsx',
"import Bestsellers from '@/components/domera/Bestsellers';",
"import Bestsellers from '@/components/domera/Bestsellers';\nimport SmartFinderCTA from '@/components/domera/SmartFinderCTA';",
'home finder import')
replace('src/screens/Home.jsx',
"        <Bestsellers />\n        <ProductSpotlight />",
"        <Bestsellers />\n        <SmartFinderCTA />\n        <ProductSpotlight />",
'home finder placement')

# Cart drawer progress
replace('src/components/domera/CartDrawer.jsx',
"  const { items, isOpen, close, remove, updateQty, total } = useCart();",
"  const { items, isOpen, close, remove, updateQty, total } = useCart();\n  const freeDeliveryTarget = 30000;\n  const remaining = Math.max(0, freeDeliveryTarget - total);\n  const progress = Math.min(100, (total / freeDeliveryTarget) * 100);",
'cart free delivery state')
replace('src/components/domera/CartDrawer.jsx',
"            <div className=\"border-t border-[#342112]/10 px-6 py-6\">",
"            <div className=\"border-t border-[#342112]/10 px-6 py-6\">\n              <div className=\"mb-5\"><div className=\"flex justify-between text-[11px] mb-2\"><span className=\"text-[#755A44]\">{remaining > 0 ? `До безкоштовної доставки ще ${remaining.toLocaleString('uk-UA')} ₴` : 'Безкоштовна доставка активована ✓'}</span><span className=\"text-[#342112]\">{Math.round(progress)}%</span></div><div className=\"h-1 bg-[#342112]/10\"><div className=\"h-1 bg-[#342112] transition-all\" style={{width:`${progress}%`}} /></div>{remaining > 0 && <Link to=\"/catalog/mattresses\" onClick={close} className=\"mt-3 inline-block text-[10px] uppercase tracking-[0.16em] text-[#937C68] underline underline-offset-4\">Додати матрац або текстиль →</Link>}</div>",
'cart progress')

# Search fallback + finder
replace('src/components/domera/SearchOverlay.jsx',
"const popular = ['Ліжко Lino', 'Матрац Soft Cloud', 'Постільна білизна', 'Подушка Natural'];",
"const popular = ['Soft', 'Seul', 'Bestseller', '160×200', 'ліжко до 15000'];",
'search popular')
replace('src/components/domera/SearchOverlay.jsx',
"      const all = await base44.entities.Product.list('-updated_date', 200);\n      if (!active) return;\n      setResults(searchProducts(all, q, 6));",
"      const [remote, scrapedRes] = await Promise.all([base44.entities.Product.list('-updated_date', 200).catch(()=>[]), fetch('/data/homefort-beds.json').catch(()=>null)]);\n      let scraped = [];\n      try { const data = scrapedRes ? await scrapedRes.json() : {}; scraped = data.products || data.items || []; } catch {}\n      const bySlug = new Map(); [...scraped, ...(remote || [])].forEach((p)=>bySlug.set(p.slug || p.id, p));\n      let all = [...bySlug.values()];\n      const budget = String(q).match(/(?:до|under)?\\s*(\\d{4,6})/i);\n      if (budget) all = all.filter((p)=>Number(p.price||0) <= Number(budget[1]));\n      if (!active) return;\n      setResults(searchProducts(all, q.replace(/(?:до|under)?\\s*\\d{4,6}/i,'').trim() || q, 6));",
'search merged fallback')
replace('src/components/domera/SearchOverlay.jsx',
"              <div className=\"flex flex-wrap gap-2\">",
"              <div className=\"flex flex-wrap gap-2\">",
'search no-op anchor')
replace('src/components/domera/SearchOverlay.jsx',
"              </div>\n            </div>\n          )}",
"              </div>\n              <Link to=\"/bed-finder\" onClick={()=>{track('bed_finder_open',{source:'search'});onClose();}} className=\"mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#342112] border-b border-[#342112]/30 pb-1\">Не знаєте що обрати? Smart Finder →</Link>\n            </div>\n          )}",
'search finder link')

print('CRO Phase 2 patches applied')
