"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  FileTextIcon,
  CarIcon,
  UsersIcon,
  DollarSignIcon,
  CheckCircle,
} from "lucide-react";
import { formatRevenue, formatNumber, parseGrowth } from "./utils";
import type { DashboardData } from "@/store/useDashboardStore";

interface OverviewCardsProps {
  overview: DashboardData["overview"];
}

export function OverviewCards({ overview: o }: OverviewCardsProps) {
  const userGrowth = parseGrowth(o.user_growth_percentage);
  const driverGrowth = parseGrowth(o.driver_growth_percentage);
  const revenueGrowth = parseGrowth(o.revenue_growth_percentage);
  const rideCompletionRate =
    typeof o.ride_completion_rate === "number"
      ? o.ride_completion_rate
      : parseFloat(String(o.ride_completion_rate)) || 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid sm:grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 lg:grid-cols-4">
      {/* Total Rides */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <FileTextIcon className="size-3.5" />
            Total Rides
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(o.total_rides)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CheckCircle className="size-3" />
              {rideCompletionRate.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {o.completed_rides} completed
            <span className="text-muted-foreground font-normal">
              · {o.cancelled_rides} cancelled
            </span>
          </div>
          <div className="text-muted-foreground">
            {o.in_progress_rides} ride{o.in_progress_rides !== 1 ? "s" : ""} in
            progress
          </div>
        </CardFooter>
      </Card>

      {/* Active Drivers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <CarIcon className="size-3.5" />
            Active Drivers
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(o.active_drivers)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {driverGrowth.isPositive ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
              {driverGrowth.isPositive ? "+" : ""}
              {driverGrowth.value.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {o.total_drivers} total drivers
            {driverGrowth.isPositive ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {o.new_drivers_this_period} new this period
          </div>
        </CardFooter>
      </Card>

      {/* Registered Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5" />
            Registered Users
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(o.total_users)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {userGrowth.isPositive ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
              {userGrowth.isPositive ? "+" : ""}
              {userGrowth.value.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {o.active_users} active users
            {userGrowth.isPositive ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {o.new_users_this_period} new this period
          </div>
        </CardFooter>
      </Card>

      {/* Revenue */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <DollarSignIcon className="size-3.5" />
            Revenue
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRevenue(o.total_revenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {revenueGrowth.isPositive ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
              {revenueGrowth.isPositive ? "+" : ""}
              {revenueGrowth.value.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {revenueGrowth.isPositive ? "Revenue growing" : "Revenue dipped"}
            {revenueGrowth.isPositive ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {o.total_seats_booked > 0
              ? `${formatRevenue(o.avg_fare_per_seat)}/seat · ${formatNumber(o.total_seats_booked)} seats`
              : "Compared to previous period"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
