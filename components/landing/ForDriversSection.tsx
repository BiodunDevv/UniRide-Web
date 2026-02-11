"use client";

import Link from "next/link";
import { Car, Shield, CheckCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ForDriversSection() {
  const requirements = [
    "Must be at least 21 years old",
    "Valid Nigerian driver's license (minimum 2 years)",
    "Registered and insured vehicle",
    "Clean driving record",
    "Smartphone with GPS capability",
    "Pass background verification check",
  ];

  const howToStart = [
    {
      step: 1,
      title: "Submit Application",
      description:
        "Fill out our online driver application form. It takes less than 10 minutes.",
    },
    {
      step: 2,
      title: "Document Verification",
      description:
        "Upload your license, vehicle documents, and insurance. We'll verify everything within 24-48 hours.",
    },
    {
      step: 3,
      title: "Vehicle Inspection",
      description:
        "Schedule a quick vehicle inspection at one of our partner locations.",
    },
    {
      step: 4,
      title: "Start Earning",
      description:
        "Get approved and start accepting ride requests! Your first ride is just a tap away.",
    },
  ];

  const earnings = {
    baseFare: "₦500",
    perKm: "₦50/km",
    perMinute: "₦10/min",
    minimumFare: "₦200",
  };

  return (
    <section id="drivers" className="py-16 sm:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Drive with UniRide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Turn your car into an income-generating asset. Join our community of
            trusted drivers and start earning on your own terms.
          </p>
          <Button size="default" className="text-sm px-6" asChild>
            <Link href="/driver-apply">
              <Car className="w-5 h-5 mr-2" />
              Become a Driver
            </Link>
          </Button>
        </div>

        {/* Earnings Potential */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-10 mb-12 sm:mb-16 shadow-xl">
          <h3 className="text-base sm:text-lg font-bold text-primary-foreground text-center mb-3">
            Current Fare Policy
          </h3>
          <p className="text-center text-primary-foreground/70 text-xs sm:text-sm mb-6">
            Active fare settings - Admin controlled mode
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Base Fare", value: earnings.baseFare },
              { label: "Per KM Rate", value: earnings.perKm },
              { label: "Per Minute Rate", value: earnings.perMinute },
              { label: "Minimum Fare", value: earnings.minimumFare },
            ].map((item) => (
              <Card
                key={item.label}
                className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20 text-center"
              >
                <CardContent className="pt-6">
                  <p className="text-xs sm:text-sm text-primary-foreground/70 mb-2">
                    {item.label}
                  </p>
                  <p className="text-2xl sm:text-2xl font-bold text-accent">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-primary-foreground/70 text-xs sm:text-sm mt-6">
            * Fares are calculated automatically based on distance and duration.
            Drivers earn competitive rates for every ride.
          </p>
        </div>

        {/* Requirements & How to Start */}
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4">
              Driver Requirements
            </h3>
            <div className="space-y-3">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {req}
                  </p>
                </div>
              ))}
            </div>
            <Alert className="mt-6 border border-blue-200 bg-blue-50">
              <Shield className="w-4 h-4 text-blue-600" />
              <AlertTitle className="font-semibold text-blue-900 text-sm">
                Safety First
              </AlertTitle>
              <AlertDescription className="text-xs text-blue-800">
                All drivers undergo thorough background checks and vehicle
                inspections to ensure the safety of our student community.
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4">
              How to Get Started
            </h3>
            <div className="space-y-3">
              {howToStart.map((item) => (
                <Card
                  key={item.step}
                  className="border border-border hover:border-primary transition-colors"
                >
                  <CardContent className="flex gap-4 py-4">
                    <Badge className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {item.step}
                    </Badge>
                    <div>
                      <CardTitle className="font-semibold text-foreground mb-0.5 text-sm">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
