'use client';
import { Image } from '@/components/ui/image';

const normalise = (f) => typeof f === 'string'
  ? { name: f }
  : { name: f?.name || f?.label || 'Тканина', colorHex: f?.colorHex || f?.color || '', swatchImage: f?.swatchImage || f?.image || '', macroImage: f?.macroImage || '', composition: f?.composition || '', martindale: f?.martindale || '', description: f?.description || '' };

export default function FabricSelector({ fabrics = [], value, onChange }) {
  if (!Array.isArray(fabrics) || fabrics.length === 0) return null;
  const options = fabrics.map(normalise);
  const selected = options.find((f) => f.name === value) || options[0];

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Оберіть тканину">
        {options.map((fab, index) => (
          <button key={`${fab.name}-${index}`} type="button" role="radio" aria-checked={value === fab.name} aria-label={fab.name} title={fab.name}
            onClick={() => onChange?.(fab.name, index, fab)}
            className={`ui-radius-sm w-11 h-11 min-w-11 p-0 overflow-hidden border-2 transition-all ${value === fab.name ? 'border-espresso ring-2 ring-espresso/15' : 'border-espresso/15 hover:border-espresso/45'}`}>
            {fab.macroImage || fab.swatchImage ? <Image src={fab.macroImage || fab.swatchImage} alt={fab.name} width="88" height="88" loading="lazy" className="w-full h-full object-cover" /> : fab.colorHex ? <span className="block w-full h-full" style={{ background: fab.colorHex }} /> : <span className="flex w-full h-full items-center justify-center bg-sand text-espresso text-[13px] font-semibold">{fab.name.slice(0, 2).toUpperCase()}</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[13px] text-espresso" aria-live="polite">{selected?.name}</p>
      {(selected?.macroImage || selected?.composition || selected?.martindale || selected?.description) && (
        <div className="ui-radius-md mt-3 flex gap-4 p-4 bg-ivory border border-espresso/10">
          {selected.macroImage && <Image src={selected.macroImage} alt={`Макро тканини ${selected.name}`} width="160" height="160" loading="lazy" className="w-20 h-20 object-cover ui-radius-sm flex-shrink-0" />}
          <div className="text-[13px] min-w-0">
            {selected.composition && <p className="text-mocha">Склад: {selected.composition}</p>}
            {selected.martindale && <p className="text-mocha">Стійкість: {Number(selected.martindale).toLocaleString('uk-UA')} циклів Martindale</p>}
            {selected.description && <p className="text-mocha mt-1 leading-relaxed">{selected.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
