"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Home, LayoutDashboard, Search } from "lucide-react";
import Link from "next/link";

export function NotFoundContent() {
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* 404 number */}
        <div className="space-y-2">
          <p className="text-[96px] sm:text-[120px] font-bold leading-none tracking-tighter text-foreground/[0.06] select-none">
            404
          </p>
          <div className="-mt-6 sm:-mt-8 flex justify-center">
            <Badge variant="secondary" className="text-[11px] px-3 py-1">
              Page Not Found
            </Badge>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {isAuthenticated
              ? "That page doesn't exist"
              : "Nothing to see here"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isAuthenticated
              ? `The page you're looking for may have been moved, renamed, or doesn't exist. Double-check the URL or head back to your dashboard.`
              : `The page you're looking for isn't available. You may need to sign in to access this resource, or the URL might be incorrect.`}
          </p>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <>
              <Button asChild size="sm" className="w-full sm:w-auto text-xs">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full sm:w-auto text-xs"
              >
                <Link href="/dashboard/drivers">
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  Browse Drivers
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="w-full sm:w-auto text-xs">
                <Link href="/auth/signin">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full sm:w-auto text-xs"
              >
                <Link href="/">
                  <Home className="h-3.5 w-3.5 mr-1.5" />
                  Go Home
                </Link>
              </Button>
            </>
          )}
        </div>

        <Separator />

        {/* Quick links */}
        <div className="space-y-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {isAuthenticated ? "Quick links" : "Helpful links"}
          </p>
          {isAuthenticated ? (
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Drivers", href: "/dashboard/drivers" },
                { label: "Users", href: "/dashboard/users" },
                {
                  label: "Applications",
                  href: "/dashboard/driver-applications",
                },
                { label: "Support", href: "/dashboard/support" },
                { label: "Settings", href: "/dashboard/settings" },
              ].map(({ label, href }) => (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "Sign In", href: "/auth/signin" },
                { label: "Forgot Password", href: "/auth/forgot-password" },
              ].map(({ label, href }) => (
                <Button
                  key={href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
