"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Star,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Edit2,
  Trash2,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`transition-all duration-150 ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:scale-110"
          }`}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange(star)}
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hover || value)
                ? "fill-[#D4A017] text-[#D4A017]"
                : "fill-none text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Auth mode: "token" (from mobile app) or "email" (web visitor) ────────
type AuthMode = "token" | "email";
type View = "email" | "verify" | "form" | "success" | "loading";

interface VerifiedUser {
  id: string;
  name: string;
  role: string;
}

// ─── Inner Page (uses useSearchParams) ────────────────────────────────────────
function ReviewsPageInner() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");

  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [view, setView] = useState<View>("loading");

  // Email verification state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Determine auth mode on mount ──
  useEffect(() => {
    if (urlToken) {
      setAuthMode("token");
      setAuthToken(urlToken);
      fetchMyReviewWithToken(urlToken);
    } else {
      setAuthMode("email");
      setView("email");
    }
  }, [urlToken]);

  // ── Token-based: fetch existing review ──
  const fetchMyReviewWithToken = async (tkn: string) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setExistingReview(data.data);
        setRating(data.data.rating);
        setTitle(data.data.title);
        setMessage(data.data.message);
      }
    } catch {
      // ignore — show blank form
    }
    setView("form");
  };

  // ── Email flow: request code ──
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSendingCode(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.message || "Something went wrong");
        return;
      }

      setCodeSent(true);
      setView("verify");
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // ── Email flow: verify code ──
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");

    if (!code.trim() || code.trim().length !== 6) {
      setCodeError("Please enter the 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCodeError(data.message || "Invalid code");
        return;
      }

      setVerifiedUser(data.data.user);
      if (data.data.existingReview) {
        setExistingReview(data.data.existingReview);
        setRating(data.data.existingReview.rating);
        setTitle(data.data.existingReview.title);
        setMessage(data.data.existingReview.message);
      }
      setView("form");
    } catch {
      setCodeError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Resend code ──
  const handleResendCode = async () => {
    setCodeError("");
    setIsSendingCode(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.message || "Failed to resend code");
      } else {
        setCodeError("");
        setCode("");
      }
    } catch {
      setCodeError("Network error. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // ── Submit review (token mode) ──
  const handleSubmitWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit review");
        return;
      }
      setExistingReview(data.data);
      setIsEditing(false);
      setView("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submit review (email mode) ──
  const handleSubmitWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/submit-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          rating,
          title: title.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit review");
        return;
      }
      setExistingReview(data.data);
      setIsEditing(false);
      setView("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete review ──
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    setIsDeleting(true);
    try {
      let res: Response;
      if (authMode === "token") {
        res = await fetch(`${API_URL}/api/reviews/me`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } else {
        res = await fetch(`${API_URL}/api/reviews/delete-by-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: code.trim(),
          }),
        });
      }
      if (res.ok) {
        setExistingReview(null);
        setRating(0);
        setTitle("");
        setMessage("");
        setIsEditing(false);
      }
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  const validateForm = () => {
    if (rating === 0) {
      setError("Please select a rating");
      return false;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return false;
    }
    if (!message.trim()) {
      setError("Please enter your review");
      return false;
    }
    return true;
  };

  const handleSubmit =
    authMode === "token" ? handleSubmitWithToken : handleSubmitWithEmail;

  const displayName =
    authMode === "token"
      ? undefined // token mode doesn't need to display name in the same way
      : verifiedUser?.name;
  const displayRole = authMode === "token" ? undefined : verifiedUser?.role;

  // ── Loading ──
  if (view === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
      <PageHeader subtitle="Leave a Review" />

      <main className="flex-1 px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          {/* ── Step 1: Enter Email ── */}
          {view === "email" && (
            <div className="rounded-2xl bg-white shadow-2xl p-6 sm:p-10">
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-[#042F40]/10 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-[#042F40]" />
                </div>
                <h1 className="text-2xl font-bold text-[#042F40]">
                  Share Your Experience
                </h1>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Enter the email address linked to your UniRide account.
                  We&apos;ll send a quick verification code so you can leave
                  your review.
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-5">
                {emailError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Oops</AlertTitle>
                    <AlertDescription>{emailError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSendingCode}
                      className="pl-10 bg-gray-50/50"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSendingCode}
                  className="w-full bg-[#042F40] hover:bg-[#042F40]/90"
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Don&apos;t have an account?{" "}
                  <span className="text-[#042F40] font-medium">
                    Download the UniRide app
                  </span>{" "}
                  to get started and join our community.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Verify Code ── */}
          {view === "verify" && (
            <div className="rounded-2xl bg-white shadow-2xl p-6 sm:p-10">
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-[#D4A017]/10 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-[#D4A017]" />
                </div>
                <h1 className="text-2xl font-bold text-[#042F40]">
                  Check Your Email
                </h1>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  We sent a 6-digit verification code to{" "}
                  <span className="font-semibold text-[#042F40]">{email}</span>.
                  Enter it below to continue.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                {codeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Invalid Code</AlertTitle>
                    <AlertDescription>{codeError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="text-sm font-medium text-gray-700"
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isVerifying}
                    className="bg-gray-50/50 text-center text-2xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isVerifying || code.length !== 6}
                  className="w-full bg-[#042F40] hover:bg-[#042F40]/90"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleResendCode}
                  disabled={isSendingCode}
                  className="text-xs text-[#042F40] font-medium hover:underline disabled:opacity-50"
                >
                  {isSendingCode ? "Sending..." : "Resend Code"}
                </button>
                <button
                  onClick={() => {
                    setView("email");
                    setCode("");
                    setCodeError("");
                    setCodeSent(false);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {view === "success" && (
            <div className="rounded-2xl bg-white shadow-2xl p-6 sm:p-10">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#042F40]">
                  Thank You!
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Your review has been submitted successfully. We appreciate
                  your feedback — it helps us make UniRide even better!
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-[#042F40] hover:bg-[#042F40]/90"
                    onClick={() => setView("form")}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Review
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Review Form ── */}
          {view === "form" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white shadow-2xl p-6 sm:p-10">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-14 h-14 bg-[#D4A017]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-7 h-7 text-[#D4A017]" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#042F40]">
                    {existingReview && !isEditing
                      ? "Your Review"
                      : existingReview
                        ? "Edit Your Review"
                        : "Share Your Experience"}
                  </h1>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {existingReview && !isEditing
                      ? "Here's your current review."
                      : "Tell us how UniRide has helped you. Your review helps other students discover UniRide!"}
                  </p>
                </div>

                {/* Show existing review (read-only) */}
                {existingReview && !isEditing ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${
                              s <= existingReview.rating
                                ? "fill-[#D4A017] text-[#D4A017]"
                                : "fill-none text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <h3 className="font-semibold text-[#042F40]">
                        {existingReview.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {existingReview.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        Submitted{" "}
                        {new Date(existingReview.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                        {existingReview.is_featured && (
                          <span className="ml-2 inline-flex items-center text-[#D4A017] font-medium">
                            ⭐ Featured on homepage
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="bg-[#042F40] hover:bg-[#042F40]/90"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Review
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Review form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Rating */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Rating
                      </Label>
                      <StarRating
                        value={rating}
                        onChange={setRating}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-sm font-medium text-gray-700"
                      >
                        Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g. Great service for campus commuting!"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        disabled={isSubmitting}
                        className="bg-gray-50/50"
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {title.length}/100
                      </p>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium text-gray-700"
                      >
                        Your Review
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Share your experience with UniRide..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={500}
                        rows={4}
                        disabled={isSubmitting}
                        className="bg-gray-50/50 resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {message.length}/500
                      </p>
                    </div>

                    {/* Submitter info */}
                    {authMode === "email" && verifiedUser && (
                      <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#042F40] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {verifiedUser.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {verifiedUser.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Posting as{" "}
                            {verifiedUser.role === "driver"
                              ? "Driver"
                              : "Student"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="flex-1 bg-[#042F40] hover:bg-[#042F40]/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : existingReview ? (
                          "Update Review"
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            setIsEditing(false);
                            setRating(existingReview.rating);
                            setTitle(existingReview.title);
                            setMessage(existingReview.message);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

// ─── Main Page (Suspense boundary for useSearchParams) ────────────────────────
export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      }
    >
      <ReviewsPageInner />
    </Suspense>
  );
}
