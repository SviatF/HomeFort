'use client';
import { Link } from '@/lib/router';
import { sizeToSlug } from '@/lib/variant';

const CATEGORY_NAMES = {
  beds: 'Ліжка',
  mattresses: 'Матраци',
  toppers: 'Наматрацники',
  pillows: 'Подушки',
  duvets: 'Ковдри',
  bedding: 'Постільна білизна',
  'kids-mattresses': 'Дитячі матраци',
};

const GUIDES = {
  beds: {
    intro: 'М’які ліжка DOMERA власного виробництва. Масив дерева, ортопедична основа та тактильні тканини. Обирайте розмір, тканину, колір та комплектацію — виготовляємо 7–10 днів.',
    sizeTitle: 'Як обрати розмір ліжка',
    sizes: [
      ['140×200', 'Компактніший двоспальний варіант для невеликої спальні.'],
      ['160×200', 'Універсальний двоспальний формат — найпопулярніший розмір.'],
      ['180×200', 'Більше простору для двох, комфорт для пар з різним ритмом сну.'],
      ['200×220', 'Максимальний простір для тих, хто любить розкіш і простір.'],
    ],
    extra: 'Ліжко з підйомним механізмом зберігає місце для зберігання під спальним місцем — корисно для компактних спалень. Без механізму — простіша конструкція та нижча ціна.',
  },
  mattresses: {
    intro: 'Матраци DOMERA з незалежним пружинним блоком, memory foam та натуральними матеріалами. Ортопедична підтримка та гарантія до 7 років.',
    sizeTitle: 'Як обрати матрац за розміром',
    sizes: [
      ['90×200', 'Для односпального використання та підлітків.'],
      ['140×200', 'Компактний двоспальний варіант.'],
      ['160×200', 'Стандартний двоспальний розмір під ліжко 160×200.'],
      ['180×200', 'Просторий двоспальний під ліжко 180×200.'],
    ],
    extra: 'Жорсткість обирайте під звичне положення для сну: на боці — м’якша поверхня, на спині — середня, на животі — жорсткіша. Кокос додає жорсткості, memory foam — м’якості.',
  },
  toppers: {
    intro: 'Наматрацники DOMERA з memory foam пом’якшують поверхню матраца та покращують мікроклімат сну.',
    sizeTitle: 'Розмір наматрацника',
    sizes: [['90×200', 'Односпальний.'], ['140×200', 'Компактний двоспальний.'], ['160×200', 'Двоспальний стандарт.'], ['180×200', 'Просторий двоспальний.']],
    extra: 'Підбирайте наматрацник строго під розмір матраца, щоб він не ковзав.',
  },
  pillows: {
    intro: 'Подушки DOMERA з натуральним наповненням та льняними чохлами для правильної підтримки шиї.',
    sizeTitle: 'Розмір подушки',
    sizes: [['50×70', 'Класичний прямокутний розмір.'], ['70×70', 'Квадратний варіант для тих, хто любить об’єм.']],
    extra: 'Висота подушки залежить від звичного положення: бічним споживачам — вища, тим хто спить на спині — середня.',
  },
  duvets: {
    intro: 'Ковдри DOMERA з дихаючим наповненням та натуральним льоном для всесезонного комфорту.',
    sizeTitle: 'Розмір ковдри',
    sizes: [['140×200', 'Напівдвоспальна.'], ['200×220', 'Стандартна двоспальна.']],
    extra: 'Обирайте ковдру під розмір підодіяльника, щоб уникнути зміщення.',
  },
  bedding: {
    intro: 'Льняна постільна білизна DOMERA з попередньою декатировкою — м’яка, дихаюча та стає м’якшою після кожного прання.',
    sizeTitle: 'Комплектація',
    sizes: [['Евро', 'Підодіяльник 200×220 + 2 наволочки 50×70.'], ['Сімейний', 'Два підодіяльники 150×210.'], ['1-спальний', 'Підодіяльник 160×220 + 1 наволочка.']],
    extra: 'Льон не потребує прасування — природні складки частина естетики матеріалу.',
  },
  'kids-mattresses': {
    intro: 'Ортопедичні дитячі матраці DOMERA з гіпоалергенних матеріалів для правильної підтримки зростаючого хребта.',
    sizeTitle: 'Розмір дитячого матраца',
    sizes: [['80×160', 'Для дітей від 3 років.'], ['90×200', 'Підлітковий розмір.']],
    extra: 'Дитячий матрац має бути середньої жорсткості для правильного формування постави.',
  },
};

export default function CategoryGuide({ category, cat, size, sizeDisplay, allSizes }) {
  const guide = GUIDES[category];
  if (!guide) return null;
  const intro = cat?.seoIntro || guide.intro;
  const baseName = cat?.name || CATEGORY_NAMES[category] || category;

  return (
    <section className="mt-20 md:mt-28 max-w-3xl">
      {size ? (
        <>
          <h2 className="font-heading text-3xl text-[#342112] mb-4">{baseName} {sizeDisplay}</h2>
          <p className="text-[#755A44] leading-relaxed mb-8">{intro}</p>
          <h3 className="font-heading text-2xl text-[#342112] mb-3">Кому підійде розмір {sizeDisplay}</h3>
          <p className="text-[#755A44] leading-relaxed mb-8">
            {(guide.sizes.find((s) => s[0] === sizeDisplay) || [sizeDisplay, ''])[1] || `Розмір ${sizeDisplay} підходить під відповідне ліжко та матрац.`}
          </p>
          <h3 className="font-heading text-2xl text-[#342112] mb-3">Як обрати габарити</h3>
          <p className="text-[#755A44] leading-relaxed mb-8">{guide.extra}</p>
        </>
      ) : (
        <>
          <h2 className="font-heading text-3xl text-[#342112] mb-4">{guide.sizeTitle}</h2>
          <p className="text-[#755A44] leading-relaxed mb-6">{intro}</p>
          <div className="space-y-3 mb-8">
            {guide.sizes.map(([s, d]) => (
              <div key={s} className="flex gap-4 border-b border-[#342112]/10 pb-3">
                <span className="font-heading text-lg text-[#342112] w-24 flex-shrink-0">{s}</span>
                <span className="text-[#755A44]">{d}</span>
              </div>
            ))}
          </div>
          <p className="text-[#755A44] leading-relaxed mb-8">{guide.extra}</p>
        </>
      )}

      {allSizes && allSizes.length > 1 && (
        <div>
          <h3 className="font-heading text-2xl text-[#342112] mb-4">Інші розміри</h3>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <Link
                key={s}
                to={`/catalog/${category}/${sizeToSlug(s)}`}
                className={`px-4 py-2 border text-sm transition-all ${size && sizeDisplay === s ? 'border-[#342112] bg-[#342112] text-[#FAF7F2]' : 'border-[#342112]/20 text-[#342112] hover:border-[#342112] hover:bg-[#342112] hover:text-[#FAF7F2]'}`}
              >
                {baseName} {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}