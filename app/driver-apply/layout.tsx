import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Become a Campus Driver",
  description:
    "Apply to drive with UniRide and join a verified university transportation platform built for safe campus rides and trusted student mobility.",
  path: "/driver-apply",
  keywords: [
    "campus driver application",
    "university driver signup",
    "student ride driver platform",
    "campus transportation driver",
  ],
});

export default function DriverApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
