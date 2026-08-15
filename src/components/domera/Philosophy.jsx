'use client';
import Reveal from './Reveal';
import CountUp from './CountUp';
import { Image } from '@/components/ui/image';

export default function Philosophy() {
  return (
    <section id="philosophy" className="bg-graphite py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <Reveal className="lg:col-span-6 lg:col-start-1">
            <p className="text-[11px] tracking-[0.32em] uppercase text-champagne mb-6">DOMERA Philosophy</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.1] text-milk text-balance">
              Комфорт починається не з дизайну.<br />
              <span className="text-champagne/80">Він починається з відчуття.</span>
            </h2>
            <p className="mt-8 text-milk/70 text-lg leading-relaxed max-w-xl">
              Ми створюємо ліжка, матраци та текстиль як єдину систему для комфортного сну — від власного виробництва до підбору рішення саме під ваш простір.
            </p>
            <div className="mt-10 flex gap-12">
              <div>
                <p className="font-heading text-4xl text-milk"><CountUp value={12} suffix="+" /></p>
                <p className="text-sm text-milk/55 mt-1">років виробництва</p>
              </div>
              <div>
                <p className="font-heading text-4xl text-milk"><CountUp value={40} suffix="k+" /></p>
                <p className="text-sm text-milk/55 mt-1">щасливих снів</p>
              </div>
              <div>
                <p className="font-heading text-4xl text-milk"><CountUp value={5} /></p>
                <p className="text-sm text-milk/55 mt-1">років гарантії</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
            <div className="relative overflow-hidden aspect-[3/4] border border-milk/10">
              <Image
                src="https://media.base44.com/images/public/6a7893b59d5f312a9ed01d07/0d9b0a79e_generated_81d13e86.png"
                alt="Макрозйомка фактури тканини DOMERA"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
              <div className="absolute bottom-5 left-5 text-milk">
                <p className="text-[10px] tracking-[0.32em] uppercase opacity-80">Natural linen</p>
                <p className="font-heading text-xl">Природна тактильність</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}