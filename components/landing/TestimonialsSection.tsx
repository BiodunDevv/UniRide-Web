"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Testimonial {
  name: string;
  role: string;
  image?: string;
  title: string;
  text: string;
  rating: number;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reviews/public`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          const mapped: Testimonial[] = data.data.map((r: any) => ({
            name: r.user_id?.name || "UniRide User",
            role:
              r.user_id?.role === "driver" ? "UniRide Driver" : "UniRide User",
            image: r.user_id?.profile_picture || undefined,
            title: r.title || "",
            text: r.message,
            rating: r.rating,
          }));
          setTestimonials(mapped);
        }
      } catch {
        // No fallback — show CTA instead
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

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

  if (isLoading) return null;

  // ── No reviews yet — show professional CTA ──
  if (testimonials.length === 0) {
    return (
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Your Voice Matters
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            We&apos;re building something special for students across Nigeria.
            Be among the first to share your experience — download the UniRide
            app, take a ride, and let the community know what you think.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/reviews">
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground/60">
            Reviews from verified UniRide users will appear here once submitted.
          </p>
        </div>
      </section>
    );
  }

  // ── Show real reviews ──
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-9xl mx-auto w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-0">
              What Students Say
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Based on {testimonials.length} verified review
              {testimonials.length !== 1 ? "s" : ""}
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
                className="w-72 md:w-80 shrink-0 bg-card border-none shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="pt-6 pb-4">
                  {/* Stars */}
                  <div className="flex items-center space-x-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-current"
                            : "text-muted-foreground/20 fill-current"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  {testimonial.title && (
                    <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1">
                      {testimonial.title}
                    </h3>
                  )}

                  {/* Review text */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
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
