#!/usr/bin/env python3
import re, time
from collections import Counter
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import scrape_homefort_beds as core


def product_links():
    found = {}
    empty_pages = 0
    for page in range(1, 10):
        url = core.CATEGORY if page == 1 else f'{core.CATEGORY}?page={page}'
        soup = BeautifulSoup(core.fetch(url), 'lxml')
        cards = soup.select('.product-layout, .product-thumb')
        page_links = []
        for card in cards:
            # Pick the product-title link inside a catalog card, never category navigation links.
            candidates = card.select('h4 a[href], h3 a[href], .name a[href], .product-name a[href], .caption a[href]')
            chosen = None
            for a in candidates:
                label = core.text(a)
                href = urljoin(core.BASE, a.get('href','')).split('#')[0]
                if href.startswith(core.CATEGORY) and ('ліжко' in label.lower() or 'комплект' in label.lower()):
                    chosen = (href.rstrip('/'), label)
                    break
            if chosen:
                found[chosen[0]] = chosen[1]
                page_links.append(chosen[0])
        print(f'Catalog page {page}: {len(set(page_links))} product cards', flush=True)
        if not page_links:
            empty_pages += 1
        else:
            empty_pages = 0
        if page > 1 and empty_pages >= 1:
            break
        time.sleep(.15)
    return list(found)


def _folder_key(url):
    path = urlparse(url).path
    m = re.search(r'(/image/(?:cache/)?catalog/import_products/[^/]+/)', path, re.I)
    if m: return m.group(1)
    m = re.search(r'(/image/(?:cache/)?catalog/[^/]+/[^/]+/)', path, re.I)
    if m: return m.group(1)
    return path.rsplit('/',1)[0] + '/'


def collect_images(soup, j):
    candidates = []
    # JSON-LD + OG first, then every image href/src in product content.
    ji = j.get('image') if isinstance(j, dict) else None
    if isinstance(ji, str): candidates.append(urljoin(core.BASE, ji))
    elif isinstance(ji, list): candidates.extend(urljoin(core.BASE, x) for x in ji if isinstance(x,str))
    for meta in soup.select('meta[property="og:image"], meta[name="twitter:image"]'):
        if meta.get('content'): candidates.append(urljoin(core.BASE, meta['content']))
    scope = soup.select_one('#content') or soup
    for el in scope.select('a[href], img[src], img[data-src], img[data-lazy], [data-image]'):
        vals = [el.get('href'), el.get('data-image'), el.get('data-src'), el.get('data-lazy'), el.get('src')]
        for raw in vals:
            if not raw: continue
            u = urljoin(core.BASE, raw).replace('&amp;','&')
            low = u.lower()
            if '/image/' not in low: continue
            if not re.search(r'\.(?:png|jpe?g|webp)(?:\?|$)', low): continue
            if any(k in low for k in ['logo','icon','payment','banner','placeholder','advantages','sticker']): continue
            candidates.append(u)
    # Product galleries on Homefort are grouped in a product-specific image directory.
    # Select the dominant directory so recommendation/badge images never enter the carousel.
    unique=[]; seen=set()
    for u in candidates:
        if u not in seen:
            seen.add(u); unique.append(u)
    if not unique: return []
    og = ''
    meta = soup.select_one('meta[property="og:image"]')
    if meta and meta.get('content'): og = urljoin(core.BASE, meta['content'])
    preferred = _folder_key(og) if og else None
    counts = Counter(_folder_key(u) for u in unique)
    if preferred and counts.get(preferred,0) >= 2:
        folder = preferred
    else:
        folder = counts.most_common(1)[0][0]
    images = [u for u in unique if _folder_key(u) == folder]
    # Prefer high-resolution linked gallery images; replace common cache thumbnail dimensions with 1000x1000.
    normalized=[]; seen=set()
    for u in images:
        u = re.sub(r'-\d{2,4}x\d{2,4}(?=\.(?:png|jpe?g|webp)(?:\?|$))', '-1000x1000', u, flags=re.I)
        if u not in seen:
            seen.add(u); normalized.append(u)
    return normalized[:30]

core.product_links = product_links
core.collect_images = collect_images
core.main()
