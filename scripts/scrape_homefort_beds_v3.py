#!/usr/bin/env python3
import re, time
from collections import Counter
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import scrape_homefort_beds as core

_original_fetch = core.fetch
_original_parse = core.parse_product


def fetch_retry(url):
    last = None
    for attempt in range(4):
        try:
            return _original_fetch(url)
        except Exception as e:
            last = e
            time.sleep(0.6 * (attempt + 1))
    raise last


def folder_key(url):
    path = urlparse(url).path
    m = re.search(r'(/image/(?:cache/)?catalog/import_products/[^/]+/)', path, re.I)
    if m: return m.group(1)
    return path.rsplit('/', 1)[0] + '/'


def collect_images(soup, j):
    candidates=[]
    ji=j.get('image') if isinstance(j,dict) else None
    if isinstance(ji,str): candidates.append(urljoin(core.BASE,ji))
    elif isinstance(ji,list): candidates += [urljoin(core.BASE,x) for x in ji if isinstance(x,str)]
    for meta in soup.select('meta[property="og:image"], meta[name="twitter:image"]'):
        if meta.get('content'): candidates.append(urljoin(core.BASE,meta['content']))
    scope=soup.select_one('#content') or soup
    for el in scope.select('a[href], img[src], img[data-src], img[data-lazy], [data-image]'):
        for raw in [el.get('href'),el.get('data-image'),el.get('data-src'),el.get('data-lazy'),el.get('src')]:
            if not raw: continue
            u=urljoin(core.BASE,raw).replace('&amp;','&')
            low=u.lower()
            if '/image/' not in low or not re.search(r'\.(?:png|jpe?g|webp)(?:\?|$)',low): continue
            if any(k in low for k in ['logo','icon','payment','banner','placeholder','advantages','sticker']): continue
            candidates.append(u)
    unique=[];seen=set()
    for u in candidates:
        if u not in seen:
            seen.add(u);unique.append(u)
    if not unique:return []
    og=''
    m=soup.select_one('meta[property="og:image"]')
    if m and m.get('content'):og=urljoin(core.BASE,m['content'])
    counts=Counter(folder_key(u) for u in unique)
    pref=folder_key(og) if og else None
    folder=pref if pref and counts.get(pref,0)>=2 else counts.most_common(1)[0][0]
    result=[];seen=set()
    for u in unique:
        if folder_key(u)!=folder:continue
        # Anchor gallery URLs are already 1000x1000; normalize cached thumbnails to same resolution.
        u=re.sub(r'-\d{2,4}x\d{2,4}(?=\.(?:png|jpe?g|webp)(?:\?|$))','-1000x1000',u,flags=re.I)
        if u not in seen:
            seen.add(u);result.append(u)
    return result[:30]


def parse_real_product(url):
    p=_original_parse(url)
    name=(p.get('name') or '').strip()
    # SEO landing pages use generic names like “Ліжко двоспальне 160х200”.
    # Real catalog cards consistently carry Homefort in the product name or are concrete product bundles.
    real = ('homefort' in name.lower() or name.lower().startswith('комплект ліжко') or name.lower().startswith('комплект каркас'))
    if not real:
        raise ValueError(f'not a product card: {name}')
    return p

core.fetch=fetch_retry
core.collect_images=collect_images
core.parse_product=parse_real_product
core.main()
