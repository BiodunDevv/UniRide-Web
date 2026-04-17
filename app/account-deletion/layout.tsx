import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Delete Your Account",
  description:
    "Request deletion of your UniRide rider or driver account, understand what data is deleted, and learn what limited records may be retained for compliance.",
  path: "/account-deletion",
  keywords: [
    "UniRide delete account",
    "UniRide account deletion",
    "Google Play delete account URL",
  ],
});

export default function AccountDeletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
