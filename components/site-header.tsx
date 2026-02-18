"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  LogOut,
  Settings,
  UserCircle,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  MessageSquare,
  DollarSign,
  Car,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { formatDistanceToNow } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/admins": "Admins",
  "/dashboard/driver-applications": "Driver Applications",
  "/dashboard/drivers": "Drivers",
  "/dashboard/users": "Users",
  "/dashboard/fare-policy": "Fare Policy",
  "/dashboard/bookings": "Bookings",
  "/dashboard/broadcast": "Broadcast",
  "/dashboard/support": "Support",
  "/dashboard/settings": "Settings",
  "/dashboard/notifications": "Notifications",
};

const NOTIF_ICONS: Record<string, React.ElementType> = {
  application: UserCheck,
  payment: DollarSign,
  support: MessageSquare,
  driver: Car,
  user: Bell,
  system: AlertCircle,
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  moderator: "Moderator",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── SiteHeader ─────────────────────────────────────────────────────────────

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout, device_id } = useAuthStore();
  const {
    notifications,
    unreadCount,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotificationStore();

  const title =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path + "/"),
    )?.[1] ||
    "Dashboard";

  // Fetch on every navigation + poll every 60 s + re-fetch on tab focus
  useEffect(() => {
    getNotifications({ limit: 8 });

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        getNotifications({ limit: 8 });
      }
    }, 60_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        getNotifications({ limit: 8 });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [getNotifications, pathname]); // pathname dep → refetch on every dashboard route change

  const handleLogout = async () => {
    await logout(device_id ?? "");
    router.replace("/auth/signin");
  };

  const recentNotifs = notifications.slice(0, 8);
  const displayName = user?.name ?? "Admin";
  const initials = getInitials(displayName);
  const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? "Admin";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Left — sidebar trigger + page title */}
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 mt-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>

        {/* Right — notifications + user */}
        <div className="ml-auto flex items-center gap-1">
          {/* ── Notification Bell ────────────────────────────────────────── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="flex w-80 flex-col p-0"
              sideOffset={8}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div>
                  <p className="text-sm font-semibold">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllNotificationsRead();
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {/* List */}
              <ScrollArea className="flex-1 max-h-80 overflow-auto">
                {recentNotifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <Bell className="h-6 w-6 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">
                      All caught up!
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {recentNotifs.map((n) => {
                      const Icon = NOTIF_ICONS[n.type] ?? Bell;
                      const isUnread = !n.is_read;
                      const timeAgo = n.createdAt
                        ? formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })
                        : "";

                      return (
                        <button
                          key={n._id}
                          className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${
                            isUnread ? "bg-primary/5" : ""
                          }`}
                          onClick={() => {
                            if (isUnread) markNotificationRead(n._id);
                          }}
                        >
                          <div
                            className={`mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                              isUnread
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[11px] leading-snug ${
                                isUnread
                                  ? "font-semibold text-foreground"
                                  : "text-foreground/80"
                              }`}
                            >
                              {n.message}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {timeAgo}
                              </span>
                            </div>
                          </div>
                          {isUnread && (
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer — always stuck at bottom */}
              <div className="border-t px-4 py-2.5 shrink-0">
                <Link
                  href="/dashboard/notifications"
                  className="block text-center text-[11px] font-medium text-primary hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── User Menu ────────────────────────────────────────────────── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-2 pl-1.5 pr-2 rounded-full hover:bg-muted"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-xs font-medium max-w-28 truncate">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
              {/* Profile card */}
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[10px] text-primary font-medium capitalize">
                      {roleLabel}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                  <Link href="/dashboard/settings">
                    <UserCircle className="h-3.5 w-3.5" />
                    Profile & Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                  <Link href="/dashboard/settings">
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-2 text-xs text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
