import html, json, re
from pathlib import Path

path = Path('public/data/homefort-beds.json')
data = json.loads(path.read_text())

markers = [
    'Матеріал рами основи під матрац',
    'Матеріал каркасу ліжка',
    'Матеріал каркаса ліжка',
    'Для варіанта з підйомним механізмом',
    'Для варіанта без підйомного механізму',
    'Каркас оснащений',
    'За бажанням',
]

def clean(value):
    s = html.unescape(html.unescape(str(value or '')))
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = s.replace('\xa0', ' ')
    s = re.sub(r'\s+([,.;:!?])', r'\1', s)
    s = re.sub(r'([.!?])(?=[А-ЯІЇЄA-Z])', r'\1 ', s)
    s = re.sub(r'[ \t]{2,}', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n\n', s).strip()
    for marker in markers:
        s = re.sub(r'\s*(' + re.escape(marker) + r')', r'\n\n\1', s, flags=re.I)
    return s.strip()

for p in data.get('products', []):
    p['shortDescription'] = clean(p.get('shortDescription'))
    p['fullDescription'] = clean(p.get('fullDescription'))

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
