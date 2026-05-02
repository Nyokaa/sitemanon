import { Header } from "./components/Header";
import { JsonLd } from "./components/JsonLd";
import { MobileStickyCta } from "./components/MobileStickyCta";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
import { Services } from "./sections/Services";
import { Gallery } from "./sections/Gallery";
import { About } from "./sections/About";
import { Reviews } from "./sections/Reviews";
import { Studio } from "./sections/Studio";
import { FirstVisit } from "./sections/FirstVisit";
import { Faq } from "./sections/Faq";
import { FinalCta } from "./sections/FinalCta";
import { Footer } from "./sections/Footer";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Gallery />
        <About />
        <Reviews />
        <Studio />
        <FirstVisit />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileStickyCta />
    </>
  );
}
