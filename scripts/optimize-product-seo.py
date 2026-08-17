#!/usr/bin/env python3
import html
import json
import re
from pathlib import Path

PATH = Path('public/data/homefort-beds.json')
SITE = 'https://domera.shop'


def normalize_size(value):
    s = str(value or '').lower().replace('см', '').replace('cm', '')
    s = re.sub(r'\s+', '', s).replace('х', '×').replace('x', '×').replace('*', '×')
    m = re.search(r'(\d{2,3})×(\d{2,3})', s)
    return f'{m.group(1)}×{m.group(2)}' if m else str(value or '').strip()


def dedupe_sizes(values):
    out, seen = [], set()
    for raw in values or []:
        value = normalize_size(raw)
        key = re.sub(r'\D', '', value)
        if not value or key in seen:
            continue
        seen.add(key)
        out.append(value)
    return out


def preferred_sizes(values):
    sizes = dedupe_sizes(values)
    preferred = [s for s in ['140×200', '160×200', '180×200'] if s in sizes]
    for s in sizes:
        if len(preferred) >= 3:
            break
        if s not in preferred:
            preferred.append(s)
    return preferred[:3]


def seo_title(subject):
    candidates = [
        f'{subject} — ціна, розміри та фото | DOMERA',
        f'{subject} — ціна та розміри | DOMERA',
        f'{subject} — купити онлайн | DOMERA',
    ]
    for value in candidates:
        if 35 <= len(value) <= 65:
            return value
    return candidates[-1][:65].rstrip()


def seo_description(subject, sizes):
    size_text = ', '.join(sizes)
    candidates = [
        f'{subject}: фото, характеристики та розміри {size_text}. Перегляньте комплектацію, актуальну ціну та замовте модель онлайн у DOMERA.',
        f'{subject}: фото, розміри {size_text}. Перегляньте комплектацію, актуальну ціну та замовте модель онлайн у DOMERA.',
        f'{subject}: доступні розміри {size_text}, фото та характеристики. Перегляньте комплектацію й актуальну ціну та замовте онлайн у DOMERA.',
    ]
    for value in candidates:
        if 110 <= len(value) <= 165:
            return value
    value = candidates[0]
    if len(value) < 110:
        value += ' Для сучасної спальні.'
    if len(value) > 165:
        value = value.replace('характеристики та ', '')
    return value[:165].rstrip(' ,.;') + '.'


def clean_text(value):
    if not isinstance(value, str):
        return value
    value = html.unescape(value).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', value).strip()


def main():
    data = json.loads(PATH.read_text(encoding='utf-8'))
    products = data.get('products', [])
    if len(products) != 16:
        raise SystemExit(f'Expected 16 approved products, found {len(products)}')

    for product in products:
        subject = clean_text(product.get('name', '')).strip()
        if not subject:
            raise SystemExit('Product without name')

        sizes = dedupe_sizes(product.get('sizes', []))
        snippet_sizes = preferred_sizes(sizes)
        if not snippet_sizes:
            snippet_sizes = ['140×200', '160×200', '180×200']

        product['sizes'] = sizes
        product['shortDescription'] = clean_text(product.get('shortDescription', ''))
        product['fullDescription'] = clean_text(product.get('fullDescription', ''))
        product['seoTitle'] = seo_title(subject)
        product['seoDescription'] = seo_description(subject, snippet_sizes)
        product['seoH1'] = subject
        product['canonicalUrl'] = f"{SITE}/product/{product['slug']}"
        product['indexable'] = True
        product['imageAlt'] = f'{subject} — фото ліжка для спальні'
        product['ogTitle'] = product['seoTitle']
        product['ogDescription'] = product['seoDescription']
        if product.get('images'):
            product['ogImage'] = product['images'][0]

    data['seoOptimized'] = True
    data['seoProfile'] = 'domera-product-seo-v1'
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print('SEO optimized for', len(products), 'products')
    for p in products:
        print(len(p['seoTitle']), len(p['seoDescription']), p['slug'])


if __name__ == '__main__':
    main()
