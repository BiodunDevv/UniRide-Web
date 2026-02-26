"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import Logo from "@/components/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ShieldIcon,
  UserCheckIcon,
  CarIcon,
  UsersIcon,
  DollarSignIcon,
  FileTextIcon,
  SendIcon,
  MessageSquareIcon,
  SettingsIcon,
  CircleHelpIcon,
  BellIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Admins",
    url: "/dashboard/admins",
    icon: <ShieldIcon />,
  },
  {
    title: "Driver Applications",
    url: "/dashboard/driver-applications",
    icon: <UserCheckIcon />,
  },
  {
    title: "Drivers",
    url: "/dashboard/drivers",
    icon: <CarIcon />,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: <UsersIcon />,
  },
  {
    title: "Fare Policy",
    url: "/dashboard/fare-policy",
    icon: <DollarSignIcon />,
  },
  {
    title: "Bookings",
    url: "/dashboard/bookings",
    icon: <FileTextIcon />,
  },
  {
    title: "Broadcast",
    url: "/dashboard/broadcast",
    icon: <SendIcon />,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <SettingsIcon />,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: <BellIcon />,
  },
  {
    title: "Help & Support",
    url: "/dashboard/support",
    icon: <CircleHelpIcon />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const isSuperAdmin = user?.role?.toLowerCase() === "super_admin";

  const filteredNavMain = React.useMemo(
    () =>
      isSuperAdmin
        ? navMain
        : navMain.filter((item) => item.url !== "/dashboard/admins"),
    [isSuperAdmin],
  );

  const userData = {
    name: user?.name || "Admin User",
    email: user?.email || "admin@uniride.ng",
    avatar: user?.profile_picture || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent hover:text-inherit"
            >
              <Link href="/">
                <Logo className="w-7 h-auto" variant="dark" />
                <span className="text-base font-semibold">UniRide</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} currentPath={pathname} />
        <NavSecondary
          items={navSecondary}
          currentPath={pathname}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
