from pathlib import Path
import json, re
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]

def txt(path): return (ROOT/path).read_text(encoding='utf-8')
def save(path, value): (ROOT/path).write_text(value, encoding='utf-8')

# ---- B: exact mobile PDP order and strict mattress compatibility ----
p = txt('src/screens/Product.jsx')
p = p.replace(
"  const compatibleMattresses = useMemo(() => {\n    if (!size) return mattresses;\n    const matched = mattresses.filter((m) => (m.sizes || []).some((s) => sizeMatches(s, size)));\n    return matched.length ? matched : mattresses;\n  }, [mattresses, size]);",
"  const compatibleMattresses = useMemo(() => {\n    if (!size) return mattresses;\n    return mattresses.filter((m) => (m.sizes || []).some((s) => sizeMatches(s, size)));\n  }, [mattresses, size]);"
)
p = p.replace('className="text-[13px] text-mocha mt-2">Артикул:', 'className="hidden md:block text-[13px] text-mocha mt-2">Артикул:')
availability = """              <div className=\"mt-3\"><span className=\"product-status-badge\">{product.availability === 'in_stock' ? 'В наявності' : product.productionTime ? `Виготовлення ${product.productionTime}` : 'Під замовлення'}</span></div>\n\n              <ProductBenefits product={product} />\n              <DeliveryPromise product={product} />\n              <DeliveryEstimator productionTime={product.productionTime} />\n\n"""
if availability in p:
    p = p.replace(availability, '', 1)
    marker = '              {/* Lifting mechanism (beds) */}'
    insertion = """              <div className=\"mt-5\"><span className=\"product-status-badge\">{product.availability === 'in_stock' ? 'В наявності' : product.productionTime ? `Виготовлення ${product.productionTime}` : 'Під замовлення'}</span></div>\n              <div className=\"hidden md:block\"><ProductBenefits product={product} /><DeliveryPromise product={product} /><DeliveryEstimator productionTime={product.productionTime} /></div>\n\n"""
    if marker not in p: raise SystemExit('lifting marker missing')
    p = p.replace(marker, insertion + marker, 1)
# clear selected mattress if size makes it incompatible
needle = "  useEffect(() => {\n    if (!product || typeof window === 'undefined') return;\n    const url = new URL(window.location.href);"
if "setMattress(null);\n  }, [size, compatibleMattresses" not in p:
    compat_effect = "  useEffect(() => {\n    if (mattress && !compatibleMattresses.some((m) => m.id === mattress)) setMattress(null);\n  }, [size, compatibleMattresses, mattress]);\n\n"
    p = p.replace(needle, compat_effect + needle, 1)
save('src/screens/Product.jsx', p)

# ---- D: use only real source media, semantic-dedupe, prioritize actual interior assets ----
path = ROOT/'public/data/homefort-beds.json'
data = json.loads(path.read_text(encoding='utf-8'))

def bad(url):
    s = url.lower()
    return '-90x90' in s or '-280x280' in s or '.pagespeed.' in s or 'placeholder' in s

def key(url):
    u = urlsplit(url)
    name = u.path.rsplit('/',1)[-1].lower()
    name = re.sub(r'^x(?=[a-f0-9-]{8,})', '', name)
    name = re.sub(r'-\d{2,4}x\d{2,4}(?=\.)', '', name)
    name = re.sub(r'\.pagespeed\..*$', '', name)
    return re.sub(r'[^a-zа-яіїєґ0-9]+', '', name)

def interior(url):
    name = urlsplit(url).path.rsplit('/',1)[-1].lower()
    return bool(re.search(r'(^|[_-])(int|interior|room|scene|spalnya|spalnia)([_-]|\.)', name))

def original_score(url):
    s=url.lower()
    return (3 if '/image/catalog/' in s else 0) + (2 if '1000x1000' in s else 0) + (1 if '/import_products/' in s else 0)

stats=[]
for i, product in enumerate(data.get('products', [])):
    source = [u for u in product.get('images', []) if isinstance(u,str) and u and not bad(u)]
    best={}
    order=[]
    for u in source:
        k=key(u)
        if not k: continue
        if k not in best:
            best[k]=u; order.append(k)
        elif original_score(u) > original_score(best[k]): best[k]=u
    images=[best[k] for k in order]
    interiors=[u for u in images if interior(u)]
    if i < 10 and interiors:
        cover=max(interiors, key=original_score)
        images=[cover] + [u for u in images if u != cover]
    # Seven real high-quality frames where source contains them; never invent missing frames.
    if len(images) >= 7: images=images[:7]
    product['images']=images
    if images: product['ogImage']=images[0]
    stats.append({'name': product.get('name'), 'images': len(images), 'interiorCover': bool(images and interior(images[0])), 'video': bool(product.get('videoUrl'))})

path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print('MEDIA_AUDIT')
for row in stats[:10]: print(row)
print('top10 interior covers:', sum(r['interiorCover'] for r in stats[:10]), '/10')
print('top10 with >=7 real frames:', sum(r['images'] >= 7 for r in stats[:10]), '/10')
print('top5 with real video:', sum(r['video'] for r in stats[:5]), '/5')
