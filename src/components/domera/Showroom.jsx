'use client';
import { Link } from '@/lib/router';
import { MapPin, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { useSettings } from '@/lib/useSettings';
import { Image } from '@/components/ui/image';

export default function Showroom() {
  const settings = useSettings();

  if (!settings?.showroomEnabled) return null;

  const name = settings.showroomName || 'Шоурум DOMERA';
  const address = settings.showroomAddress || '';
  const hours = settings.showroomHours || '';
  const phone = settings.showroomPhone || '';

  return (
    <section className="bg-espresso-soft py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <Reveal className="lg:col-span-6 order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-4">{name}</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1] text-milk">
              Відчуйте DOMERA наживо
            </h2>
            <p className="mt-6 text-milk/70 text-lg leading-relaxed max-w-md">
              Приїжджайте до шоуруму — протестуйте матраци, відчуйте тканини та оберіть своє ліжко разом із консультантом.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/#footer" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-milk text-espresso text-[12px] tracking-[0.22em] uppercase hover:bg-champagne transition-colors">
                Запланувати візит <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
              </Link>
              {address && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-milk/40 text-milk text-[12px] tracking-[0.22em] uppercase hover:border-milk transition-colors">
                  <MapPin className="w-4 h-4" strokeWidth={1.4} /> Прокласти маршрут
                </a>
              )}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6 order-1 lg:order-2" delay={120}>
            <div className="relative overflow-hidden aspect-[16/11] border border-milk/10">
              <Image src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/09d9a4110_generated_50044eeb.png" alt={name} className="w-full h-full" />
            </div>
            <div className="mt-4 flex justify-between text-sm text-milk/60">
              <span>{address}</span>
              <span>{hours}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}