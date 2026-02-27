"use client";

import { useState, useEffect } from "react";
import { useDriverStore } from "@/store/useDriverStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  ArrowLeft,
  Loader2,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Car,
  FileText,
  ArrowRight,
  ShieldCheck,
  Info,
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
      <div className="mx-auto max-w-2xl">
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
      <div className="max-w-2xl mx-auto">
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

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
    badgeClass: "text-amber-700 border-amber-300 bg-amber-50",
    label: "Under Review",
    description:
      "Your application is currently being reviewed by our team. This typically takes 24–48 hours.",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    badgeClass: "text-green-700 border-green-300 bg-green-50",
    label: "Approved",
    description:
      "Congratulations! Your application has been approved. Check your email for login credentials and next steps.",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    badgeClass: "text-red-700 border-red-300 bg-red-50",
    label: "Not Approved",
    description:
      "Unfortunately, your application was not approved at this time. You can review the reason below and reapply.",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CheckStatusPage() {
  const {
    checkApplicationStatus,
    application,
    isLoading,
    error,
    clearError,
    clearApplication,
  } = useDriverStore();

  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);

  // Clean up on mount
  useEffect(() => {
    clearApplication();
    return () => clearApplication();
  }, [clearApplication]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;
    clearError();
    setSearched(true);
    try {
      await checkApplicationStatus(email.trim().toLowerCase());
    } catch {
      // Error state handled by store
    }
  };

  const handleReset = () => {
    setEmail("");
    setSearched(false);
    clearApplication();
    clearError();
  };

  // ─── Application Result View ──────────────────────────────────────────────
  if (searched && application) {
    const config = statusConfig[application.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader subtitle="Application Status" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-6 sm:p-8 shadow-2xl">
              {/* Status Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className={`w-16 h-16 ${config.bg} flex items-center justify-center mb-4 rounded-full`}
                >
                  <StatusIcon className={`w-9 h-9 ${config.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-[#042F40] mb-2">
                  {config.label}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {config.description}
                </p>
              </div>

              {/* Rejection Reason */}
              {application.status === "rejected" &&
                application.rejection_reason && (
                  <Alert className="mb-5 border-red-200 bg-red-50">
                    <AlertCircle className="size-4 text-red-700" />
                    <AlertTitle className="text-red-900 text-xs font-semibold">
                      Reason
                    </AlertTitle>
                    <AlertDescription className="text-red-800 text-xs leading-relaxed">
                      {application.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}

              {/* Approved Info */}
              {application.status === "approved" && (
                <Alert className="mb-5 border-green-200 bg-green-50">
                  <ShieldCheck className="size-4 text-green-700" />
                  <AlertTitle className="text-green-900 text-xs font-semibold">
                    What&apos;s Next?
                  </AlertTitle>
                  <AlertDescription className="text-green-800 text-xs leading-relaxed">
                    Check your email for your login credentials. Download the
                    UniRide app and sign in as a driver to start accepting ride
                    requests.
                  </AlertDescription>
                </Alert>
              )}

              {/* Pending Info */}
              {application.status === "pending" && (
                <Alert className="mb-5 border-amber-200 bg-amber-50">
                  <Info className="size-4 text-amber-700" />
                  <AlertTitle className="text-amber-900 text-xs font-semibold">
                    Please Be Patient
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 text-xs leading-relaxed">
                    Our team is carefully reviewing your documents. You&apos;ll
                    receive an email notification once a decision has been made.
                  </AlertDescription>
                </Alert>
              )}

              {/* Application Details */}
              <div className="border bg-muted/30 p-4 mb-6 space-y-2.5 text-xs">
                <p className="font-semibold text-[#042F40] text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Application Details
                </p>
                {[
                  ["Name", application.name],
                  ["Email", application.email],
                  ["Vehicle", application.vehicle_model],
                  ["Plate Number", application.plate_number],
                  ...(application.vehicle_color
                    ? [["Color", application.vehicle_color]]
                    : []),
                  ["Seats", String(application.available_seats)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <span className="font-medium text-[#042F40] truncate text-right">
                      {value}
                    </span>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">
                    Submitted
                  </span>
                  <span className="font-medium text-[#042F40]">
                    {formatDate(application.createdAt)}
                  </span>
                </div>

                {application.reviewed_at && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      Reviewed
                    </span>
                    <span className="font-medium text-[#042F40]">
                      {formatDate(application.reviewed_at)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-4 pt-1">
                  <span className="text-muted-foreground shrink-0">Status</span>
                  <Badge variant="outline" className={config.badgeClass}>
                    {config.label}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Button onClick={handleReset} className="w-full">
                  Check Another Application
                </Button>
                {application.status === "rejected" && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/driver-apply">
                      <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                      Reapply as Driver
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-xs" asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── Not Found View ───────────────────────────────────────────────────────
  if (searched && error && !application) {
    const isNotFound = error.includes("No driver application found");
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader subtitle="Application Status" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4 rounded-full">
                  {isNotFound ? (
                    <Search className="w-8 h-8 text-gray-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-[#042F40] mb-2">
                  {isNotFound ? "No Application Found" : "Something Went Wrong"}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isNotFound
                    ? `We couldn't find a driver application associated with "${email}". Make sure you're using the same email you applied with.`
                    : error}
                </p>
              </div>

              <div className="space-y-2.5">
                <Button onClick={handleReset} className="w-full">
                  Try a Different Email
                </Button>
                {isNotFound && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/driver-apply">
                      <Car className="w-3.5 h-3.5 mr-1.5" />
                      Apply as Driver
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-xs" asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── Search Form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
      <PageHeader subtitle="Application Status" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#042F40]/5 flex items-center justify-center mb-4 rounded-full">
                <Search className="w-8 h-8 text-[#042F40]" />
              </div>
              <h2 className="text-2xl font-bold text-[#042F40] mb-2">
                Check Application Status
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter the email address you used when applying to drive with
                UniRide.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-5" />

            {/* Help Text */}
            <div className="space-y-3">
              <Alert className="border-muted bg-muted/30">
                <Info className="size-4 text-muted-foreground" />
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                  Haven&apos;t applied yet? You can submit a driver application
                  to start earning on campus.
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full text-sm" asChild>
                <Link href="/driver-apply">
                  <Car className="w-3.5 h-3.5 mr-1.5" />
                  Apply as a Driver
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PageFooter />
    </div>
  );
}
