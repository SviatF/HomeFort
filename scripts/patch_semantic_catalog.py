from pathlib import Path

path = Path('src/screens/Catalog.jsx')
text = path.read_text()

text = text.replace(
    "import { sizeToSlug, sizeMatches } from '@/lib/variant';",
    "import { sizeToSlug, sizeMatches } from '@/lib/variant';\nimport { BED_SEMANTIC_LANDINGS } from '@/lib/bed-semantic-core';"
)

text = text.replace(
    "  const { category, size } = useParams();",
    "  const { category, size: rawRouteSize } = useParams();\n  const size = rawRouteSize && /^\\d{2,3}(?:x|х|×)\\d{2,3}$/i.test(String(rawRouteSize)) ? rawRouteSize : '';"
)

needle = '''          {!size && allSizes.length > 1 && (\n            <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">\n              <span className="text-[10px] tracking-[0.18em] uppercase text-mocha whitespace-nowrap mr-2">Популярні розміри</span>\n              {allSizes.slice(0, 8).map((s) => (\n                <Link key={s} to={`/catalog/${category}/${sizeToSlug(s)}`} className="whitespace-nowrap px-3.5 py-2 border border-espresso/15 text-[11px] text-espresso hover:border-espresso hover:bg-espresso hover:text-milk transition-all">\n                  {s}\n                </Link>\n              ))}\n            </div>\n          )}\n'''

replacement = needle + '''\n          {!size && category === 'beds' && (\n            <div className="mt-5 border-t border-espresso/10 pt-5">\n              <div className="flex items-start gap-4 flex-col lg:flex-row lg:items-center">\n                <span className="text-[10px] tracking-[0.18em] uppercase text-mocha whitespace-nowrap">Популярні категорії</span>\n                <div className="flex flex-wrap gap-x-5 gap-y-2">\n                  {Object.entries(BED_SEMANTIC_LANDINGS)\n                    .filter(([, item]) => item.priority === 1)\n                    .slice(0, 9)\n                    .map(([slug, item]) => (\n                      <Link key={slug} to={`/catalog/beds/${slug}`} className="text-[12px] text-espresso border-b border-espresso/20 hover:border-espresso transition-colors pb-0.5">\n                        {item.h1}\n                      </Link>\n                    ))}\n                </div>\n              </div>\n            </div>\n          )}\n'''

if needle not in text:
    raise SystemExit('semantic insertion point not found')
text = text.replace(needle, replacement, 1)

path.write_text(text)
