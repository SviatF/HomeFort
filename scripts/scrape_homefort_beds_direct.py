#!/usr/bin/env python3
# Approved direct catalog v1 — only URLs explicitly supplied by the owner.
import json, re, time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from collections import Counter
from bs4 import BeautifulSoup
import scrape_homefort_beds as core

OUT = Path('public/data/homefort-beds.json')
URLS = [
'https://homefort.ua/lizhka-ua/lizhko-m-yake-homefort-soft_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-seul1_uk',
'https://homefort.ua/lizhka-ua/lizhko-m-yake-homefort-bestseller-s_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-sunny-lux_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-adele_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-bestseller_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-elena_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-lider_uk',
'https://homefort.ua/lizhka-ua/lizhko-lilia-_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-sunny_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-drim_uk',
'https://homefort.ua/lizhka-ua/lizhko-m-yake-homefort-oxana_uk',
'https://homefort.ua/lizhka-ua/lizhka-mjaki-ua/lizhko-dvospalne-ua/lizhko-homefort-agata-lux_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-adaline_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-maria_uk',
'https://homefort.ua/lizhka-ua/lizhko-homefort-adele-lux_uk',
]

def product_folder(url):
    path=urlparse(url).path
    m=re.search(r'/image/(?:cache/)?catalog/import_products/([^/]+)/',path,re.I)
    return m.group(1) if m else ''

def collect_product_images(soup,j):
    candidates=[]
    ji=j.get('image') if isinstance(j,dict) else None
    if isinstance(ji,str): candidates.append(urljoin(core.BASE,ji))
    elif isinstance(ji,list): candidates.extend(urljoin(core.BASE,x) for x in ji if isinstance(x,str))
    for meta in soup.select('meta[property="og:image"],meta[name="twitter:image"]'):
        if meta.get('content'): candidates.append(urljoin(core.BASE,meta['content']))
    scope=soup.select_one('#content') or soup
    for el in scope.select('a[href],img[src],img[data-src],img[data-lazy],[data-image]'):
        for raw in (el.get('href'),el.get('data-image'),el.get('data-src'),el.get('data-lazy'),el.get('src')):
            if not raw: continue
            u=urljoin(core.BASE,raw).replace('&amp;','&')
            low=u.lower()
            if '/image/' not in low or not re.search(r'\.(?:png|jpe?g|webp)(?:\?|$)',low): continue
            if any(k in low for k in ['logo','icon','payment','banner','placeholder','advantages','sticker','fabric','tkan']): continue
            candidates.append(u)
    unique=[]; seen=set()
    for u in candidates:
        if u not in seen:
            seen.add(u); unique.append(u)
    folders=Counter(product_folder(u) for u in unique if product_folder(u))
    if not folders: return unique[:30]
    og=soup.select_one('meta[property="og:image"]')
    og_folder=product_folder(urljoin(core.BASE,og.get('content'))) if og and og.get('content') else ''
    folder=og_folder if og_folder and folders[og_folder] >= 2 else folders.most_common(1)[0][0]
    out=[]; seen=set()
    for u in unique:
        if product_folder(u)!=folder: continue
        u=re.sub(r'-\d{2,4}x\d{2,4}(?=\.(?:png|jpe?g|webp)(?:\?|$))','-1000x1000',u,flags=re.I)
        if u not in seen:
            seen.add(u); out.append(u)
    return out[:30]

def main():
    core.collect_images=collect_product_images
    products=[]; failures=[]
    for i,url in enumerate(URLS,1):
        try:
            p=core.parse_product(url)
            p['sourceUrl']=url
            if not p.get('name') or not p.get('sku'):
                raise ValueError('missing product identity')
            if len(p.get('images') or []) < 2:
                raise ValueError(f'gallery too small: {len(p.get("images") or [])} images')
            products.append(p)
            print(f'[{i}/16] {p["name"]}: {len(p["images"])} images, {p.get("price")} UAH',flush=True)
        except Exception as e:
            failures.append({'url':url,'error':repr(e)})
            print(f'FAILED {url}: {e}',flush=True)
        time.sleep(.15)
    payload={'source':'approved-direct-urls','scrapedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'count':len(products),'products':products,'failures':failures}
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'FINAL {len(products)}/16 products; failures={len(failures)}')
    if len(products) != 16 or failures:
        raise SystemExit('Direct catalog validation failed; refusing incomplete replacement')

if __name__=='__main__': main()
