'use client';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@/lib/router';
import { track } from '@/lib/analytics';

export default function SmartFinderCTA() {
  return <section className="bg-[#EDE3D7] text-espresso"><div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end"><div className="md:col-span-8"><div className="flex items-center gap-2 text-mocha"><Sparkles className="w-4 h-4"/><span className="text-[10px] tracking-[0.25em] uppercase">DOMERA SMART FINDER</span></div><h2 className="font-heading text-[clamp(2.4rem,5vw,4.8rem)] leading-[.95] mt-4">Не переглядайте 16 моделей.<br/>Знайдіть свої 3.</h2><p className="mt-5 max-w-xl text-mocha">Розмір, бюджет, механізм і стиль — 4 відповіді, після яких покажемо персональний shortlist.</p></div><div className="md:col-span-4 md:text-right"><Link to="/bed-finder" onClick={()=>track('bed_finder_open',{source:'home'})} className="inline-flex items-center justify-center gap-3 bg-espresso text-milk px-7 py-4 text-[11px] tracking-[0.2em] uppercase">Підібрати за 60 секунд <ArrowRight className="w-4 h-4"/></Link></div></div></section>;
}