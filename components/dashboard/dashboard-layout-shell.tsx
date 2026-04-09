"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGuard from "@/lib/guards/AuthGuard";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  return (
    <AuthGuard requireAuth>
      <TooltipProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>

      <ChangePasswordModal
        open={!!user?.first_login}
        onSuccess={() => {
          // The changePassword endpoint in useAuthStore already sets first_login: false
          // so the modal will close automatically via the open prop
        }}
      />
    </AuthGuard>
  );
}
