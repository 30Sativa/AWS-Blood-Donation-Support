import Header from "../components/homepage/Header";
import HeroSection from "../components/homepage/HeroSection";
import BloodTypeSection from "../components/homepage/BloodTypeSection";
import ServicesSection from "../components/homepage/ServicesSection";
import WhyDonateSection from "../components/homepage/WhyDonateSection";
import BecomeHeroSection from "../components/homepage/BecomeHeroSection";
import Footer from "../components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <BloodTypeSection />
      <ServicesSection />
      <WhyDonateSection />
      <BecomeHeroSection />
      <Footer />
    </div>
  );
}
