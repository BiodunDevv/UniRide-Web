import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ForDriversSection from "@/components/landing/ForDriversSection";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import SafetySection from "@/components/landing/SafetySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <ForDriversSection />
      <WhyChooseUs />
      <SafetySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
