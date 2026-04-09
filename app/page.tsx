import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ForDriversSection from "@/components/landing/ForDriversSection";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import SafetySection from "@/components/landing/SafetySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import { createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Campus Ride-Hailing Platform for Safe University Transportation",
  description:
    "UniRide helps universities deliver safe campus rides with verified drivers, live tracking, and a mobile-first university transportation app for students.",
  path: "/",
  keywords: [
    "campus ride-hailing platform",
    "university transportation app",
    "safe campus rides",
    "student ride-hailing",
    "campus mobility software",
  ],
});

export default function Page() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/og-image.png`,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/support`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
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
    </>
  );
}
