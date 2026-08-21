'use client';
import Header from '@/components/domera/Header';
import Hero from '@/components/domera/Hero';
import TrustStrip from '@/components/domera/TrustStrip';
import Categories from '@/components/domera/Categories';
import Philosophy from '@/components/domera/Philosophy';
import Bestsellers from '@/components/domera/Bestsellers';
import SmartFinderCTA from '@/components/domera/SmartFinderCTA';
import ProductSpotlight from '@/components/domera/ProductSpotlight';
import Bundles from '@/components/domera/Bundles';
import SleepSystem from '@/components/domera/SleepSystem';
import Configurator from '@/components/domera/Configurator';
import Materials from '@/components/domera/Materials';
import Production from '@/components/domera/Production';
import WhyDomera from '@/components/domera/WhyDomera';
import Showroom from '@/components/domera/Showroom';
import TradeIn from '@/components/domera/TradeIn';
import B2BSection from '@/components/domera/B2BSection';
import Reviews from '@/components/domera/Reviews';
import UGCMosaic from '@/components/domera/UGCMosaic';
import Journal from '@/components/domera/Journal';
import FAQ from '@/components/domera/FAQ';
import FinalCTA from '@/components/domera/FinalCTA';
import Footer from '@/components/domera/Footer';
import Seo from '@/components/Seo';

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DOMERA',
  url: 'https://domera.shop',
  description: 'DOMERA — магазин товарів для сучасної спальні: ліжка, матраци та текстиль.',
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DOMERA',
  url: 'https://domera.shop',
};

export default function Home() {
  return (
    <div className="bg-espresso" style={{ overflowX: 'hidden' }}>
      <Seo
        title="DOMERA — ліжка, матраци та текстиль для спальні"
        description="Ліжка, матраци, подушки та текстиль для сучасної спальні. Допомагаємо підібрати розмір, комплектацію та рішення для комфортного сну з доставкою по Україні."
        canonical="/"
        jsonLd={[organizationLd, websiteLd]}
      />
      <Header dark />
      <Hero />
      <div className="home-grad home-scale">
      <main>
        <TrustStrip />
        <Categories />
        <Philosophy />
        <Bestsellers />
        <SmartFinderCTA />
        <ProductSpotlight />
        <Bundles />
        <SleepSystem />
        <Configurator />
        <Materials />
        <Production />
        <WhyDomera />
        <Showroom />
        <TradeIn />
        <B2BSection />
        <Reviews />
        <UGCMosaic />
        <Journal />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      </div>
    </div>
  );
}