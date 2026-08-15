'use client';
import { useEffect, useState } from 'react';
import { useParams, Link } from '@/lib/router';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import Header from '@/components/domera/Header';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';
import ProductCard from '@/components/domera/ProductCard';
import { Image } from '@/components/ui/image';

export default function JournalArticle({ initialPost = null, initialRelated = [] } = {}) {
  const { slug } = useParams();
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [related, setRelated] = useState(initialRelated);

  useEffect(() => {
    if (initialPost && initialPost.slug === slug) { setPost(initialPost); setRelated(initialRelated || []); setLoading(false); return; }
    setLoading(true);
    base44.entities.Blog.filter({ slug, published: true })
      .then(async (res) => {
        const p = (res || [])[0];
        setPost(p);
        if (p && p.relatedProductIds?.length) {
          const all = await base44.entities.Product.list('-updated_date', 100);
          setRelated((all || []).filter((pr) => p.relatedProductIds.includes(pr.id)).slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, initialPost, initialRelated]);

  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen">
        <Header />
        <div className="pt-[120px] mx-auto max-w-3xl px-6"><div className="h-80 bg-[#F5E4D1] animate-pulse" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen">
        <Header />
        <div className="pt-[140px] pb-32 text-center px-6">
          <h1 className="font-heading text-4xl text-[#342112]">Статтю не знайдено</h1>
          <Link to="/journal" className="mt-6 inline-block text-[#755A44] underline">Повернутись до журналу</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.coverImage ? [post.coverImage] : undefined,
    description: post.excerpt || post.seoDescription || '',
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: post.author || 'DOMERA' },
    publisher: { '@type': 'Organization', name: 'DOMERA' },
    mainEntityOfPage: `https://domera.shop/journal/${post.slug}`,
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen">
      <Seo
        title={post.seoTitle || `${post.title} — DOMERA Journal`}
        description={post.seoDescription || post.excerpt || ''}
        canonical={`/journal/${post.slug}`}
        image={post.coverImage}
        jsonLd={[articleLd]}
      />
      <Header />
      <main className="pt-[78px]">
        <article className="mx-auto max-w-3xl px-6 py-12 md:py-20">
          <nav className="text-xs text-[#937C68] mb-6 flex gap-2">
            <Link to="/" className="hover:text-[#342112]">Головна</Link><span>/</span>
            <Link to="/journal" className="hover:text-[#342112]">Журнал</Link><span>/</span>
            <span className="text-[#342112] truncate">{post.title}</span>
          </nav>

          {post.tag && <p className="text-[11px] tracking-[0.32em] uppercase text-[#C6A17A] mb-4">{post.tag}</p>}
          <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.08] text-[#342112]">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-[#937C68]">
            {post.author && <span>{post.author}</span>}
            {dateStr && <span>· {dateStr}</span>}
            {post.readTime && <span>· {post.readTime} читання</span>}
          </div>

          {post.coverImage && (
            <div className="mt-10 aspect-[16/10] overflow-hidden bg-[#F5E4D1]">
              <Image src={post.coverImage} alt={post.title} className="w-full h-full" />
            </div>
          )}

          {post.excerpt && <p className="mt-10 font-heading text-2xl text-[#342112] leading-snug">{post.excerpt}</p>}

          <div className="mt-10 prose-journal text-[#342112] leading-relaxed">
            <ReactMarkdown>{post.content || ''}</ReactMarkdown>
          </div>

          <div className="mt-14 pt-8 border-t border-[#342112]/10">
            <Link to="/journal" className="inline-flex items-center gap-2 text-sm text-[#342112] hover:text-[#755A44]">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.4} /> Усі статті
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-6 lg:px-12 pb-20">
            <h2 className="font-heading text-3xl text-[#342112] mb-8">Рекомендуємо</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}