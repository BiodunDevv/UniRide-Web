import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center — UniRide Support",
  description:
    "Get help with your UniRide account, rides, payments, or anything else. Submit a support request or track an existing ticket.",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
