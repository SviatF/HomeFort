// Lightweight typo-tolerant search helpers for client-side product search.

export function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/й/g, 'и') // soft latin/cyrillic folding for common typos
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Classic Levenshtein distance (iterative, bounded).
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

// Score a product against a query. Higher = better. 0 = no match.
export function scoreProduct(product, query) {
  const q = normalize(query);
  if (!q) return 0;
  const name = normalize(product.name);
  const desc = normalize(product.shortDescription || '');
  const cat = normalize(product.category || '');
  const material = normalize(product.material || '');

  let score = 0;

  // Strong: exact substring in name
  if (name.includes(q)) score += 100;
  if (desc.includes(q)) score += 25;
  if (cat.includes(q)) score += 15;

  // Token-based fuzzy matching
  const qTokens = q.split(' ').filter(Boolean);
  const nameTokens = name.split(' ').filter(Boolean);
  for (const t of qTokens) {
    // token substring in name
    if (name.includes(t)) { score += 20; continue; }
    if (desc.includes(t)) { score += 8; continue; }
    // fuzzy: closest name word within distance 2
    let best = Infinity;
    for (const w of nameTokens) {
      if (Math.abs(w.length - t.length) > 2) continue;
      const d = levenshtein(t, w);
      if (d < best) best = d;
    }
    if (best <= 1) score += 14 - best * 4;
    else if (best <= 2) score += 8 - best * 2;
  }

  // Prefix bonus
  if (name.startsWith(q)) score += 30;

  return score;
}

export function searchProducts(products, query, limit = 6) {
  const q = (query || '').trim();
  if (!q) return [];
  const scored = products
    .map((p) => ({ p, s: scoreProduct(p, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.p);
}