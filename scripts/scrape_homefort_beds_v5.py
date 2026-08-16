#!/usr/bin/env python3
import json, time
from pathlib import Path
import scrape_homefort_beds as core
import scrape_homefort_beds_v3 as v3

OUT = Path('public/data/homefort-beds.json')


def parse_all_real(url):
    p = v3._original_parse(url)
    name = (p.get('name') or '').strip()
    sku = (p.get('sku') or '').strip()
    lname = name.lower()
    real = bool(sku) or 'homefort' in lname or lname.startswith('комплект ліжко') or lname.startswith('комплект каркас')
    if not real:
        raise ValueError(f'not a product card: {name}')
    return p


def main():
    core.fetch = v3.fetch_retry
    core.collect_images = v3.collect_images
    links = core.product_links()
    print(f'Found {len(links)} candidate URLs', flush=True)
    products=[]; failures=[]
    for i,u in enumerate(links,1):
        try:
            p=parse_all_real(u)
            # A concrete SKU is enough to retain the product even when Homefort publishes no price.
            if p.get('name') and (p.get('price') or p.get('sku')):
                products.append(p)
                print(f'[{i}/{len(links)}] {p["name"]} | price={p.get("price",0)} | sku={p.get("sku","")} | {len(p.get("images") or [])} images', flush=True)
            else:
                failures.append({'url':u,'error':'missing product identity'})
                print(f'FAILED {u}: missing product identity', flush=True)
        except Exception as e:
            failures.append({'url':u,'error':repr(e)})
            print(f'FAILED {u}: {e}', flush=True)
        time.sleep(.08)

    best={}
    for p in products:
        old=best.get(p['slug'])
        if not old or (len(p.get('images') or [])+len(p.get('specifications') or [])) > (len(old.get('images') or [])+len(old.get('specifications') or [])):
            best[p['slug']]=p
    products=sorted(best.values(), key=lambda x:(x.get('name') or '').lower())
    OUT.parent.mkdir(parents=True,exist_ok=True)
    payload={
        'source':core.CATEGORY,
        'scrapedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),
        'count':len(products),
        'products':products,
        'failures':failures,
    }
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'FINAL wrote {len(products)} products, failures={len(failures)}', flush=True)
    if len(products) < 79:
        raise SystemExit(f'Expected at least 79 real product records, got {len(products)}')

if __name__=='__main__':
    main()
