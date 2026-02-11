"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const campusImages = [
    {
      url: "https://images.unsplash.com/photo-1742069207735-105f52f05e59?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dWl2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjb21tdXRpbmd8ZW58MHx8MHx8fDA%3D",
      alt: "University students commuting",
    },
    {
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
      alt: "Campus ride sharing",
    },
    {
      url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
      alt: "Safe campus transportation",
    },
    {
      url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
      alt: "Students arriving at campus",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campusImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [campusImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campusImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + campusImages.length) % campusImages.length,
    );
  };

  return (
    <section
      id="home"
      className="relative min-h-[85vh] flex items-center bg-primary overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 order-2 lg:order-1 z-10">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="bg-primary-foreground/10 text-primary-foreground/80 border-primary-foreground/20 px-3 py-1 text-xs uppercase tracking-wider backdrop-blur-sm"
              >
                Secure Campus Ride Hailing System
              </Badge>

              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground leading-tight">
                Your Trusted Campus
                <br />
                <span className="text-primary-foreground/80">
                  Ride-Hailing Platform
                </span>
              </h1>

              <p className="text-sm md:text-base text-primary-foreground/70 leading-relaxed max-w-xl">
                Connect with verified campus drivers through UniRide. Experience
                secure rides with biometric authentication, real-time GPS
                tracking, and seamless payment options.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="default"
                variant="default"
                className="hover:scale-[1.02] transition-transform text-sm"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Download App
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-primary-foreground/30  hover:bg-primary-foreground/10 text-sm"
                asChild
              >
                <Link href="/driver-apply">Become a Driver</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Image Slideshow */}
          <div className="relative order-1 lg:order-2 z-10">
            <div className="relative aspect-square lg:aspect-4/3 overflow-hidden shadow-2xl group">
              {/* Images */}
              {campusImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
                </div>
              ))}

              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card text-foreground shadow-lg hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card text-foreground shadow-lg hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {campusImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-white w-8"
                        : "bg-white/50 hover:bg-white/75 w-2"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Info Badge */}
              <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm p-2.5 shadow-lg">
                <div className="text-base font-bold text-foreground">2000+</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Campus Rides
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
