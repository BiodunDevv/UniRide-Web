"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            About Our University Transportation Platform
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            UniRide is a secure campus ride-hailing platform designed
            exclusively for university students who need dependable campus
            transportation in Nigeria.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Card className="border-none shadow-none bg-transparent py-0">
            <CardContent className="p-2 space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Our Mission
              </h3>
              <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
                <p>
                  UniRide reimagines campus transportation with a student-first
                  platform where riders can create accounts, request rides,
                  track drivers in real time, and complete secure payments with
                  less friction.
                </p>
                <p>
                  Our campus mobility software includes biometric
                  authentication, single-device restriction, and secure ride
                  check-in codes. Every driver completes identity verification
                  and screening before approval.
                </p>
                <p>
                  UniRide combines modern real-time technology with operational
                  safety controls to deliver safe campus rides, reliable driver
                  coordination, and affordable university transportation across
                  Nigerian campuses.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80"
              alt="University students using campus transportation"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 relative z-10">
                <p className="text-primary-foreground text-base sm:text-lg font-bold mb-1">
                  Making Campus Travel Simple
                </p>
                <p className="text-primary-foreground/70 text-xs sm:text-sm">
                  Safe • Reliable • Affordable
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
