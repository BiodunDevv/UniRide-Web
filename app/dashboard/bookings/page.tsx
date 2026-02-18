import { ComingSoon } from "@/components/shared";

export default function BookingsPage() {
  return (
    <ComingSoon
      feature="Bookings"
      description="Full booking management is on its way. You'll be able to monitor rides in real-time, filter by status, review trip details, and export reports — all in one place."
      highlights={[
        "Live ride tracking with real-time status updates",
        "Filter by status: pending, in-progress, completed, cancelled",
        "Passenger & driver details per booking",
        "Fare breakdown and payment history",
        "CSV / PDF export for reporting",
      ]}
    />
  );
}
