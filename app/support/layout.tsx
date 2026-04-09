import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Help Center for Riders and Drivers",
  description:
    "Get UniRide support for campus rides, student accounts, payments, and driver questions through our university transportation help center.",
  path: "/support",
  keywords: [
    "campus ride support",
    "university transportation help center",
    "student ride app support",
    "driver support portal",
  ],
});

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
