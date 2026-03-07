"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Navigation,
  Shield,
  Clock,
  CreditCard,
  User,
  GraduationCap,
  ExternalLink,
  Globe,
  Route,
  Zap,
  Map,
  Info,
  Check,
  Building2,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

// ─── Shared Header ────────────────────────────────────────────────────────────
function PageHeader({ subtitle }: { subtitle?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 p-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={`flex items-center justify-between border border-transparent px-3 py-2 sm:px-6 sm:py-3 transition-all duration-300 ease-out ${
            isScrolled
              ? "bg-primary shadow-lg backdrop-blur-2xl"
              : "bg-transparent backdrop-blur-xl"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-80"
          >
            <Logo className="w-7 h-auto" variant="light" />
            <span>UniRide</span>
          </Link>
          {subtitle && (
            <span className="hidden sm:block text-xs text-white/50 font-medium tracking-wide">
              {subtitle}
            </span>
          )}
          <Button variant="secondary" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Shared Footer ────────────────────────────────────────────────────────────
function PageFooter() {
  return (
    <footer className="mt-auto pt-8 pb-6 px-4">
      <div className="max-w-3xl mx-auto">
        <Separator className="bg-white/10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-auto opacity-60" variant="light" />
            <span className="text-xs text-white/50 font-medium">UniRide</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link
              href="/terms"
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Terms
            </Link>
            <span className="text-white/20">·</span>
            <a
              href="mailto:support@uniride.ng"
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Support
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-white/20">·</span>
            <span>© {new Date().getFullYear()} UniRide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 p-3 bg-[#042F40]/5 border border-[#042F40]/10 hover:border-[#042F40]/20 transition-colors">
      <div className="w-9 h-9 bg-[#042F40]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4.5 h-4.5 text-[#042F40]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#042F40]">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────
function TimelineItem({
  month,
  label,
  isActive,
  isPast,
}: {
  month: string;
  label: string;
  isActive: boolean;
  isPast: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0 ${
          isPast
            ? "bg-green-100 text-green-700"
            : isActive
              ? "bg-[#042F40] text-white"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {isPast ? <Check className="w-3.5 h-3.5" /> : month}
      </div>
      <div className="flex-1">
        <p
          className={`text-xs font-medium ${
            isPast
              ? "text-green-700"
              : isActive
                ? "text-[#042F40] font-semibold"
                : "text-gray-400"
          }`}
        >
          {label}
        </p>
      </div>
      <span
        className={`text-xs font-semibold ${
          isPast
            ? "text-green-600"
            : isActive
              ? "text-[#042F40]"
              : "text-gray-300"
        }`}
      >
$15
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function APISubscriptionPage() {
  const MONTHLY_PRICE = 15;
  const MONTHS = 6;
  const TOTAL = MONTHLY_PRICE * MONTHS;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
      <PageHeader subtitle="API Services" />

      <div className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* ── Hero Card ─────────────────────────────────────────── */}
          <div className="bg-white p-5 sm:p-8 shadow-2xl">
            {/* Mapbox Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4264fb] flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#042F40]">
                    Mapbox API Services
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Maps, Navigation & Geocoding Platform
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[#4264fb] border-[#4264fb]/30 bg-[#4264fb]/5 hidden sm:flex"
              >
                Required Service
              </Badge>
            </div>

            <Separator className="mb-5" />

            {/* Project Context */}
            <Alert className="mb-5 border-blue-200 bg-blue-50">
              <Info className="size-4 text-blue-700" />
              <AlertTitle className="text-blue-900 text-xs font-semibold">
                About This Subscription
              </AlertTitle>
              <AlertDescription className="text-blue-800 text-xs leading-relaxed">
                Mapbox is a core API dependency for the UniRide final year
                project. It provides the real-time maps, route calculations, and
                location search features that make the ride-hailing application
                functional. Without Mapbox, the app cannot display maps, calculate
                routes, or match riders with drivers.
              </AlertDescription>
            </Alert>

            {/* Student Information */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#042F40]" />
                <h3 className="font-semibold text-[#042F40] text-sm">
                  Student Information
                </h3>
              </div>
              <div className="border bg-muted/30 p-4 space-y-2.5 text-xs">
                {[
                  ["Full Name", "Oladele Oladayo Isaac"],
                  ["Matric Number", "BU22CSC1043"],
                  ["Department", "Computer Science"],
                  ["Project", "UniRide — Campus Ride-Hailing System"],
                  ["Institution", "Bowen University"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <span className="font-medium text-[#042F40] text-right">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-1">
                  <span className="text-muted-foreground shrink-0">
                    Project Duration
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[#042F40] border-[#042F40]/20 bg-[#042F40]/5"
                  >
                    6 Months (Final Year)
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Why Mapbox is Essential */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-4 h-4 text-[#042F40]" />
                <h3 className="font-semibold text-[#042F40] text-sm">
                  Why Mapbox Is Essential
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                UniRide is a real-time campus ride-hailing application — similar
                to Uber or Bolt — built as a final year Computer Science project.
                The following core features are powered entirely by Mapbox and
                cannot function without it:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <FeatureCard
                  icon={MapPin}
                  title="Interactive Live Maps"
                  description="Displays real-time maps showing rider and driver locations, campus landmarks, and pick-up/drop-off points across the university."
                />
                <FeatureCard
                  icon={Route}
                  title="Route Calculation"
                  description="Calculates the optimal driving route between pickup and destination, including distance, estimated time of arrival, and turn-by-turn directions."
                />
                <FeatureCard
                  icon={Navigation}
                  title="Real-Time GPS Tracking"
                  description="Tracks drivers in real-time so riders can watch their driver approach — critical for safety and ride coordination on campus."
                />
                <FeatureCard
                  icon={Globe}
                  title="Location Search & Geocoding"
                  description="Converts typed addresses into GPS coordinates and vice versa, enabling riders to search for destinations by name."
                />
                <FeatureCard
                  icon={Zap}
                  title="ETA & Fare Estimation"
                  description="Uses route distance and duration to calculate ride fare estimates and display accurate arrival times to both riders and drivers."
                />
                <FeatureCard
                  icon={Shield}
                  title="Safety & Ride Matching"
                  description="Proximity-based driver matching uses geospatial queries powered by Mapbox to pair riders with the nearest available driver."
                />
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Pricing Breakdown */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-[#042F40]" />
                <h3 className="font-semibold text-[#042F40] text-sm">
                  Subscription Plan — 6 Months
                </h3>
              </div>

              {/* Plan Card */}
              <div className="border-2 border-[#042F40] p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-[#042F40]">
                      Mapbox API — Standard Plan
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Maps, Directions, Geocoding & Navigation SDK
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#042F40]">
                      ${MONTHLY_PRICE}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* What's Included */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-[#042F40] uppercase tracking-wider">
                    Included in plan
                  </p>
                  {[
                    "100,000 map loads per month",
                    "100,000 geocoding requests per month",
                    "100,000 directions requests per month",
                    "Real-time Navigation SDK access",
                    "Maps SDK for React Native (Android & iOS)",
                    "Turn-by-turn navigation support",
                    "Standard support & documentation access",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-[#042F40]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Timeline */}
              <div className="border bg-muted/30 p-4 mb-4">
                <p className="text-xs font-semibold text-[#042F40] uppercase tracking-wider mb-3">
                  Payment Schedule
                </p>
                <div className="space-y-3">
                  <TimelineItem
                    month="M1"
                    label="Month 1 — Project Setup & Core Architecture"
                    isActive={true}
                    isPast={false}
                  />
                  <TimelineItem
                    month="M2"
                    label="Month 2 — Core Feature Development"
                    isActive={false}
                    isPast={false}
                  />
                  <TimelineItem
                    month="M3"
                    label="Month 3 — Advanced Features & Integration"
                    isActive={false}
                    isPast={false}
                  />
                  <TimelineItem
                    month="M4"
                    label="Month 4 — User Testing & Optimization"
                    isActive={false}
                    isPast={false}
                  />
                  <TimelineItem
                    month="M5"
                    label="Month 5 — Final Testing & Documentation"
                    isActive={false}
                    isPast={false}
                  />
                  <TimelineItem
                    month="M6"
                    label="Month 6 — Project Defense & Submission"
                    isActive={false}
                    isPast={false}
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-[#042F40] p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white/80">
                    Monthly Cost
                  </p>
                  <p className="text-sm font-semibold">
                    ${MONTHLY_PRICE} × {MONTHS} months
                  </p>
                </div>
                <Separator className="bg-white/10 mb-3" />
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold">Total Investment</p>
                  <p className="text-2xl font-bold">${TOTAL}</p>
                </div>
                <p className="text-xs text-white/50 mt-2 text-right">
                  Billed monthly for project duration
                </p>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Why This Matters */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-[#042F40]" />
                <h3 className="font-semibold text-[#042F40] text-sm">
                  Why This Investment Matters
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: Building2,
                    title: "Industry-Standard Technology",
                    desc: "Mapbox is used by Uber, Instacart, Shopify, and thousands of production applications worldwide. Using it demonstrates professional-grade engineering in Dayo's final year project.",
                  },
                  {
                    icon: GraduationCap,
                    title: "Academic Excellence",
                    desc: "A fully functional ride-hailing system with real maps, live tracking, and route optimization showcases advanced software engineering skills — standing out during project defense.",
                  },
                  {
                    icon: Shield,
                    title: "No Free Alternative Exists",
                    desc: "Google Maps API is significantly more expensive ($7+ per 1,000 loads). Mapbox offers the best value for mobile map rendering, navigation, and geocoding at this price point.",
                  },
                  {
                    icon: Clock,
                    title: "Limited Duration — 6 Months Only",
                    desc: "This is not a recurring subscription beyond the project timeline. The service will only be active for the 6-month duration needed to develop, test, and defend the final year project.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-amber-50/60 border border-amber-200/50"
                  >
                    <div className="w-8 h-8 bg-amber-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#042F40]">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Cost Comparison */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-[#042F40]" />
                <h3 className="font-semibold text-[#042F40] text-sm">
                  Cost Comparison With Alternatives
                </h3>
              </div>
              <div className="border bg-muted/30">
                <div className="grid grid-cols-3 gap-0 text-xs">
                  <div className="p-3 font-semibold text-[#042F40] bg-muted/50 border-b">
                    Service
                  </div>
                  <div className="p-3 font-semibold text-[#042F40] bg-muted/50 border-b text-center">
                    Monthly Cost
                  </div>
                  <div className="p-3 font-semibold text-[#042F40] bg-muted/50 border-b text-center">
                    6-Month Total
                  </div>

                  {/* Google Maps */}
                  <div className="p-3 text-muted-foreground border-b">
                    Google Maps Platform
                  </div>
                  <div className="p-3 text-muted-foreground border-b text-center">
                    ~$70+
                  </div>
                  <div className="p-3 text-muted-foreground border-b text-center">
                    ~$420+
                  </div>

                  {/* Mapbox */}
                  <div className="p-3 font-medium text-[#042F40] bg-green-50 border-b flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Mapbox
                  </div>
                  <div className="p-3 font-semibold text-green-700 bg-green-50 border-b text-center">
                    $15
                  </div>
                  <div className="p-3 font-semibold text-green-700 bg-green-50 border-b text-center">
                    $90
                  </div>

                  {/* HERE Maps */}
                  <div className="p-3 text-muted-foreground">
                    HERE Maps API
                  </div>
                  <div className="p-3 text-muted-foreground text-center">
                    ~$49+
                  </div>
                  <div className="p-3 text-muted-foreground text-center">
                    ~$294+
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Mapbox offers the most affordable option with full feature
                coverage for mobile ride-hailing applications.
              </p>
            </div>

            {/* CTA */}
            <Alert className="mb-5 border-green-200 bg-green-50">
              <CheckCircle2 className="size-4 text-green-700" />
              <AlertTitle className="text-green-900 text-xs font-semibold">
                Summary
              </AlertTitle>
              <AlertDescription className="text-green-800 text-xs leading-relaxed">
                A total investment of{" "}
                <span className="font-bold">${TOTAL}</span> (
                ${MONTHLY_PRICE}/month × {MONTHS} months) enables all
                mapping, navigation, and location features required for the
                UniRide final year project. This is the most cost-effective
                professional mapping solution available.
              </AlertDescription>
            </Alert>

            {/* Payment Method */}
            <div className="border-2 border-dashed border-[#042F40]/20 p-5 mb-4 bg-[#042F40]/2">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-[#042F40]" />
                <h3 className="font-semibold text-[#042F40] text-sm">
                  Payment Information
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                The Mapbox API subscription is billed directly through the Mapbox
                platform. Payment can be made via international debit or credit
                card (Visa, Mastercard). The subscription will be set up under
                Dayo&apos;s developer account and can be cancelled at any time after
                the project concludes.
              </p>
              <div className="border bg-white p-4 space-y-2.5 text-xs">
                {[
                  ["Billing Cycle", "Monthly"],
                  ["Amount Per Month", "$15 (approx. ₦23,500)"],
                  ["Total Duration", "6 months"],
                  ["Total Cost", "$90 (approx. ₦141,000)"],
                  ["Payment Method", "Visa / Mastercard (International)"],
                  ["Cancellation", "Can be cancelled anytime after project"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <span className="font-medium text-[#042F40] text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              This document was generated for review purposes. For questions,
              contact Oladele Oladayo Isaac.
            </p>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
