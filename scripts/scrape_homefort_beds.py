#!/usr/bin/env python3
import json, re, sys, time
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

BASE = 'https://homefort.ua'
CATEGORY = BASE + '/lizhka-ua/'
OUT = Path('public/data/homefort-beds.json')
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; DOMERA-Catalog-Migration/1.0; +https://homefort.ua/)'}
S = requests.Session(); S.headers.update(HEADERS)


def text(el):
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip() if el else ''

def money(s):
    if not s: return None
    nums = re.findall(r'\d[\d\s\u00a0]*', s)
    if not nums: return None
    try: return int(re.sub(r'\D','', nums[-1]))
    except: return None

def slug_from_url(url):
    p = urlparse(url).path.rstrip('/').split('/')[-1]
    p = re.sub(r'_(uk|ua)$','',p)
    return p or 'product'

def fetch(url):
    r = S.get(url, timeout=35)
    r.raise_for_status()
    return r.text

def product_links():
    found = {}
    stale = 0
    # OpenCart page pagination; crawl more than expected and stop when no new links.
    for page in range(1, 10):
        url = CATEGORY if page == 1 else f'{CATEGORY}?page={page}'
        soup = BeautifulSoup(fetch(url), 'lxml')
        before = len(found)
        for a in soup.find_all('a', href=True):
            href = urljoin(BASE, a['href']).split('#')[0]
            u = urlparse(href)
            if u.netloc not in ('homefort.ua','www.homefort.ua'): continue
            path = u.path
            # Product pages in the beds category. Exclude category/filter directories.
            if not path.startswith('/lizhka-ua/') or path.rstrip('/') == '/lizhka-ua': continue
            leaf = path.rstrip('/').split('/')[-1]
            if not leaf or leaf in {'lizhka-mjaki-ua','lizhka-metalevi-ua','komplekti-lizhkok-ta-matraciv'}: continue
            # Product URLs contain a concrete slug and usually end _uk; nested category URLs end with '/'.
            label = text(a)
            if ('ліжко' in label.lower() or 'комплект' in label.lower() or re.search(r'_(uk|ua)$', leaf)):
                found[href.rstrip('/')] = label
        if len(found) == before:
            stale += 1
        else:
            stale = 0
        if stale >= 2: break
        time.sleep(.15)
    return list(found)

def parse_jsonld(soup):
    out=[]
    for s in soup.find_all('script', type='application/ld+json'):
        try:
            j=json.loads(s.string or s.get_text())
            if isinstance(j,list): out.extend(j)
            elif isinstance(j,dict):
                if '@graph' in j and isinstance(j['@graph'],list): out.extend(j['@graph'])
                out.append(j)
        except: pass
    for j in out:
        if isinstance(j,dict) and (j.get('@type')=='Product' or (isinstance(j.get('@type'),list) and 'Product' in j['@type'])):
            return j
    return {}

def collect_images(soup, j):
    imgs=[]
    ji=j.get('image')
    if isinstance(ji,str): imgs.append(ji)
    elif isinstance(ji,list): imgs += [x for x in ji if isinstance(x,str)]
    for meta in soup.select('meta[property="og:image"], meta[name="twitter:image"]'):
        if meta.get('content'): imgs.append(urljoin(BASE,meta['content']))
    selectors = [
        '.thumbnails a[href]', '.image-additional a[href]', '.product-image a[href]',
        '.swiper-slide img', '.product-thumb img', '.gallery img', '[data-image]'
    ]
    for sel in selectors:
        for el in soup.select(sel):
            u=el.get('href') or el.get('data-image') or el.get('data-src') or el.get('src')
            if u: imgs.append(urljoin(BASE,u))
    cleaned=[]; seen=set()
    for u in imgs:
        if not u or u.startswith('data:'): continue
        u=u.replace('&amp;','&')
        if u in seen: continue
        # skip obvious icons/badges
        low=u.lower()
        if any(k in low for k in ['icon','logo','payment','banner','placeholder']): continue
        seen.add(u); cleaned.append(u)
    return cleaned[:20]

def labeled_specs(soup):
    specs=[]; seen=set()
    # Tables
    for tr in soup.select('table tr'):
        cells=tr.find_all(['td','th'])
        if len(cells)>=2:
            k=text(cells[0]); v=text(cells[1])
            if k and v and len(k)<120 and (k.lower(),v.lower()) not in seen:
                seen.add((k.lower(),v.lower())); specs.append({'label':k,'value':v})
    # Definition lists
    for dt in soup.find_all('dt'):
        dd=dt.find_next_sibling('dd')
        if dd:
            k=text(dt);v=text(dd)
            if k and v and (k.lower(),v.lower()) not in seen:
                seen.add((k.lower(),v.lower())); specs.append({'label':k,'value':v})
    # OpenCart characteristics often appear as name/value rows
    for row in soup.select('.attribute, .characteristic, .product-attribute, .specification, .attributes li, #tab-specification tr'):
        parts=[text(x) for x in row.find_all(['span','div','td'], recursive=False) if text(x)]
        if len(parts)>=2:
            k,v=parts[0],parts[-1]
            if len(k)<120 and (k.lower(),v.lower()) not in seen:
                seen.add((k.lower(),v.lower()));specs.append({'label':k,'value':v})
    return specs[:80]

def find_spec(specs,*names):
    for sp in specs:
        key=sp['label'].lower().replace('’',"'")
        if any(n in key for n in names): return sp['value']
    return ''

def parse_product(url):
    soup=BeautifulSoup(fetch(url),'lxml')
    j=parse_jsonld(soup)
    h1=text(soup.find('h1')) or j.get('name') or ''
    body=text(soup)
    sku=''
    m=re.search(r'Артикул\s*:?\s*([A-Za-zА-Яа-я0-9._/-]+)',body,re.I)
    if m: sku=m.group(1)
    if not sku: sku=str(j.get('sku') or '')

    # price/current and old price
    price=None; old=None
    offers=j.get('offers') if isinstance(j,dict) else None
    if isinstance(offers,list): offers=offers[0] if offers else None
    if isinstance(offers,dict):
        try: price=int(round(float(str(offers.get('price','')).replace(',','.'))))
        except: pass
    # DOM-based prices; detect strike-through/old-price separately
    old_candidates=[]; price_candidates=[]
    for el in soup.select('.price, .product-price, [class*=price]'):
        s=text(el)
        if 'грн' not in s.lower(): continue
        vals=[int(re.sub(r'\D','',x)) for x in re.findall(r'\d[\d\s\u00a0]*\s*грн',s,re.I) if re.sub(r'\D','',x)]
        if not vals: continue
        cls=' '.join(el.get('class',[])).lower()
        if any(k in cls for k in ['old','special-old','price-old']): old_candidates += vals
        else: price_candidates += vals
    # explicit old price / strikethrough
    for el in soup.select('s, del, .price-old, .old-price'):
        v=money(text(el));
        if v: old_candidates.append(v)
    if price is None and price_candidates: price=min(price_candidates[:8])
    if old_candidates: old=max(old_candidates)
    if old and price and old<=price: old=None

    specs=labeled_specs(soup)

    # Description: prefer tab/description containers, fall back to JSON-LD description.
    desc=''
    for sel in ['#tab-description','.tab-description','.product-description','[itemprop=description]']:
        el=soup.select_one(sel)
        if el and len(text(el))>50:
            desc=text(el);break
    if not desc: desc=re.sub(r'<[^>]+>',' ',str(j.get('description') or ''))
    desc=re.sub(r'\s+',' ',desc).strip()
    short=desc[:420].rsplit(' ',1)[0] + ('…' if len(desc)>420 else '') if desc else ''

    # Sizes from product options and body
    sizes=[]
    for el in soup.select('select option, .radio label, .checkbox label, .option label'):
        s=text(el)
        for mm in re.findall(r'\b(?:70|80|90|100|110|120|130|140|160|180|200)\s*[xх×*]\s*(?:190|200)\s*(?:см)?\b',s,re.I):
            norm=re.sub(r'\s+','',mm).replace('x','х').replace('×','х').replace('*','х')
            if norm not in sizes: sizes.append(norm)
    if not sizes:
        for mm in re.findall(r'\b(?:70|80|90|100|110|120|130|140|160|180|200)\s*[xх×*]\s*(?:190|200)\s*(?:см)?\b',body,re.I):
            norm=re.sub(r'\s+','',mm).replace('x','х').replace('×','х').replace('*','х')
            if norm not in sizes: sizes.append(norm)

    availability='in_stock' if re.search(r'В наявності|Є в наявності',body,re.I) else ('out_of_stock' if re.search(r'Немає в наявності',body,re.I) else 'made_to_order')
    lift=find_spec(specs,'підйомний механізм','підйомний механiзм')
    lifting=bool(lift and not re.search(r'\bні\b|без',lift,re.I))
    material=find_spec(specs,'матеріал')
    warranty=find_spec(specs,'гаранті')
    head=find_spec(specs,'висота узгол','висота спинки')
    bed_height=find_spec(specs,'висота борт','висота ліжка')
    weight=find_spec(specs,'вага')
    load=find_spec(specs,'навантаження')
    images=collect_images(soup,j)

    rating=None; reviews=0
    agg=j.get('aggregateRating') if isinstance(j,dict) else None
    if isinstance(agg,dict):
        try: rating=float(agg.get('ratingValue'))
        except: pass
        try: reviews=int(float(agg.get('reviewCount') or agg.get('ratingCount') or 0))
        except: pass
    if not reviews:
        m=re.search(r'Відгуки\s*:?\s*\(?\s*(\d+)\s*\)?',body,re.I)
        if m: reviews=int(m.group(1))

    sale=round((old-price)*100/old) if old and price else 0
    slug=slug_from_url(url)
    seo_title=text(soup.find('title'))
    meta=soup.select_one('meta[name=description]'); seo_desc=meta.get('content','').strip() if meta else ''
    return {
      'name':h1,'slug':slug,'sku':sku,'category':'beds','subcategory':'beds',
      'shortDescription':short,'fullDescription':desc,'price':price or 0,'oldPrice':old,
      'salePercent':sale,'availability':availability,'productionTime':'',
      'images':images,'videoUrl':'','colors':[],'fabrics':[],'sizes':sizes,
      'material':material,'liftingMechanism':lifting,'dimensions':'','height':'','weight':weight,
      'sleepingWidth':'','sleepingLength':'','externalWidth':'','externalLength':'',
      'headboardHeight':head,'bedHeight':bed_height,'clearanceFromFloor':'','technicalDrawing':'',
      'hardness':'','springType':'','loadPerSleeper':load,'coverMaterial':'','coverRemovable':False,
      'frameMaterial':material,'foamType':'','foamDensity':'','hardware':'','fabricComposition':'',
      'fabricDurability':'','mechanismManufacturer':'','legsMaterial':'','certifications':'',
      'specifications':specs,'warranty':warranty,'rating':rating or 0,'reviewsCount':reviews,
      'featured':False,'seoTitle':seo_title[:250],'seoDescription':seo_desc[:500],
      'seoH1':h1,'canonicalUrl':'','indexable':True,'ogTitle':h1,
      'ogDescription':seo_desc[:500] or short,'ogImage':images[0] if images else '',
      'imageAlt':h1,'sourceUrl':url
    }

def main():
    links=product_links()
    print(f'Found {len(links)} product URLs', flush=True)
    products=[]; failures=[]
    for i,u in enumerate(links,1):
        try:
            p=parse_product(u)
            if p['name'] and p['price']:
                products.append(p)
                print(f'[{i}/{len(links)}] {p["name"]} | {p["price"]} | {len(p["images"])} images',flush=True)
            else:
                failures.append({'url':u,'error':'missing name/price'})
        except Exception as e:
            failures.append({'url':u,'error':repr(e)})
            print(f'FAILED {u}: {e}',file=sys.stderr,flush=True)
        time.sleep(.1)
    # de-duplicate by slug, prefer entry with more images/specs
    best={}
    for p in products:
        old=best.get(p['slug'])
        if not old or (len(p['images'])+len(p['specifications'])) > (len(old['images'])+len(old['specifications'])):
            best[p['slug']]=p
    products=sorted(best.values(), key=lambda x:x['name'].lower())
    OUT.parent.mkdir(parents=True,exist_ok=True)
    payload={'source':CATEGORY,'scrapedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'count':len(products),'products':products,'failures':failures}
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Wrote {len(products)} products, failures={len(failures)} to {OUT}')
    if len(products) < 70:
        print('Too few products found; refusing successful migration scrape.',file=sys.stderr)
        sys.exit(2)

if __name__=='__main__': main()
