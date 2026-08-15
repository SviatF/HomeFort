'use client';
export default function ProductDimensions({ product }) {
  const dims = [
    ['Ширина спального місця', product.sleepingWidth],
    ['Довжина спального місця', product.sleepingLength],
    ['Зовнішня ширина', product.externalWidth],
    ['Зовнішня довжина', product.externalLength],
    ['Висота спинки', product.headboardHeight],
    ['Висота ліжка', product.bedHeight],
    ['Кліренс від підлоги', product.clearanceFromFloor],
    ['Вага', product.weight],
  ].filter(([, v]) => v != null && v !== '');

  if (dims.length === 0 && !product.technicalDrawing) return null;

  return (
    <div className="space-y-8">
      {dims.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
          {dims.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-[#342112]/10 py-2">
              <span className="text-[#937C68]">{k}</span>
              <span className="text-[#342112] text-right">{v}</span>
            </div>
          ))}
        </div>
      )}
      {product.technicalDrawing && (
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-3">Технічне креслення</p>
          <div className="border border-[#342112]/15 bg-[#F8F3EC] p-4">
            <img src={product.technicalDrawing} alt={`${product.name} — креслення`} className="w-full h-auto" loading="lazy" />
          </div>
        </div>
      )}
    </div>
  );
}