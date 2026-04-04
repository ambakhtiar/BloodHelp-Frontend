import HeroCarousel from "../components/home/HeroCarousel";
import MotivationalSlider from "../components/home/MotivationalSlider";
import EmergencyRequests from "../components/home/EmergencyRequests";
import BenefitsSection from "../components/home/BenefitsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";

export default function HomePage() {
  return (
    <main>
      <HeroCarousel />
      <MotivationalSlider />
      <EmergencyRequests />
      <BenefitsSection />
      <HowItWorksSection />
    </main>
  );
}
