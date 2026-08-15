'use client';
import Header from '@/components/domera/Header';
import Hero from '@/components/domera/Hero';
import TrustStrip from '@/components/domera/TrustStrip';
import Categories from '@/components/domera/Categories';
import Philosophy from '@/components/domera/Philosophy';
import Bestsellers from '@/components/domera/Bestsellers';
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
  description: 'Український бренд продуманого комфорту спальні — ліжка, матраци та текстиль від власного виробництва.',
  sameAs: ['https://instagram.com/domera.shop'],
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
        title="DOMERA — ліжка, матраци та текстиль для спальні | Власне виробництво"
        description="Український бренд продуманого комфорту спальні. Ліжка, матраци, подушки та текстиль від власного виробництва. Виготовлення 7–10 днів, гарантія до 5 років, доставка по Україні."
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