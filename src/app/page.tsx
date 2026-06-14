import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { BenefitsGrid } from "@/components/sections/BenefitsGrid";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PricingSection } from "@/components/sections/PricingSection";
import { SectorGrid } from "@/components/sections/SectorGrid";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BenefitsGrid />
        <PricingSection />
        <HowItWorks />
        <SectorGrid />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
