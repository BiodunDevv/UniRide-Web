"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Auth pages: start as "checking" so we show a loader until we know they're not logged in
  // Dashboard pages: start as "checked" — render immediately, verify silently
  const [authChecked, setAuthChecked] = useState(!requireAuth ? false : true);
  // Prevent SSR/client hydration mismatch — localStorage store is only available client-side
  const [mounted, setMounted] = useState(false);
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // ── Auth pages (signin, forgot-password, etc.) ──────────────────────
    if (!requireAuth) {
      const { token, user, getMe } = useAuthStore.getState();

      if (!token || !user) {
        // Not logged in — show the auth page
        setAuthChecked(true);
        return;
      }

      // Has a persisted token — silently validate then redirect
      getMe()
        .then(() => {
          const state = useAuthStore.getState();
          if (state.token && state.user) {
            router.replace(redirectTo || "/dashboard");
          } else {
            setAuthChecked(true);
          }
        })
        .catch(() => {
          // API down or token invalid — show the auth page
          setAuthChecked(true);
        });

      return;
    }

    // ── Dashboard pages: verify on every pathname change ─────────────────
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    const { token, user, getMe } = useAuthStore.getState();

    if (!token || !user) {
      router.replace(redirectTo || `/auth/signin?redirect=${pathname}`);
      return;
    }

    // Background fetch — no loading state
    getMe()
      .then(() => {
        const state = useAuthStore.getState();

        if (!state.token || !state.user) {
          router.replace(redirectTo || `/auth/signin?redirect=${pathname}`);
          return;
        }

        if (allowedRoles?.length && !allowedRoles.includes(state.user.role)) {
          router.replace(redirectTo || "/unauthorized");
          return;
        }
      })
      .catch(() => {
        const state = useAuthStore.getState();
        if (!state.token || !state.user) {
          router.replace(redirectTo || `/auth/signin?redirect=${pathname}`);
        }
        // API down but token exists — silently allow through
      });
  }, [pathname, requireAuth, router, redirectTo, allowedRoles, mounted]);

  // ── Auth pages: show loader while we check persisted session ──────────
  if (!requireAuth && !authChecked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <Logo className="w-8 h-auto" variant="dark" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Verifying session
            </div>
            <p className="text-xs text-muted-foreground">
              Please wait while we secure your connection...
            </p>
          </div>
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // ── Before hydration: render nothing on both server and client (consistent) ─
  if (!mounted) return null;

  // ── Dashboard: if no token at all, render nothing (redirect in flight) ─
  const { token, user } = useAuthStore.getState();
  if (requireAuth && (!token || !user)) {
    return null;
  }

  return <>{children}</>;
}
