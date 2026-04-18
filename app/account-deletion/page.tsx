"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Shield, Trash2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { useSupportContact } from "@/hooks/use-support-contact";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Intent = "request" | "cancel";

type RequestState = {
  email: string;
  code: string;
  verificationToken: string;
  reason: string;
};

type DeletionResult = {
  status: string;
  email: string;
  scheduled_for?: string | null;
};

const initialState: RequestState = {
  email: "",
  code: "",
  verificationToken: "",
  reason: "",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#042F40]">{title}</h2>
      <div className="space-y-2 text-sm leading-6 text-slate-600">
        {children}
      </div>
    </section>
  );
}

function AccountDeletionContent() {
  const searchParams = useSearchParams();
  const defaultIntent =
    searchParams.get("mode") === "cancel" ? "cancel" : "request";
  const [intent, setIntent] = useState<Intent>(defaultIntent);
  const [form, setForm] = useState<RequestState>(initialState);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState<DeletionResult | null>(null);
  const { supportEmail, supportPhone } = useSupportContact();

  const stepCopy = useMemo(
    () =>
      intent === "request"
        ? [
            "Enter the email address used on your UniRide rider or driver account.",
            "Verify ownership with the one-time code sent to that email address.",
            "Submit your deletion request. UniRide will review it before scheduling deletion.",
            "If approved, your account will be deleted 30 days later unless you cancel first.",
          ]
        : [
            "Enter the email address used on your UniRide account.",
            "Verify ownership with the one-time code sent to that email address.",
            "Cancel the active deletion request before the scheduled deletion date.",
            "Your account remains active once the cancellation is confirmed.",
          ],
    [intent],
  );

  const updateField = (field: keyof RequestState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const sendCode = async () => {
    clearMessages();
    setSendingCode(true);
    try {
      const response = await fetch(
        `${API_URL}/api/account-deletion/request-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            intent,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }
      setSuccess("Verification code sent. Check your email to continue.");
      toast.success("Verification code sent");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send verification code";
      setError(message);
      toast.error(message);
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    clearMessages();
    setVerifyingCode(true);
    try {
      const response = await fetch(
        `${API_URL}/api/account-deletion/verify-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            code: form.code.trim(),
            intent,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code");
      }
      updateField("verificationToken", data.data.verification_token);
      setSuccess(
        intent === "request"
          ? "Email verified. You can now submit your deletion request."
          : "Email verified. You can now cancel the active deletion request.",
      );
      toast.success("Email verified successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to verify code";
      setError(message);
      toast.error(message);
    } finally {
      setVerifyingCode(false);
    }
  };

  const submit = async () => {
    clearMessages();
    setSubmitting(true);
    try {
      const endpoint =
        intent === "request"
          ? "/api/account-deletion/request"
          : "/api/account-deletion/cancel";
      const body =
        intent === "request"
          ? {
              email: form.email.trim(),
              verification_token: form.verificationToken,
              reason: form.reason.trim(),
            }
          : {
              email: form.email.trim(),
              verification_token: form.verificationToken,
            };
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }
      setResult(data.data);
      setSuccess(
        intent === "request"
          ? "Your UniRide account deletion request has been submitted."
          : "Your UniRide account deletion request has been cancelled.",
      );
      toast.success(
        intent === "request"
          ? "Deletion request submitted"
          : "Deletion request cancelled",
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40]">
      <header className="sticky top-0 z-10 p-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between border border-white/10 bg-[#042F40]/90 px-4 py-3 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-auto w-7" variant="light" />
              <span className="text-base font-semibold text-white">
                UniRide
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="bg-white shadow-2xl">
          <div className="border-b border-slate-200 bg-[#042F40] px-6 py-8 sm:px-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  Delete Your UniRide Account
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-200">
                  This page lets UniRide riders and drivers request deletion of
                  their account and associated personal data, or cancel a
                  pending deletion request before the scheduled deletion date.
                </p>
              </div>
              {/* <Badge
                variant="outline"
                className="border-white/20 text-xs text-white/80"
              >
                Google Play deletion URL
              </Badge> */}
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8 px-6 py-8 sm:px-10">
              <Section title="How the process works">
                <ol className="space-y-2 pl-5 list-decimal">
                  {stepCopy.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </Section>

              <Separator />

              <Section title="What UniRide deletes">
                <ul className="space-y-2 pl-5 list-disc">
                  <li>Your UniRide account profile and login access.</li>
                  <li>
                    Linked devices, notification preferences, and support
                    access.
                  </li>
                  <li>
                    Driver profile data if the account is a UniRide driver
                    account.
                  </li>
                  <li>
                    Operational account data that is no longer required after
                    deletion.
                  </li>
                </ul>
              </Section>

              <Separator />

              <Section title="What UniRide may retain">
                <ul className="space-y-2 pl-5 list-disc">
                  <li>
                    Limited legal, financial, fraud-prevention, and safety audit
                    records that UniRide must keep to meet compliance
                    obligations.
                  </li>
                  <li>
                    These retained records may be stored for up to 7 years where
                    required by law or legitimate safety and financial needs.
                  </li>
                  <li>
                    Retained records are kept only for those compliance
                    purposes, not to keep your account active.
                  </li>
                </ul>
              </Section>

              <Separator />

              <Section title="Deletion timing and cancellation">
                <p>
                  UniRide does not delete your account immediately after you
                  request deletion. An administrator reviews the request first.
                </p>
                <p>
                  If approved, your account is scheduled for deletion 30 days
                  after approval. You can cancel the request during that period.
                </p>
              </Section>

              <Separator />

              <Section title="Need help?">
                <div className="space-y-1">
                  <p>privacy@uniride.ng</p>
                  <p>{supportEmail}</p>
                  <p>{supportPhone}</p>
                </div>
              </Section>
            </div>

            <aside className="border-t border-slate-200 bg-slate-50 px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={intent === "request" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      setIntent("request");
                      setResult(null);
                      clearMessages();
                    }}
                  >
                    Request deletion
                  </Button>
                  <Button
                    type="button"
                    variant={intent === "cancel" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      setIntent("cancel");
                      setResult(null);
                      clearMessages();
                    }}
                  >
                    Cancel request
                  </Button>
                </div>

                <div className="space-y-4 border border-slate-200 bg-white p-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">
                      Account email
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="name@example.com"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={sendCode}
                    disabled={!form.email.trim() || sendingCode}
                    className="w-full"
                  >
                    {sendingCode ? "Sending code..." : "Send verification code"}
                  </Button>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900">
                      Verification code
                    </label>
                    <Input
                      value={form.code}
                      onChange={(event) =>
                        updateField("code", event.target.value)
                      }
                      placeholder="Enter the 6-digit code"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={verifyCode}
                    disabled={
                      !form.email.trim() || !form.code.trim() || verifyingCode
                    }
                    className="w-full"
                  >
                    {verifyingCode ? "Verifying..." : "Verify code"}
                  </Button>

                  {intent === "request" ? (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900">
                        Reason for deletion
                      </label>
                      <Textarea
                        value={form.reason}
                        onChange={(event) =>
                          updateField("reason", event.target.value)
                        }
                        placeholder="Optional, but helpful for UniRide support."
                        rows={4}
                      />
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={submit}
                    disabled={!form.verificationToken || submitting}
                    className="w-full"
                  >
                    {submitting
                      ? intent === "request"
                        ? "Submitting..."
                        : "Cancelling..."
                      : intent === "request"
                        ? "Submit deletion request"
                        : "Cancel deletion request"}
                  </Button>
                </div>

                {error ? (
                  <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}

                {result ? (
                  <div className="space-y-3 border border-slate-200 bg-white p-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">
                        Current request status
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <Badge variant="outline" className="capitalize">
                          {String(result.status || "n/a").replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Account</span>
                        <span>{result.email}</span>
                      </div>
                      {result.scheduled_for ? (
                        <div className="flex items-center justify-between">
                          <span>Scheduled deletion</span>
                          <span>
                            {new Date(result.scheduled_for).toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3 border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Before you submit</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      Use the email address attached to your UniRide account.
                    </li>
                    <li className="flex gap-2">
                      <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      UniRide deletes the account after approval plus a 30-day
                      wait.
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AccountDeletionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40]">
          <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
            <div className="border border-white/10 bg-[#042F40]/80 px-6 py-4 text-sm text-white/80 backdrop-blur-sm">
              Loading account deletion page...
            </div>
          </main>
        </div>
      }
    >
      <AccountDeletionContent />
    </Suspense>
  );
}
