from pathlib import Path

p = Path('src/screens/Product.jsx')
s = p.read_text()

def rep(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'Missing Product pattern: {label}')
    s = s.replace(old, new, 1)

rep("import { Image } from '@/components/ui/image';", "import { Image } from '@/components/ui/image';\nimport { ProductBenefits, PriceValueBlock, DeliveryPromise, PurchaseSummary, InteriorGallery, ReviewSummary, CompareModels, StickyBuyBar, FloatingConsultation, ReassuranceRow } from '@/components/domera/ProductConversionSections';", 'CRO import')
rep("              <p className=\"text-sm text-mocha mt-2\">або від {Math.round(livePrice / 6).toLocaleString('uk-UA')} ₴/міс без переплат</p>", "              <p className=\"text-sm text-mocha mt-2\">або від {Math.round(livePrice / 6).toLocaleString('uk-UA')} ₴/міс без переплат</p>\n              <PriceValueBlock price={livePrice} oldPrice={product.oldPrice} salePercent={product.salePercent} />", 'saving')
rep("              <p className=\"mt-6 text-mocha leading-relaxed\">{product.shortDescription}</p>", "              <ProductBenefits product={product} />\n              <DeliveryPromise product={product} />", 'short description')
rep("<p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha mb-3\">Розмір</p>", "<p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha mb-3\"><span className=\"text-champagne mr-2\">01</span>Спальне місце</p>", 'size heading')
rep("<button key={s} onClick={() => setSize(s)} className={`px-4 py-2.5 border text-sm transition-all ${size === s ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{s}</button>", "<button key={s} onClick={() => { setSize(s); track('select_size', { item_id: product.sku, size: s }); }} className={`px-4 py-2.5 border text-sm transition-all ${size === s ? 'border-espresso bg-espresso text-milk' : 'border-espresso/20 text-espresso hover:border-espresso'}`}>{s}</button>", 'size event')
rep("<button key={c} onClick={() => setColor(c)} aria-label={c}", "<button key={c} onClick={() => { setColor(c); track('select_color', { item_id: product.sku, color: c }); }} aria-label={c}", 'color event')
rep("<FabricSelector fabrics={product.fabrics} value={fabric} onChange={setFabric} />", "<div className=\"mt-6\"><p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha mb-1\"><span className=\"text-champagne mr-2\">02</span>Тканина та колір</p><FabricSelector fabrics={product.fabrics} value={fabric} onChange={(value) => { setFabric(value); track('select_fabric', { item_id: product.sku, fabric: value }); }} /></div>", 'fabric')
rep("<p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha mb-3\">Підйомний механізм</p>", "<p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha mb-3\"><span className=\"text-champagne mr-2\">03</span>Комплектація</p>", 'mechanism heading')
rep("<button onClick={() => setLifting(true)}", "<button onClick={() => { setLifting(true); track('select_mechanism', { item_id: product.sku, mechanism: 'lifting' }); }}", 'lifting true')
rep("<button onClick={() => setLifting(false)}", "<button onClick={() => { setLifting(false); track('select_mechanism', { item_id: product.sku, mechanism: 'standard' }); }}", 'lifting false')
rep("<p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha mb-3\">Сумісний матрац</p>", "<div className=\"flex items-end justify-between gap-4 mb-3\"><div><p className=\"text-[11px] tracking-[0.22em] uppercase text-mocha\"><span className=\"text-champagne mr-2\">04</span>Матрац до комплекту</p><p className=\"text-xs text-mocha mt-1\">Один комплект — одна доставка</p></div></div>", 'mattress heading')
rep("<button onClick={() => setMattress(null)}", "<button onClick={() => { setMattress(null); track('add_mattress', { item_id: product.sku, mattress: 'none' }); }}", 'mattress none')
rep("<button key={m.id} onClick={() => setMattress(m.id)}", "<button key={m.id} onClick={() => { setMattress(m.id); track('add_mattress', { item_id: product.sku, mattress_id: m.id, mattress_name: m.name, value: m.price }); }}", 'mattress event')
rep("              {/* Qty + Add */}", "              <PurchaseSummary size={size} fabric={fabric} lifting={lifting} mattress={mattress} mattresses={mattresses} price={livePrice} />\n\n              {/* Qty + Add */}", 'summary')
rep("<button onClick={() => setLead('one_click')} className=\"flex-1 py-3", "<button onClick={() => { track('one_click_open', { item_id: product.sku, value: livePrice, size }); setLead('one_click'); }} className=\"flex-1 py-3", 'one click tracking')
rep("<button onClick={() => setLead('consultation')} className=\"flex-1 py-3", "<button onClick={() => { track('consultation_open', { item_id: product.sku, source: 'product_buttons' }); setLead('consultation'); }} className=\"flex-1 py-3", 'consult tracking')
old_trust = '''              {/* Trust row */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-espresso/10 pt-6 text-sm text-mocha">
                <div className="flex flex-col items-center text-center gap-1"><Truck className="w-5 h-5 text-mocha" strokeWidth={1.4} /> Доставка по Україні</div>
                <div className="flex flex-col items-center text-center gap-1"><Shield className="w-5 h-5 text-mocha" strokeWidth={1.4} /> Гарантія {product.warranty}</div>
                <div className="flex flex-col items-center text-center gap-1"><RotateCcw className="w-5 h-5 text-mocha" strokeWidth={1.4} /> Trade-In</div>
              </div>'''
rep(old_trust, "              <ReassuranceRow />", 'trust row')
rep("          {/* Upsell */}", "          <InteriorGallery product={product} />\n          <ReviewSummary product={product} />\n          <CompareModels products={related} />\n\n          {/* Upsell */}", 'content sections')
old_sticky = '''      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-milk/95 backdrop-blur border-t border-espresso/12 px-5 py-3 flex items-center justify-between gap-4 shadow-elevated">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase text-mocha">DOMERA</p>
          <p className="font-heading text-xl text-espresso">{livePrice.toLocaleString('uk-UA')} ₴</p>
          {isBed && !mattress && <p className="text-[10px] text-champagne truncate">＋ сумісний матрац</p>}
        </div>
        <button onClick={handleAdd} className="flex-1 max-w-[220px] py-3.5 bg-espresso text-milk text-[11px] tracking-[0.22em] uppercase">Купити</button>
      </div>'''
new_sticky = '''      <StickyBuyBar product={product} price={livePrice} size={size} onBuy={handleAdd} onQuickBuy={() => { track('one_click_open', { item_id: product.sku, value: livePrice, size, source: 'sticky' }); setLead('one_click'); }} />
      <FloatingConsultation onClick={() => { track('consultation_open', { item_id: product.sku, source: 'floating' }); setLead('consultation'); }} />'''
rep(old_sticky, new_sticky, 'sticky CTA')
p.write_text(s)

p = Path('src/screens/Checkout.jsx')
c = p.read_text()
if "import { useEffect, useMemo, useState } from 'react';" in c:
    c = c.replace("import { useEffect, useMemo, useState } from 'react';", "import { useEffect, useMemo, useRef, useState } from 'react';", 1)
marker = "  const [contact, setContact] = useState({ name: '', phone: '', email: '' });"
if marker not in c:
    raise SystemExit('Missing checkout contact state')
c = c.replace(marker, marker + "\n  const phoneTracked = useRef(false);", 1)
marker2 = "  useEffect(() => {\n    base44.auth.me().then((u) => {"
effect = "  useEffect(() => {\n    if (!phoneTracked.current && String(contact.phone || '').replace(/\\D/g, '').length >= 9) {\n      phoneTracked.current = true;\n      track('checkout_phone_entered', { value: grandTotal });\n    }\n  }, [contact.phone, grandTotal]);\n\n"
if marker2 not in c:
    raise SystemExit('Missing checkout auth effect')
c = c.replace(marker2, effect + marker2, 1)
old_promo = '''              <Section title="Промокод" n="04">
                <div className="flex gap-3">
                  <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponState({ applied: false, discount: 0, name: '', error: '', loading: false }); }} placeholder="Введіть промокод" className="flex-1 bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none transition-colors uppercase" />
                  <button type="button" onClick={applyCoupon} disabled={couponState.loading} className="px-6 border border-espresso/25 text-[11px] tracking-[0.18em] uppercase text-espresso hover:bg-espresso hover:text-milk transition-colors disabled:opacity-60">
                    {couponState.loading ? '…' : 'Застосувати'}
                  </button>
                </div>
                {couponState.applied && <p className="mt-3 text-sm text-espresso">Знижку «{couponState.name}» застосовано: −{couponState.discount.toLocaleString('uk-UA')} ₴</p>}
                {couponState.error && <p className="mt-3 text-sm text-[#8B3A2E]">{couponState.error}</p>}
              </Section>

              <Section title="Коментар" n="05">
                <textarea name="comment" rows={4} placeholder="Побажання до замовлення" className="w-full bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none resize-none" />
              </Section>'''
new_promo = '''              <div className="border-y border-espresso/10 divide-y divide-espresso/10">
                <details className="group py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-mocha"><span>Є промокод?</span><span className="text-lg leading-none group-open:rotate-45 transition-transform">+</span></summary>
                  <div className="flex gap-3 mt-4">
                    <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponState({ applied: false, discount: 0, name: '', error: '', loading: false }); }} placeholder="Введіть промокод" className="flex-1 bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none transition-colors uppercase" />
                    <button type="button" onClick={applyCoupon} disabled={couponState.loading} className="px-5 border border-espresso/25 text-[10px] tracking-[0.16em] uppercase text-espresso hover:bg-espresso hover:text-milk transition-colors disabled:opacity-60">{couponState.loading ? '…' : 'Застосувати'}</button>
                  </div>
                  {couponState.applied && <p className="mt-3 text-sm text-espresso">Знижку «{couponState.name}» застосовано: −{couponState.discount.toLocaleString('uk-UA')} ₴</p>}
                  {couponState.error && <p className="mt-3 text-sm text-[#8B3A2E]">{couponState.error}</p>}
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-mocha"><span>Додати коментар</span><span className="text-lg leading-none group-open:rotate-45 transition-transform">+</span></summary>
                  <textarea name="comment" rows={3} placeholder="Побажання до замовлення" className="mt-4 w-full bg-transparent border-b border-espresso/25 py-3 text-espresso placeholder:text-mocha/60 focus:border-espresso outline-none resize-none" />
                </details>
              </div>'''
if old_promo not in c:
    raise SystemExit('Missing checkout promo/comment block')
c = c.replace(old_promo, new_promo, 1)
c = c.replace("<h1 className=\"font-heading text-[clamp(2.2rem,5vw,3.6rem)] text-espresso mb-12\">Оформлення замовлення</h1>", "<div className=\"mb-10\"><p className=\"text-[10px] tracking-[0.24em] uppercase text-mocha mb-2\">Фінальний крок</p><h1 className=\"font-heading text-[clamp(2.2rem,5vw,3.6rem)] text-espresso\">Оформлення замовлення</h1><p className=\"text-sm text-mocha mt-3\">Контакти → Доставка → Оплата. Решту ми уточнимо за потреби.</p></div>", 1)
p.write_text(c)
