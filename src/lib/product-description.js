export function decodeProductText(value = '') {
  return String(value)
    .replace(/&amp;nbsp;|&nbsp;|\u00a0/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([.!?])(?=[А-ЯІЇЄA-Z])/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const SECTION_MARKERS = [
  'Матеріал рами основи під матрац',
  'Матеріал каркасу ліжка',
  'Матеріал каркаса ліжка',
  'Для варіанта з підйомним механізмом',
  'Для варіанта без підйомного механізму',
  'Каркас оснащений',
  'За бажанням',
];

export function formatProductDescription(value = '') {
  let text = decodeProductText(value);
  if (!text) return [];

  for (const marker of SECTION_MARKERS) {
    text = text.replace(new RegExp(`\\s*(${marker.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi'), '\n\n$1');
  }

  const raw = text.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  const blocks = [];

  for (const chunk of raw) {
    const sentences = chunk.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) || [chunk];
    if (sentences.length <= 3) {
      blocks.push(sentences.join(' '));
      continue;
    }
    for (let i = 0; i < sentences.length; i += 2) blocks.push(sentences.slice(i, i + 2).join(' '));
  }

  return blocks.filter(Boolean);
}
