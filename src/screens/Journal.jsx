'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';
import Reveal from '@/components/domera/Reveal';

export default function Journal({ initialPosts = null } = {}) {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    if (initialPosts) return;
    base44.entities.Blog.filter({ published: true })
      .then((res) => setPosts((res || []).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))))
      .catch(() => setPosts([]));
  }, [initialPosts]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo title="Журнал DOMERA — про сон та інтерʼєр" description="Статті про вибір матраців, ліжка, текстиль та догляд за спальнею від DOMERA." canonical="/journal" />
      <Header />
      <main className="pt-[78px]">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16 md:py-24">
          <nav className="text-xs text-[#937C68] mb-6 flex gap-2">
            <Link to="/" className="hover:text-[#342112]">Головна</Link><span>/</span><span className="text-[#342112]">Журнал</span>
          </nav>
          <p className="text-[11px] tracking-[0.32em] uppercase text-[#937C68] mb-4">DOMERA Journal</p>
          <h1 className="font-heading text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] text-[#342112] max-w-3xl">Журнал про сон та інтерʼєр</h1>
          <p className="mt-5 text-[#755A44] max-w-xl">Матеріали про вибір матраців, ліжка, текстиль та догляд за спальнею — від команди DOMERA.</p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {!posts && [...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-[#F5E4D1] animate-pulse" />)}
            {posts?.length === 0 && <p className="text-[#937C68]">Статті скоро зʼявляться.</p>}
            {posts?.map((p, i) => (
              <Reveal key={p.id} delay={i * 70} as={Link} to={`/journal/${p.slug}`} className="group block">
                <div className="relative overflow-hidden aspect-[4/5] mb-5">
                  {p.coverImage && <img src={p.coverImage} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.04]" />}
                  {p.tag && <span className="absolute top-4 left-4 bg-[#FAF7F2]/90 backdrop-blur px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase text-[#342112]">{p.tag}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl text-[#342112] leading-snug pr-4 group-hover:text-[#755A44] transition-colors">{p.title}</h2>
                  <ArrowUpRight className="w-5 h-5 text-[#937C68] flex-shrink-0 group-hover:text-[#342112] transition-colors" strokeWidth={1.4} />
                </div>
                {p.excerpt && <p className="mt-3 text-sm text-[#755A44] leading-relaxed line-clamp-2">{p.excerpt}</p>}
                <p className="mt-3 text-sm text-[#937C68]">{p.readTime || '5 хв'} читання</p>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}