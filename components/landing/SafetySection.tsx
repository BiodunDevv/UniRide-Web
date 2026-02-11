"use client";

import { Shield, UserCheck, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafetySection() {
  const safetyTips = {
    passengers: [
      "Always verify the driver and vehicle details before entering",
      "Sit in the back seat for rides with unknown drivers",
      "Always share your trip details with a trusted contact",
      "Trust your instincts - if something feels wrong, don't get in",
      "Keep the app open during your ride for easy access to safety features",
      "Rate and review your driver after each trip",
    ],
    drivers: [
      "Complete the safety training before your first ride",
      "Keep your vehicle clean and well-maintained",
      "Verify passenger identity before starting the trip",
      "Follow traffic rules and speed limits at all times",
      "Report any safety concerns immediately",
      "Maintain professional behavior with all passengers",
    ],
  };

  return (
    <section id="safety" className="py-16 sm:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary mb-4">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Protecting Every Ride
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Multiple layers of security features ensure every ride is safe,
            reliable, and trustworthy for our student community.
          </p>
        </div>

        {/* Safety Tips */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Passenger Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Safety Tips for Passengers
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {safetyTips.passengers.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <div className="shrink-0 w-5 h-5 bg-blue-500 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/80">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Driver Tips */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Safety Guidelines for Drivers
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {safetyTips.drivers.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <div className="shrink-0 w-5 h-5 bg-green-500 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm sm:text-base text-foreground/80">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
