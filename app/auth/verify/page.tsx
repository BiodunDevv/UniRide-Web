"use client";

import {
  useState,
  useRef,
  KeyboardEvent,
  ClipboardEvent,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/useAuthStore";
import AuthGuard from "@/lib/guards/AuthGuard";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyEmail, resendVerificationCode, isLoading, error, clearError } =
    useAuthStore();

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const verificationCode = code.join("");

    try {
      await verifyEmail(email || emailParam || "", verificationCode);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  const handleResendCode = async () => {
    clearError();
    try {
      await resendVerificationCode(email || emailParam || "");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend failed:", err);
    }
  };

  if (success) {
    return (
      <AuthGuard requireAuth={false}>
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Link
                href="/"
                className="inline-flex flex-col items-center gap-1.5"
              >
                <Logo className="w-14 h-auto" variant="dark" />
                <h1 className="text-xl font-bold text-foreground">UniRide</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </Link>
            </div>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Verification Successful!
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your email has been verified. Redirecting to the dashboard...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-flex flex-col items-center gap-1.5"
            >
              <Logo className="w-14 h-auto" variant="dark" />
              <h1 className="text-xl font-bold text-foreground">UniRide</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </Link>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Verify Your Email</CardTitle>
              <CardDescription className="text-xs">
                We&apos;ve sent a 6-digit verification code to your email
                address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!emailParam && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@uniride.ng"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                )}

                {emailParam && (
                  <p className="text-xs text-muted-foreground text-center">
                    Code sent to <strong>{emailParam}</strong>
                  </p>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-center block">
                    Verification Code
                  </Label>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-10 h-11 text-center text-base font-bold border border-input bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-all"
                        required
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  <span className="text-sm">Verify Code</span>
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                  >
                    Didn&apos;t receive the code? Resend
                  </button>
                </div>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/auth/signin"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            &copy; {new Date().getFullYear()} UniRide. All rights reserved.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
