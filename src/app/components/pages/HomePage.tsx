import { Navbar } from "../Navbar";
import { HeroSection } from "../HeroSection";
import { FeaturesSection } from "../FeaturesSection";
import { TrendingInternships } from "../TrendingInternships";
import { PartnerCompanies } from "../PartnerCompanies";
import { Footer } from "../Footer";

export function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TrendingInternships />
      <PartnerCompanies />
      <Footer />
    </div>
  );
}
