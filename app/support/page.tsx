"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useSupportStore } from "@/store/useSupportStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Headphones,
  ArrowLeft,
  Loader2,
  Mail,
  User,
  MessageSquare,
  CheckCircle2,
  Search,
  Send,
  CreditCard,
  Car,
  Wrench,
  UserCog,
  HelpCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  ExternalLink,
  ArrowRight,
  Hash,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useSupportContact } from "@/hooks/use-support-contact";

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "home" | "submit" | "track" | "success" | "faq";

const CATEGORIES = [
  {
    value: "account",
    label: "Account Issues",
    icon: UserCog,
    description: "Login, profile, or account-related problems",
  },
  {
    value: "payment",
    label: "Payment & Billing",
    icon: CreditCard,
    description: "Payment failures, refunds, or billing questions",
  },
  {
    value: "ride",
    label: "Ride Issues",
    icon: Car,
    description: "Problems with rides, routes, or bookings",
  },
  {
    value: "technical",
    label: "Technical Support",
    icon: Wrench,
    description: "App bugs, crashes, or technical difficulties",
  },
  {
    value: "other",
    label: "General Inquiry",
    icon: HelpCircle,
    description: "Anything else we can help with",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I reset my password?",
    a: 'You can reset your password from the login screen by tapping "Forgot Password?" and following the email instructions.',
  },
  {
    q: "How do I become a driver?",
    a: "Visit our driver application page to submit your details and vehicle information. Our team reviews applications within 24–48 hours.",
  },
  {
    q: "Why was my ride cancelled?",
    a: "Rides can be cancelled by drivers due to emergencies or by the system if no driver is available. You won't be charged for cancelled rides.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds are automatically processed for cancelled rides. If you haven't received your refund within 3-5 business days, submit a payment support ticket.",
  },
  {
    q: "How long does it take to get a response?",
    a: "Our support team typically responds within 24 hours. Urgent tickets are prioritized and usually addressed within a few hours.",
  },
  {
    q: "How do I update my profile information?",
    a: "Open the UniRide app, go to Settings, and tap on your profile to update your name, phone number, or profile picture.",
  },
];

const STATUS_CONFIG: Record<
  string,
  {
    icon: typeof Clock;
    color: string;
    bg: string;
    label: string;
    badgeClass: string;
  }
> = {
  open: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
    label: "Open",
    badgeClass: "text-amber-700 border-amber-300 bg-amber-50",
  },
  in_progress: {
    icon: AlertCircle,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "In Progress",
    badgeClass: "text-blue-700 border-blue-300 bg-blue-50",
  },
  resolved: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Resolved",
    badgeClass: "text-green-700 border-green-300 bg-green-50",
  },
  closed: {
    icon: XCircle,
    color: "text-gray-600",
    bg: "bg-gray-100",
    label: "Closed",
    badgeClass: "text-gray-700 border-gray-300 bg-gray-50",
  },
};

function SupportStructuredData() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <Script
      id="support-faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}

// ─── Shared Header ────────────────────────────────────────────────────────────
function PageHeader() {
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
          <span className="hidden sm:block text-xs text-white/50 font-medium tracking-wide">
            Help Center
          </span>
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
  const { supportMailto } = useSupportContact();

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
              href={supportMailto}
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

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-white">{q}</p>
        {open ? (
          <ChevronUp className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
        )}
      </div>
      {open && (
        <p className="text-xs text-white/60 leading-relaxed mt-2.5 pr-6">{a}</p>
      )}
    </button>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function SupportPage() {
  const {
    isSubmitting,
    submitResult,
    submitError,
    isTracking,
    trackedTickets,
    trackError,
    submitTicket,
    trackTickets,
    clearSubmitResult,
    clearTrackResults,
    clearAll,
  } = useSupportStore();

  const [view, setView] = useState<View>("home");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Submit form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Track form state
  const [trackEmail, setTrackEmail] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const { supportEmail, supportPhone, supportMailto, supportTel } =
    useSupportContact();

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAll();
  }, [clearAll]);

  // When category is selected from home grid, pre-fill and go to submit
  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setForm((prev) => ({ ...prev, category: categoryValue }));
    setView("submit");
  };

  const handleNavigate = (v: View) => {
    setView(v);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Submit Ticket ──────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errors.email = "Invalid email address";
    if (!form.subject.trim()) errors.subject = "Subject is required";
    if (!form.category) errors.category = "Please select a category";
    if (!form.message.trim()) errors.message = "Please describe your issue";
    else if (form.message.trim().length < 10)
      errors.message = "Please provide more detail (at least 10 characters)";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const success = await submitTicket({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
      category: form.category,
      message: form.message.trim(),
      priority: form.priority,
    });
    if (success) {
      setView("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─── Track Tickets ──────────────────────────────────────────────────────────
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackEmail.trim()) return;
    await trackTickets(
      trackEmail.trim().toLowerCase(),
      trackNumber.trim() || undefined,
    );
  };

  const handleBackToHome = () => {
    setView("home");
    setForm({
      name: "",
      email: "",
      subject: "",
      category: "",
      priority: "medium",
      message: "",
    });
    setFormErrors({});
    setTrackEmail("");
    setTrackNumber("");
    clearAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── SUCCESS VIEW ──────────────────────────────────────────────────────────
  if (view === "success" && submitResult) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-green-100 flex items-center justify-center mb-4 rounded-full">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#042F40] mb-2">
                  Ticket Submitted!
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your support request has been received. Our team will get back
                  to you as soon as possible.
                </p>
              </div>

              {/* Ticket details */}
              <div className="border bg-muted/30 p-4 mb-6 space-y-2.5 text-xs">
                <p className="font-semibold text-[#042F40] text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Ticket Details
                </p>
                {[
                  ["Ticket Number", submitResult.ticket_number],
                  ["Subject", submitResult.subject],
                  [
                    "Category",
                    CATEGORIES.find((c) => c.value === submitResult.category)
                      ?.label || submitResult.category,
                  ],
                  [
                    "Priority",
                    submitResult.priority.charAt(0).toUpperCase() +
                      submitResult.priority.slice(1),
                  ],
                  ["Status", "Open"],
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

              <Alert className="mb-5 border-blue-200 bg-blue-50">
                <Shield className="size-4 text-blue-700" />
                <AlertTitle className="text-blue-900 text-xs font-semibold">
                  Save Your Ticket Number
                </AlertTitle>
                <AlertDescription className="text-blue-800 text-xs leading-relaxed">
                  Keep{" "}
                  <strong className="font-bold">
                    {submitResult.ticket_number}
                  </strong>{" "}
                  for reference. You can use it along with your email to track
                  the status of your request.
                </AlertDescription>
              </Alert>

              <div className="space-y-2.5">
                <Button
                  onClick={() => {
                    clearSubmitResult();
                    setTrackEmail(form.email);
                    setTrackNumber(submitResult.ticket_number);
                    setView("track");
                  }}
                  className="w-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Track This Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToHome}
                  className="w-full"
                >
                  Back to Help Center
                </Button>
              </div>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── SUBMIT TICKET VIEW ────────────────────────────────────────────────────
  if (view === "submit") {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader />
        <div className="flex-1 flex items-start justify-center p-4 py-6">
          <div className="w-full max-w-2xl">
            <div className="bg-white p-6 sm:p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleBackToHome}
                  className="text-muted-foreground hover:text-[#042F40] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#042F40]">
                    Submit a Support Request
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fill in the details below and we&apos;ll get back to you
                    promptly.
                  </p>
                </div>
              </div>

              {submitError && (
                <Alert variant="destructive" className="mb-5">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row: Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className={`h-10 ${formErrors.name ? "border-red-400" : ""}`}
                    />
                    {formErrors.name && (
                      <p className="text-[10px] text-red-500">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className={`h-10 ${formErrors.email ? "border-red-400" : ""}`}
                    />
                    {formErrors.email && (
                      <p className="text-[10px] text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="subject"
                    className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief summary of your issue"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className={`h-10 ${formErrors.subject ? "border-red-400" : ""}`}
                  />
                  {formErrors.subject && (
                    <p className="text-[10px] text-red-500">
                      {formErrors.subject}
                    </p>
                  )}
                </div>

                {/* Row: Category + Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#042F40]">
                      Category
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger
                        className={`h-10 text-xs ${formErrors.category ? "border-red-400" : ""}`}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem
                            key={cat.value}
                            value={cat.value}
                            className="text-xs"
                          >
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-[10px] text-red-500">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#042F40]">
                      Priority
                    </Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) => setForm({ ...form, priority: v })}
                    >
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-xs">
                          Low — General question
                        </SelectItem>
                        <SelectItem value="medium" className="text-xs">
                          Medium — Need help soon
                        </SelectItem>
                        <SelectItem value="high" className="text-xs">
                          High — Urgent issue
                        </SelectItem>
                        <SelectItem value="urgent" className="text-xs">
                          Urgent — Critical / blocking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="message"
                    className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Describe Your Issue
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue in detail. Include any relevant information like error messages, steps to reproduce the problem, etc."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={5}
                    className={`text-xs resize-none ${formErrors.message ? "border-red-400" : ""}`}
                  />
                  {formErrors.message && (
                    <p className="text-[10px] text-red-500">
                      {formErrors.message}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground text-right">
                    {form.message.length} characters
                  </p>
                </div>

                <Separator />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── TRACK TICKET VIEW ─────────────────────────────────────────────────────
  if (view === "track") {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader />
        <div className="flex-1 flex items-start justify-center p-4 py-6">
          <div className="w-full max-w-2xl">
            <div className="bg-white p-6 sm:p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleBackToHome}
                  className="text-muted-foreground hover:text-[#042F40] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#042F40]">
                    Track Your Request
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enter your email to find your support tickets.
                  </p>
                </div>
              </div>

              {/* Search form */}
              <form onSubmit={handleTrack} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="track-email"
                      className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email Address
                    </Label>
                    <Input
                      id="track-email"
                      type="email"
                      placeholder="you@email.com"
                      value={trackEmail}
                      onChange={(e) => setTrackEmail(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="track-number"
                      className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5"
                    >
                      <Hash className="w-3.5 h-3.5" />
                      Ticket Number{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="track-number"
                      placeholder="TKT-00001"
                      value={trackNumber}
                      onChange={(e) => setTrackNumber(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isTracking || !trackEmail.trim()}
                  className="w-full h-10"
                >
                  {isTracking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Tickets
                    </>
                  )}
                </Button>
              </form>

              {/* Track error */}
              {trackError && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-gray-100 flex items-center justify-center mx-auto mb-4 rounded-full">
                    <Search className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-[#042F40] mb-1">
                    No Tickets Found
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {trackError}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate("submit")}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Submit a New Request
                  </Button>
                </div>
              )}

              {/* Tracked tickets list */}
              {trackedTickets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#042F40]">
                      Your Tickets
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      {trackedTickets.length} found
                    </Badge>
                  </div>

                  {trackedTickets.map((ticket) => {
                    const cfg =
                      STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                    const StatusIcon = cfg.icon;
                    const isExpanded = expandedTicket === ticket._id;
                    const lastMessage =
                      ticket.messages[ticket.messages.length - 1];

                    return (
                      <div
                        key={ticket._id}
                        className="border bg-muted/20 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedTicket(isExpanded ? null : ticket._id)
                          }
                          className="w-full text-left p-4 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {ticket.ticket_number}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${cfg.badgeClass}`}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {cfg.label}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-[#042F40] line-clamp-1">
                                {ticket.subject}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(ticket.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}{" "}
                                ·{" "}
                                {
                                  CATEGORIES.find(
                                    (c) => c.value === ticket.category,
                                  )?.label
                                }
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t px-4 pb-4 pt-3 space-y-3">
                            {/* Messages */}
                            <p className="text-xs font-semibold text-[#042F40] flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Messages ({ticket.messages.length})
                            </p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {ticket.messages.map((msg, idx) => {
                                const isAdmin = [
                                  "admin",
                                  "super_admin",
                                ].includes(msg.sender_role);
                                return (
                                  <div
                                    key={idx}
                                    className={`p-3 text-xs ${
                                      isAdmin
                                        ? "bg-primary/5 border-l-2 border-primary"
                                        : "bg-muted/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="font-medium">
                                        {msg.sender_id?.name ||
                                          msg.sender_name ||
                                          "You"}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] capitalize px-1.5 py-0"
                                      >
                                        {isAdmin ? "Support" : msg.sender_role}
                                      </Badge>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                      {msg.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                                      {new Date(msg.timestamp).toLocaleString(
                                        undefined,
                                        {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      )}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Resolution info */}
                            {ticket.resolved_at && (
                              <Alert className="border-green-200 bg-green-50">
                                <CheckCircle2 className="size-4 text-green-700" />
                                <AlertDescription className="text-xs text-green-800">
                                  Resolved on{" "}
                                  {new Date(
                                    ticket.resolved_at,
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </AlertDescription>
                              </Alert>
                            )}

                            {ticket.assigned_to && (
                              <p className="text-[10px] text-primary">
                                Being handled by{" "}
                                <strong>{ticket.assigned_to.name}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No results yet, show hint */}
              {!trackError && trackedTickets.length === 0 && (
                <>
                  <Separator className="my-5" />
                  <Alert className="border-muted bg-muted/30">
                    <AlertCircle className="size-4 text-muted-foreground" />
                    <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                      Enter the email address you used when submitting your
                      support request. Optionally include the ticket number for
                      faster results.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── HOME VIEW (Help Center) ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
      <SupportStructuredData />
      <PageHeader />

      <div className="flex-1 p-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Hero */}
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 rounded-full">
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              How can we help?
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto">
              Get help with your UniRide account, rides, payments, or anything
              else. Our support team is here for you.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleNavigate("submit")}
                className="flex items-center gap-3 p-4 border bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#042F40]">
                    Submit a Request
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Get help from our support team
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleNavigate("track")}
                className="flex items-center gap-3 p-4 border bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#042F40]">
                    Track a Ticket
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Check the status of your request
                  </p>
                </div>
              </button>
            </div>

            <Separator className="mb-5" />

            {/* Category Grid */}
            <p className="text-sm font-semibold text-[#042F40] mb-3">
              What do you need help with?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className="flex items-start gap-3 p-3 border hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-muted/50 flex items-center justify-center shrink-0 rounded-full group-hover:bg-primary/10 transition-colors">
                      <CatIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#042F40]">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5 ml-auto group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </p>
            <div className="space-y-1">
              {FAQ_ITEMS.map((item, idx) => (
                <FAQItem key={idx} q={item.q} a={item.a} />
              ))}
            </div>
          </div>

          {/* Contact fallback */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 text-center">
            <p className="text-sm font-semibold text-white mb-1">
              Still need help?
            </p>
            <p className="text-xs text-white/50 mb-4">
              Our support team typically responds within 24 hours.
            </p>
            <p className="text-[11px] text-white/60 mb-4">
              {supportEmail} · {supportPhone}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleNavigate("submit")}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Contact Support
              </Button>
              <Button
                size="sm"
                className="border-white/2 hover:bg-white/10"
                asChild
              >
                <a href={supportMailto}>
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Email Us
                </a>
              </Button>
              {supportTel ? (
                <Button
                  size="sm"
                  className="border-white/2 hover:bg-white/10"
                  asChild
                >
                  <a href={supportTel}>Call Support</a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
