'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from './Reveal';
import { Image } from '@/components/ui/image';

export default function Journal() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    base44.entities.Blog.filter({ published: true })
      .then((res) => setPosts((res || []).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)).slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  if (!posts) return null;
  if (posts.length === 0) return null;

  return (
    <section className="bg-ivory py-24 md:py-36 border-t border-espresso/10">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="flex items-end justify-between mb-14 md:mb-20 flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-bronze mb-4">DOMERA Journal</p>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.08] text-espresso">
              Журнал про сон та інтерʼєр
            </h2>
          </div>
          <Link to="/journal" className="text-[12px] tracking-[0.22em] uppercase text-espresso border-b border-espresso pb-1 hover:text-clay hover:border-clay transition-colors">Усі статті</Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 90} as={Link} to={`/journal/${p.slug}`} className="group block">
              <div className="relative overflow-hidden aspect-[4/5] mb-5 border border-espresso/10">
                {p.coverImage && <Image src={p.coverImage} alt={p.title} className="w-full h-full transition-transform duration-[1100ms] group-hover:scale-[1.04]" />}
                {p.tag && <span className="absolute top-4 left-4 bg-espresso/85 backdrop-blur px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase text-milk border border-milk/15">{p.tag}</span>}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-2xl text-espresso leading-snug pr-4 group-hover:text-clay transition-colors">{p.title}</h3>
                <ArrowUpRight className="w-5 h-5 text-espresso/50 flex-shrink-0 group-hover:text-espresso transition-colors" strokeWidth={1.4} />
              </div>
              <p className="mt-3 text-sm text-mocha">{p.readTime || '5 хв'} читання</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}