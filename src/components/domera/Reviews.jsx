'use client';
import { useEffect, useState } from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Review.filter({ status: 'approved' })
      .then((res) => {
        setReviews(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // No real reviews yet — hide the entire section (no fake social proof).
  if (!loading && reviews.length === 0) return null;

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <section className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="max-w-2xl mb-14 md:mb-20">
          <p className="text-[11px] tracking-[0.32em] uppercase text-bronze mb-4">Відгуки</p>
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.08] text-espresso">
            Як DOMERA відчувається вдома
          </h2>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${i === 0 ? 'lg:col-span-7' : 'lg:col-span-5'} aspect-[16/10] bg-sand animate-pulse`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {reviews.map((r, i) => (
              <Reveal
                key={r.id || i}
                delay={i * 90}
                className={i === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}
              >
                <figure className={`flex flex-col h-full border border-espresso/10 bg-milk shadow-soft ${i === 0 ? 'lg:flex-row' : ''}`}>
                  {r.productPhoto && (
                    <div className={`relative overflow-hidden ${i === 0 ? 'lg:w-1/2 aspect-[4/3] lg:aspect-auto' : 'aspect-[16/10]'}`}>
                      <Image src={r.productPhoto} alt={r.customerName} className="w-full h-full" />
                    </div>
                  )}
                  <figcaption className={`p-8 md:p-10 flex flex-col justify-between flex-1 ${i === 0 && r.productPhoto ? 'lg:w-1/2' : ''}`}>
                    <div>
                      <div className="flex gap-0.5 mb-5 text-champagne">
                        {[...Array(5)].map((_, k) => (
                          <Star
                            key={k}
                            className={`w-4 h-4 ${k < (r.rating || 0) ? 'fill-champagne' : 'fill-transparent'} text-champagne`}
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                      <blockquote className="font-heading text-2xl md:text-3xl leading-snug text-espresso">
                        “{r.text}”
                      </blockquote>
                    </div>
                    <div className="mt-8">
                      <p className="text-espresso font-medium">{r.customerName}</p>
                      <p className="text-sm text-mocha">{[r.city, r.product].filter(Boolean).join(' · ')}</p>
                      {r.verifiedPurchase && (
                        <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase text-mocha">
                          <BadgeCheck className="w-4 h-4 text-bronze" strokeWidth={1.6} /> Підтверджена покупка
                        </span>
                      )}
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <Reveal className="mt-10 flex items-center gap-6 text-mocha">
            <span className="font-heading text-2xl text-espresso">{avg} / 5</span>
            <span className="text-sm">на основі {reviews.length} {reviews.length === 1 ? 'відгуку' : 'відгуків'} клієнтів</span>
          </Reveal>
        )}
      </div>
    </section>
  );
}