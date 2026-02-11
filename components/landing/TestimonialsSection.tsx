"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Chioma Okafor",
      role: "Computer Science Student, UNILAG",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
      text: "UniRide has made getting to campus so much easier! The drivers are verified and professional. I feel safe using it even for late evening classes. Best campus transportation app!",
      rating: 5,
    },
    {
      name: "Tunde Adebayo",
      role: "Business Administration, UI",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
      text: "The real-time tracking feature gives me peace of mind. My parents can see exactly where I am during rides. Plus, the fares are very affordable for students like us.",
      rating: 5,
    },
    {
      name: "Amaka Nwosu",
      role: "Medical Student, UNIBEN",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      text: "I've been using UniRide for 6 months now. The 4-digit check-in code system is brilliant! No more mix-ups with drivers. It's exactly what students need.",
      rating: 5,
    },
    {
      name: "Ibrahim Hassan",
      role: "Engineering Student, ABU",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      text: "As a student who doesn't have a car, UniRide has been a lifesaver. Quick pickups, professional drivers, and the payment options work perfectly for me. Highly recommended!",
      rating: 5,
    },
    {
      name: "Grace Okoro",
      role: "Law Student, UNIPORT",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      text: "The safety features are top-notch! I love that I can share my ride details with family. The drivers are always respectful and the app is super easy to use.",
      rating: 5,
    },
    {
      name: "Emeka Eze",
      role: "Economics Student, UNIZIK",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      text: "UniRide understands student life. Affordable fares, reliable drivers, and the biometric login makes me feel secure. Best decision I made this semester!",
      rating: 5,
    },
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-9xl mx-auto w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-0">
              What Students Say
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Based on reviews from students
            </p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="w-72 md:w-80 shrink-0 bg-card border-none shadow-sm"
              >
                <CardContent className="pt-6">
                  {/* Stars */}
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </CardContent>
                <CardFooter className="border-none pt-0">
                  <div className="flex items-center space-x-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => scroll("left")}
              className="rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 bg-card"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </Button>
            <Button
              size="icon-lg"
              onClick={() => scroll("right")}
              className="rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
