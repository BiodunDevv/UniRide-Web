"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  OverviewCards,
  SecondaryStats,
  RidesBookingOverview,
  SupportSummary,
  ApplicationsSummary,
  PlatformSummary,
  UserGrowthChart,
  RevenueChart,
  periodLabels,
} from "@/components/dashboard";

export default function DashboardPage() {
  const {
    dashboardData: data,
    isLoading,
    currentPeriod,
    getDashboardData,
    setPeriod,
  } = useDashboardStore();

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <p className="text-sm text-muted-foreground">
          Failed to load dashboard data
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {data.period_info
                  ? `${new Date(data.period_info.start_date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })} – ${new Date(data.period_info.end_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Overview of your platform"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
              <Select
                value={currentPeriod}
                onValueChange={(v) =>
                  setPeriod(v as "7days" | "30days" | "90days" | "year" | "all")
                }
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary stat cards */}
          <OverviewCards overview={data.overview} />

          {/* Charts row */}
          <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
            <UserGrowthChart data={data.user_growth_chart} />
            <RevenueChart data={data.revenue_chart} />
          </div>

          {/* Secondary stat mini-cards */}
          <SecondaryStats
            overview={data.overview}
            support_tickets={data.support_tickets}
            driver_applications={data.driver_applications}
          />

          {/* Rides & Booking breakdown */}
          <RidesBookingOverview overview={data.overview} />

          {/* Support & Applications */}
          <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
            <SupportSummary support_tickets={data.support_tickets} />
            <ApplicationsSummary
              driver_applications={data.driver_applications}
            />
          </div>

          {/* Platform summary */}
          <div className="px-4 lg:px-6">
            <PlatformSummary
              overview={data.overview}
              total_bookings={data.overview.total_bookings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
