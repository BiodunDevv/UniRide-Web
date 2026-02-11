"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
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
                  Check Your Email
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  We&apos;ve sent a 6-digit verification code to{" "}
                  <strong>{email}</strong>. Please check your inbox.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() =>
                      router.push(
                        `/auth/reset-password?email=${encodeURIComponent(email)}`,
                      )
                    }
                    className="w-full"
                  >
                    <span className="text-sm">Enter Verification Code</span>
                  </Button>
                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full text-xs text-primary hover:underline font-medium"
                  >
                    Didn&apos;t receive the code? Try again
                  </button>
                </div>
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
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Sign In
              </Link>
              <CardTitle className="text-lg">Forgot Password?</CardTitle>
              <CardDescription className="text-xs">
                Enter your email address and we&apos;ll send you a code to reset
                your password.
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

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Sending...</span>
                    </>
                  ) : (
                    <span className="text-sm">Send Verification Code</span>
                  )}
                </Button>
              </form>
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
