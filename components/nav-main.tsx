"use client";

import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
  currentPath?: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  const normalizedPath = (currentPath || "").replace(/\/+$/, "") || "/";
  const activeUrl =
    items
      .filter((item) => {
        const normalizedUrl = item.url.replace(/\/+$/, "") || "/";
        return (
          normalizedPath === normalizedUrl ||
          normalizedPath.startsWith(`${normalizedUrl}/`)
        );
      })
      .sort((a, b) => b.url.length - a.url.length)[0]?.url || null;

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = activeUrl === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  asChild
                  className={
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }
                >
                  <Link href={item.url} onClick={handleNavClick}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
