"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/useAuthStore";
import { getDeviceId } from "@/lib/utils/deviceId";
import AuthGuard from "@/lib/guards/AuthGuard";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const device_id = await getDeviceId();
      await login(email, password, device_id);
      router.push("/dashboard");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === "EMAIL_VERIFICATION_REQUIRED"
      ) {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      console.error("Login failed:", err);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
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

          {/* Sign In Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Welcome Back</CardTitle>
              <CardDescription className="text-xs">
                Sign in to access the admin dashboard
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label
                      htmlFor="remember"
                      className="text-xs text-muted-foreground font-normal"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Signing in...</span>
                    </>
                  ) : (
                    <span className="text-sm">Sign In</span>
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
