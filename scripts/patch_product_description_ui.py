from pathlib import Path

path = Path('src/screens/Product.jsx')
text = path.read_text()

imp = "import { formatProductDescription } from '@/lib/product-description';\n"
if imp not in text:
    anchor = "import { useRecentlyViewed } from '@/lib/RecentlyViewedContext';\n"
    text = text.replace(anchor, anchor + imp)

old = """            <div className=\"max-w-3xl text-mocha leading-relaxed\">\n              {tab === 'about' && <p>{product.fullDescription}</p>}"""
new = """            <div className=\"max-w-4xl\">\n              {tab === 'about' && (\n                <div className=\"max-w-[780px] space-y-5\">\n                  {formatProductDescription(product.fullDescription || product.shortDescription).map((paragraph, index) => (\n                    <p key={index} className={`text-mocha leading-[1.85] ${index === 0 ? 'text-[18px] md:text-[20px] text-espresso' : 'text-[15px] md:text-[16px]'}`}>\n                      {paragraph}\n                    </p>\n                  ))}\n                </div>\n              )}"""
if old not in text:
    raise SystemExit('description block not found')
text = text.replace(old, new)
path.write_text(text)
