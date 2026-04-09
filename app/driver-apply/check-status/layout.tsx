import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Driver Application Status",
};

export default function CheckStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
