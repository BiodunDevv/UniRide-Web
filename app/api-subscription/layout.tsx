import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Platform Services",
};

export default function ApiSubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
