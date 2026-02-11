"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

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
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (requireAuth) {
      if (!token || !user) {
        router.push(redirectTo || `/auth/signin?redirect=${pathname}`);
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.push(redirectTo || "/unauthorized");
          return;
        }
      }

      if (user.first_login && pathname !== "/auth/change-password") {
        router.push("/auth/change-password");
        return;
      }
    } else {
      if (token && user) {
        router.push(redirectTo || "/dashboard");
        return;
      }
    }
  }, [user, token, requireAuth, allowedRoles, router, pathname, redirectTo]);

  if (requireAuth && (!token || !user)) {
    return null;
  }

  if (!requireAuth && token && user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
