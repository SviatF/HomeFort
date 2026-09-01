'use client';
import { useEffect, useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, trackGenerateLead, trackMeta } from '@/lib/analytics';
import { getUtm } from '@/lib/utm';

const TRACK_EVENT = {
  one_click: 'one_click_submit',
  fabric_sample: 'fabric_sample_submit',
  consultation: 'consultation_submit',
};

const COPY = {
  one_click: { title: 'Купити в 1 клік', subtitle: 'Вкажіть телефон — менеджер отримає обрану модель і комплектацію та підтвердить замовлення.' },
  fabric_sample: { title: 'Замовити зразки тканини', subtitle: 'Надішлемо зразки обраних тканин Новою Поштою.' },
  consultation: { title: 'Замовити дзвінок', subtitle: 'Залиште телефон і зручний час. Менеджер допоможе з розміром, тканиною та комплектацією.' },
};

export default function LeadModal({ open, onClose, leadType, product, context = {} }) {
  const [form, setForm] = useState({ name: '', phone: '', city: '', message: '', preferredTime: '', fabrics: context.fabrics || [], consent: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) setForm((prev) => ({ ...prev, fabrics: context.fabrics || prev.fabrics || [] }));
  }, [open]);

  if (!open) return null;
  const t = COPY[leadType] || COPY.consultation;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.phone.trim()) {
      setError('Вкажіть номер телефону.');
      return;
    }
    if (leadType === 'fabric_sample' && !form.name.trim()) {
      setError("Заповніть ім'я.");
      return;
    }
    if (leadType === 'fabric_sample' && !form.consent) {
      setError('Потрібна згода на обробку даних.');
      return;
    }

    setSubmitting(true);
    const consultationMessage = [
      form.preferredTime ? `Бажаний час дзвінка: ${form.preferredTime}` : '',
      form.message.trim(),
    ].filter(Boolean).join('\n');
    const payload = {
      leadType,
      name: form.name.trim() || (leadType === 'one_click' ? 'Швидке замовлення' : 'Консультація з товару'),
      phone: form.phone.trim(),
      email: '',
      message: consultationMessage,
      preferredTime: form.preferredTime,
      productId: product?.id || '',
      variantSKU: context.variantSKU || '',
      configuration: context.configuration || '',
      fabricSamples: leadType === 'fabric_sample' ? form.fabrics : [],
      ...getUtm(),
    };

    try {
      await base44.functions.invoke('createLead', payload);
      track(TRACK_EVENT[leadType] || 'lead_submit', {
        lead_type: leadType,
        product_id: product?.id || '',
        variant_sku: context.variantSKU || undefined,
        preferred_time: form.preferredTime || undefined,
      });
      trackGenerateLead({
        source: leadType === 'one_click' ? 'one_click_buy' : leadType,
        product,
        value: context.price,
        variantSKU: context.variantSKU,
        configuration: context.configuration,
      });
      trackMeta('Lead', {
        content_name: product?.name || (leadType === 'one_click' ? 'Швидке замовлення' : 'DOMERA lead'),
        content_ids: context.variantSKU ? [context.variantSKU] : product?.id ? [product.id] : undefined,
        content_type: 'product',
        currency: 'UAH',
        value: Number(context.price || product?.price_current || product?.price || 0),
      });
      setDone(true);
    } catch (err) {
      setError('Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам.');
      setSubmitting(false);
    }
  };

  const close = () => {
    setDone(false);
    setError('');
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#342112]/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-[#FAF7F2] p-7 md:p-8 max-h-[90vh] overflow-y-auto ui-radius-md">
        <button aria-label="Закрити" onClick={close} className="absolute top-4 right-4 text-[#937C68] hover:text-[#342112]"><X className="w-5 h-5" strokeWidth={1.4} /></button>

        {done ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-[#342112] text-[#FAF7F2] flex items-center justify-center mx-auto mb-5"><Check className="w-7 h-7" strokeWidth={1.4} /></div>
            <h3 className="font-heading text-2xl text-[#342112] mb-2">Дякуємо!</h3>
            <p className="text-[#755A44] text-sm">Заявку прийнято. Менеджер зв’яжеться з вами у вказаний або найближчий доступний час.</p>
            <button onClick={close} className="mt-7 px-7 py-3 bg-[#342112] text-[#FAF7F2] text-[11px] tracking-[0.22em] uppercase">Закрити</button>
          </div>
        ) : (
          <>
            <h3 className="font-heading text-2xl text-[#342112] pr-8">{t.title}</h3>
            <p className="text-sm text-[#755A44] mt-2 mb-6">{t.subtitle}</p>

            {product && (
              <div className="flex items-center gap-3 mb-5 p-3 bg-[#F5E4D1]/60 ui-radius-sm">
                {product.images?.[0] && <img src={product.images[0]} alt="" className="w-12 h-14 object-cover flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="font-heading text-base text-[#342112] leading-tight truncate">{product.name}</p>
                  {context.configuration && <p className="text-xs text-[#755A44] line-clamp-2">{context.configuration}</p>}
                  {context.price != null && <p className="text-sm text-[#342112] mt-0.5">{Number(context.price).toLocaleString('uk-UA')} ₴</p>}
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {leadType === 'fabric_sample' && <Field label="Ім'я"><input value={form.name} onChange={(e) => set('name', e.target.value)} className="lead-input" autoComplete="name" /></Field>}
              <Field label="Телефон"><input value={form.phone} onChange={(e) => set('phone', e.target.value)} type="tel" inputMode="tel" autoComplete="tel" className="lead-input" placeholder="+380" autoFocus={leadType === 'one_click'} /></Field>

              {leadType === 'consultation' && <>
                <Field label="Бажаний час дзвінка">
                  <select value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} className="lead-input bg-white">
                    <option value="">Якнайшвидше</option>
                    <option value="09:00–12:00">09:00–12:00</option>
                    <option value="12:00–15:00">12:00–15:00</option>
                    <option value="15:00–18:00">15:00–18:00</option>
                    <option value="18:00–20:00">18:00–20:00</option>
                  </select>
                </Field>
                <Field label="Коментар — необов'язково"><textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={2} className="lead-input resize-none" placeholder="Наприклад: потрібне ліжко 160×200 у світлій тканині" /></Field>
              </>}

              {leadType === 'fabric_sample' && <>
                {product?.fabrics?.length > 0 && <Field label="Зразки тканин"><div className="flex flex-wrap gap-2">{product.fabrics.map((raw) => { const name = typeof raw === 'string' ? raw : raw?.name || raw?.label || 'Тканина'; const active = form.fabrics.includes(name); return <button type="button" key={name} onClick={() => set('fabrics', active ? form.fabrics.filter((x) => x !== name) : [...form.fabrics, name])} className={`px-3 py-2 border text-sm ${active ? 'border-[#342112] bg-[#342112] text-[#FAF7F2]' : 'border-[#342112]/20 text-[#342112]'}`}>{name}</button>; })}</div></Field>}
                <Field label="Місто"><input value={form.city} onChange={(e) => set('city', e.target.value)} className="lead-input" autoComplete="address-level2" /></Field>
                <label className="flex items-start gap-3 text-xs text-[#755A44] cursor-pointer"><input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="accent-[#342112] w-4 h-4 mt-0.5" />Погоджуюсь на обробку персональних даних та отримання зразків.</label>
              </>}

              {error && <p className="text-sm text-[#8B3A2E]">{error}</p>}
              <button type="submit" disabled={submitting} className="group w-full py-4 bg-[#C8643B] text-white text-[12px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 disabled:opacity-60 ui-radius-sm">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.4} /> Обробка…</> : leadType === 'consultation' ? 'Замовити дзвінок' : leadType === 'one_click' ? 'Оформити в 1 клік' : 'Надіслати заявку'}
              </button>
              {leadType === 'one_click' && <p className="text-[11px] leading-relaxed text-[#937C68] text-center">Без реєстрації та довгого оформлення. Деталі доставки підтвердить менеджер.</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-[11px] tracking-[0.18em] uppercase text-[#937C68] mb-2 block">{label}</label>{children}</div>;
}
