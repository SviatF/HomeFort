'use client';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

export default function FabricSelector({ fabrics, value, onChange }) {
  const [all, setAll] = useState([]);

  useEffect(() => {
    if (!fabrics || fabrics.length === 0) return;
    let active = true;
    base44.entities.Fabric.list('-created_date', 100)
      .then((res) => { if (active) setAll(res || []); })
      .catch(() => { if (active) setAll([]); });
    return () => { active = false; };
  }, [(fabrics || []).join(',')]);

  if (!fabrics || fabrics.length === 0) return null;
  const selected = all.find((f) => f.name === value);

  return (
    <div className="mt-6">
      <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-3">Тканина</p>
      <div className="flex flex-wrap gap-2">
        {fabrics.map((f) => {
          const fab = all.find((x) => x.name === f);
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 border text-sm transition-all ${value === f ? 'border-[#342112] bg-[#342112] text-[#FAF7F2]' : 'border-[#342112]/20 text-[#342112] hover:border-[#342112]'}`}
            >
              {fab?.swatchImage ? (
                <Image src={fab.swatchImage} alt="" className="w-6 h-6 rounded-full" />
              ) : fab?.colorHex ? (
                <span className="w-6 h-6 rounded-full border border-[#342112]/15" style={{ background: fab.colorHex }} />
              ) : null}
              {f}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-4 flex gap-4 p-4 bg-[#F5E4D1]/40 border border-[#342112]/10">
          {selected.macroImage && <Image src={selected.macroImage} alt={selected.name} className="w-24 h-24 flex-shrink-0" />}
          <div className="text-sm min-w-0">
            <p className="font-heading text-lg text-[#342112]">{selected.name}</p>
            {selected.composition && <p className="text-[#755A44]">Склад: {selected.composition}</p>}
            {selected.martindale ? <p className="text-[#755A44]">Стійкість: {selected.martindale.toLocaleString('uk-UA')} циклів Martindale</p> : null}
            {selected.description && <p className="text-[#755A44] mt-1 leading-relaxed">{selected.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}