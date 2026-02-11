"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeParam = searchParams.get("code");
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState(codeParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) return;

    try {
      await resetPassword(email, code, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (err) {
      console.error("Reset password failed:", err);
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
                  Password Reset Successful!
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Your password has been reset. Redirecting to sign in...
                </p>
                <Button className="w-full" asChild>
                  <Link href="/auth/signin">
                    <span className="text-sm">Continue to Sign In</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!code && !email) {
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
                <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  Invalid Reset Link
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  This password reset link is invalid or missing required
                  information.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/auth/forgot-password">
                      <span className="text-sm">Request New Reset Link</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/signin">
                      <span className="text-sm">Back to Sign In</span>
                    </Link>
                  </Button>
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
              <CardTitle className="text-lg">Reset Your Password</CardTitle>
              <CardDescription className="text-xs">
                Enter your new password below. Make sure it&apos;s at least 6
                characters long.
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

              {password && confirmPassword && password !== confirmPassword && (
                <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800">
                  <AlertDescription className="text-xs">
                    Passwords do not match
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!searchParams.get("email") && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@uniride.ng"
                      required
                    />
                  </div>
                )}

                {!searchParams.get("code") && (
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-xs">
                      Reset Code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-9"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-9"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Password must:</p>
                  <ul className="list-disc list-inside ml-1 space-y-0.5">
                    <li
                      className={password.length >= 6 ? "text-green-600" : ""}
                    >
                      Be at least 6 characters long
                    </li>
                    <li
                      className={
                        password &&
                        confirmPassword &&
                        password === confirmPassword
                          ? "text-green-600"
                          : ""
                      }
                    >
                      Match the confirmation password
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    password !== confirmPassword ||
                    !password ||
                    !confirmPassword
                  }
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Resetting...</span>
                    </>
                  ) : (
                    <span className="text-sm">Reset Password</span>
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/auth/signin"
                  className="text-xs text-primary hover:underline font-medium"
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

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
