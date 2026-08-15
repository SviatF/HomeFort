'use client';
import { useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { track, trackMeta } from '@/lib/analytics';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';
import ProductCard from '@/components/domera/ProductCard';
import { useCart } from '@/lib/CartContext';

const steps = [
  {
    key: 'position',
    q: 'Як ви зазвичай спите?',
    options: [
      { v: 'side', l: 'На боці', d: 'Потрібна глибока підтримка плечей і стегон' },
      { v: 'back', l: 'На спині', d: 'Рівномірна підтримка хребта' },
      { v: 'stomach', l: 'На животі', d: 'Жорсткіша поверхня без тиску на шию' },
      { v: 'mixed', l: 'Міняю положення', d: 'Універсальна адаптивна основа' },
    ],
  },
  {
    key: 'firmness',
    q: 'Яка жорсткість вам комфортна?',
    options: [
      { v: 'soft', l: 'М\'яка', d: 'Ефект обіймання, м\'який контур' },
      { v: 'medium', l: 'Середня', d: 'Баланс підтримки та м\'якості' },
      { v: 'firm', l: 'Жорстка', d: 'Чітка ортопедична підтримка' },
    ],
  },
  {
    key: 'warmth',
    q: 'Як вам зазвичай вночі?',
    options: [
      { v: 'hot', l: 'Часто буває жарко', d: 'Дихаючі, прохолодні матеріали' },
      { v: 'neutral', l: 'Комфортно', d: 'Універсальний температурний баланс' },
      { v: 'cold', l: 'Часто мерзну', d: 'Зберігає тепло, об\'ємне наповнення' },
    ],
  },
  {
    key: 'partner',
    q: 'Чи спите ви вдвох?',
    options: [
      { v: 'yes', l: 'Так', d: 'Рекомендуємо двоспальні розміри' },
      { v: 'no', l: 'Ні', d: 'Оптимальні односпальні рішення' },
    ],
  },
  {
    key: 'budget',
    q: 'Який ваш бюджет на матрац?',
    options: [
      { v: 8000, l: 'до 8 000 ₴', d: 'Оптимальне співвідношення ціни та якості' },
      { v: 15000, l: 'до 15 000 ₴', d: 'Розширені ортопедичні властивості' },
      { v: 999999, l: 'Без обмежень', d: 'Преміум-сегмент, найкращі матеріали' },
    ],
  },
];

const firmKeywords = {
  soft: ['м\'як', 'soft', 'плюш', 'пух'],
  medium: ['серед', 'комфорт', 'баланс', 'універсал'],
  firm: ['жорстк', 'firm', 'ортопед', 'кокос', 'латекс'],
};

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [consult, setConsult] = useState({ name: '', phone: '', sent: false, sending: false });
  const { add } = useCart();

  const submitConsult = async () => {
    if (!consult.name.trim() || !consult.phone.trim()) return;
    setConsult((c) => ({ ...c, sending: true }));
    try {
      await base44.functions.invoke('createLead', {
        leadType: 'quiz',
        name: consult.name,
        phone: consult.phone,
        quizResult: JSON.stringify(answers),
        message: 'Підбір сну — запит консультації',
        productId: (results?.mattresses || [])[0]?.id,
      });
      trackMeta('Lead', { currency: 'UAH', content_name: 'Підбір сну' });
      setConsult((c) => ({ ...c, sent: true, sending: false }));
    } catch {
      setConsult((c) => ({ ...c, sending: false }));
    }
  };

  const pick = (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step === 0) track('quiz_start');
    track('quiz_step', { step: step + 1, answer: String(value) });
    if (step < steps.length - 1) setStep(step + 1);
    else finish(next);
  };

  const finish = async (a) => {
    setLoading(true);
    track('quiz_step', { step: steps.length, answer: 'complete' });
    const [mats, pillows, duvets] = await Promise.all([
      base44.entities.Product.filter({ category: 'mattresses' }),
      base44.entities.Product.filter({ category: 'pillows' }),
      base44.entities.Product.filter({ category: 'duvets' }),
    ]);
    let pool = (mats || []).filter((p) => p.price <= a.budget);
    if (!pool.length) pool = mats || [];
    const keys = firmKeywords[a.firmness] || [];
    const matched = pool.filter((p) =>
      keys.some((k) => `${p.name} ${p.subcategory || ''} ${p.shortDescription || ''}`.toLowerCase().includes(k))
    );
    const mattresses = (matched.length ? matched : pool).slice(0, 2);
    const pillow = (pillows || [])[0];
    const duvet = (duvets || [])[0];
    track('quiz_complete', {
      recommended: [...mattresses, pillow, duvet].filter(Boolean).map((p) => p.sku),
    });
    setResults({ mattresses, pillow, duvet });
    setLoading(false);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  const addAll = () => {
    const all = [...(results?.mattresses || []), results?.pillow, results?.duvet].filter(Boolean);
    all.forEach((p) =>
      add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images?.[0], size: p.sizes?.[0] || '', qty: 1 })
    );
    track('add_to_cart', { value: all.reduce((s, p) => s + p.price, 0), items: all.map((p) => ({ id: p.sku, name: p.name, price: p.price })) });
  };

  const progress = results ? 100 : (step / steps.length) * 100;

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo
        title="Підбір сну — DOMERA"
        description="Пройдіть короткий підбір і отримайте індивідуальну рекомендацію матраца, подушки та ковдри DOMERA."
        canonical="/quiz"
      />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12 py-12 md:py-20">
          <nav className="text-xs text-[#937C68] mb-6 flex gap-2">
            <Link to="/" className="hover:text-[#342112]">Головна</Link><span>/</span>
            <span className="text-[#342112]">Підбір сну</span>
          </nav>

          {!results && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-[#C6A17A]" strokeWidth={1.4} />
                <p className="text-[11px] tracking-[0.32em] uppercase text-[#937C68]">Індивідуальний підбір</p>
              </div>
              <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] text-[#342112] mb-3">Підбір сну</h1>
              <p className="text-[#755A44] max-w-xl mb-10">П’ять питань — і ми зберемо комплект, створений під ваші звички та температуру тіла.</p>

              <div className="h-px bg-[#342112]/10 mb-10 relative">
                <div className="absolute inset-y-0 left-0 bg-[#342112] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#937C68]">Підбираємо ваш комплект…</div>
              ) : (
                <div className="animate-fade-up">
                  <p className="text-[11px] tracking-[0.3em] text-[#C6A17A] mb-3">Питання {step + 1} / {steps.length}</p>
                  <h2 className="font-heading text-[clamp(1.6rem,3vw,2.4rem)] text-[#342112] mb-8">{steps[step].q}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {steps[step].options.map((o) => (
                      <button
                        key={String(o.v)}
                        onClick={() => pick(steps[step].key, o.v)}
                        className="text-left p-6 border border-[#342112]/15 hover:border-[#342112] hover:bg-[#F8F3EC] transition-all group"
                      >
                        <span className="font-heading text-xl text-[#342112] block">{o.l}</span>
                        <span className="text-sm text-[#755A44] mt-1 block">{o.d}</span>
                        <ArrowRight className="w-4 h-4 text-[#937C68] mt-3 group-hover:text-[#342112] group-hover:translate-x-1 transition-all" strokeWidth={1.4} />
                      </button>
                    ))}
                  </div>
                  {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="mt-8 inline-flex items-center gap-2 text-sm text-[#937C68] hover:text-[#342112] transition-colors">
                      <ArrowLeft className="w-4 h-4" strokeWidth={1.4} /> Назад
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {results && (
            <div className="animate-fade-up">
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#C6A17A] mb-3">Ваш комплект</p>
              <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] text-[#342112] mb-3">Зібрано для вас</h1>
              <p className="text-[#755A44] max-w-xl mb-10">На основі ваших відповідей ми рекомендуємо цей набір. Усі товари виготовляються на власному виробництві DOMERA.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {results.mattresses.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {(results.pillow || results.duvet) && (
                <>
                  <h3 className="font-heading text-2xl text-[#342112] mt-16 mb-6">Доповніть комплект</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 max-w-3xl">
                    {results.pillow && <ProductCard product={results.pillow} />}
                    {results.duvet && <ProductCard product={results.duvet} />}
                  </div>
                </>
              )}

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <button onClick={addAll} className="group flex-1 sm:flex-none px-10 py-4 bg-[#342112] text-[#FAF7F2] text-[12px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 hover:bg-[#4a2f1c] transition-colors">
                  Додати весь комплект <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
                </button>
                <button onClick={restart} className="px-8 py-4 border border-[#342112]/20 text-[#342112] text-[12px] tracking-[0.22em] uppercase hover:border-[#342112] transition-colors">
                  Пройти ще раз
                </button>
              </div>

              <div className="mt-16 border-t border-[#342112]/10 pt-10">
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#937C68] mb-3">За потреби</p>
                <h3 className="font-heading text-2xl text-[#342112] mb-4">Отримати допомогу консультанта</h3>
                {consult.sent ? (
                  <p className="text-[#755A44]">Дякуємо! Ми зв’яжемося з вами найближчим часом.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    <input value={consult.name} onChange={(e) => setConsult((c) => ({ ...c, name: e.target.value }))} placeholder="Ім’я" className="px-4 py-3 border border-[#342112]/20 text-[#342112] placeholder:text-[#937C68]/60 focus:border-[#342112] outline-none" />
                    <input value={consult.phone} onChange={(e) => setConsult((c) => ({ ...c, phone: e.target.value }))} placeholder="Телефон" type="tel" className="px-4 py-3 border border-[#342112]/20 text-[#342112] placeholder:text-[#937C68]/60 focus:border-[#342112] outline-none" />
                    <button onClick={submitConsult} disabled={consult.sending} className="px-6 py-3 bg-[#342112] text-[#FAF7F2] text-[11px] tracking-[0.18em] uppercase hover:bg-[#4a2f1c] transition-colors disabled:opacity-60">{consult.sending ? '…' : 'Надіслати'}</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}