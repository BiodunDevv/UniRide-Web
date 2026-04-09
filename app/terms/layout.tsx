import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Read the UniRide terms of service for our campus ride-hailing platform, including student, driver, and university transportation guidelines.",
  path: "/terms",
  keywords: [
    "UniRide terms of service",
    "campus ride-hailing terms",
    "university transportation policy",
  ],
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
