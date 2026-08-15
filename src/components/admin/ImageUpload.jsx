'use client';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

export default function ImageUpload({ value, onChange, multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const list = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [value] : [];

  async function handleFiles(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of Array.from(files)) {
        const res = await base44.integrations.Core.UploadFile({ file: f });
        if (res?.file_url) urls.push(res.file_url);
      }
      if (multiple) onChange([...list, ...urls]);
      else onChange(urls[0] || '');
    } catch {
      alert('Помилка завантаження файлу');
    }
    setUploading(false);
  }

  function removeAt(idx) {
    if (multiple) {
      onChange(list.filter((_, i) => i !== idx));
    } else {
      onChange('');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {list.map((url, idx) => (
          <div key={idx} className="relative w-24 h-24 bg-[#F5E4D1] overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 w-6 h-6 bg-[#342112]/80 text-[#FAF7F2] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.6} />
            </button>
          </div>
        ))}
        {uploading && (
          <div className="w-24 h-24 bg-[#F5E4D1] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#937C68]" />
          </div>
        )}
      </div>
      <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#342112]/25 text-[11px] tracking-[0.18em] uppercase text-[#342112] cursor-pointer hover:bg-[#342112] hover:text-[#FAF7F2] transition-colors">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" strokeWidth={1.4} />}
        {multiple ? 'Додати зображення' : 'Завантажити'}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {!list.length && !uploading && (
        <p className="text-xs text-[#937C68] mt-2 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> Немає зображень
        </p>
      )}
    </div>
  );
}