"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldIcon } from "lucide-react";
import type { DashboardData } from "@/store/useDashboardStore";

interface PlatformSummaryProps {
  overview: DashboardData["overview"];
  total_bookings: number;
}

export function PlatformSummary({
  overview: o,
  total_bookings,
}: PlatformSummaryProps) {
  const stats = [
    { label: "Total Admins", value: o.total_admins },
    { label: "Super Admins", value: o.super_admins },
    { label: "Avg Rating", value: o.average_rating },
    { label: "Inactive Drivers", value: o.inactive_drivers },
    { label: "Pending Apps", value: o.pending_applications },
    { label: "Total Bookings", value: total_bookings },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Platform Summary
        </CardTitle>
        <CardDescription className="text-xs">
          Quick glance at platform health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold tabular-nums">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
