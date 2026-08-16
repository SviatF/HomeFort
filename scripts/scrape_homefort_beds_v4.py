#!/usr/bin/env python3
import time
import scrape_homefort_beds_v3 as v3
import scrape_homefort_beds as core

base_parse = core.parse_product

def parse_all_real_products(url):
    # v3 installed its gallery and retry hooks before calling core.main().
    # Temporarily bypass its title-only validator: a real product is accepted when
    # it carries an SKU, or has an explicit Homefort/concrete bundle title.
    original = v3._original_parse
    p = original(url)
    name = (p.get('name') or '').strip()
    sku = (p.get('sku') or '').strip()
    lname = name.lower()
    real = bool(sku) or 'homefort' in lname or lname.startswith('комплект ліжко') or lname.startswith('комплект каркас')
    if not real:
        raise ValueError(f'not a product card: {name}')
    return p

# Re-run after v3's module-level run is not possible by import, so this file is
# executed as a fresh process and takes control of the core hooks here.
core.fetch = v3.fetch_retry
core.collect_images = v3.collect_images
core.parse_product = parse_all_real_products
core.main()
