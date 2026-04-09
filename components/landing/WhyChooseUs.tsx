import {
  Shield,
  MapPin,
  CreditCard,
  Users,
  Lock,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: "Biometric Security",
      description:
        "Advanced biometric authentication and single-device binding ensures only verified students can access the platform.",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description:
        "Track your ride in real-time with GPS-enabled live location updates powered by OpenStreetMap and OpenRouteService.",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description:
        "Choose between cash or bank transfer payments. View driver bank details securely after booking confirmation.",
    },
    {
      icon: Users,
      title: "Verified Drivers",
      description:
        "All drivers undergo thorough verification with ID uploads and admin approval before they can offer rides.",
    },
    {
      icon: Lock,
      title: "Secure Check-In",
      description:
        "4-digit check-in codes ensure you board the right ride. Codes are generated per ride for maximum security.",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description:
        "Built specifically for mobile devices with an intuitive interface designed for students on the go.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Why Students Choose UniRide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Experience a secure campus ride-hailing platform designed for
            university students who need fast, safe, and reliable daily
            transportation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border-border bg-card"
              >
                <CardHeader>
                  <div className="w-10 h-10 bg-primary flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed text-xs">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
