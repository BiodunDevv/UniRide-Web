"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CarIcon,
  FileTextIcon,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import type { DashboardData } from "@/store/useDashboardStore";

interface RidesBookingOverviewProps {
  overview: DashboardData["overview"];
}

export function RidesBookingOverview({
  overview: o,
}: RidesBookingOverviewProps) {
  const rideCompletionRate = parseFloat(o.ride_completion_rate) || 0;

  return (
    <div className="grid gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
      {/* Ride Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CarIcon className="h-4 w-4 text-primary" />
            Ride Overview
          </CardTitle>
          <CardDescription className="text-xs">
            Breakdown of ride statuses
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Completed
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{o.completed_rides}</span>
              <Badge variant="outline" className="text-[10px]">
                {rideCompletionRate.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <XCircle className="h-3 w-3 text-destructive" />
              Cancelled
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{o.cancelled_rides}</span>
              <Badge variant="outline" className="text-[10px]">
                {o.total_rides > 0
                  ? ((o.cancelled_rides / o.total_rides) * 100).toFixed(1)
                  : 0}
                %
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-amber-500" />
              In Progress
            </span>
            <span className="text-xs font-medium">{o.in_progress_rides}</span>
          </div>
          <div className="pt-1">
            <div className="h-2 w-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${o.total_rides > 0 ? (o.completed_rides / o.total_rides) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width: `${o.total_rides > 0 ? (o.in_progress_rides / o.total_rides) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-destructive transition-all"
                style={{
                  width: `${o.total_rides > 0 ? (o.cancelled_rides / o.total_rides) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-primary" />
            Booking Overview
          </CardTitle>
          <CardDescription className="text-xs">
            Breakdown of booking statuses
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Completed
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                {o.completed_bookings}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {o.total_bookings > 0
                  ? ((o.completed_bookings / o.total_bookings) * 100).toFixed(1)
                  : 0}
                %
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <XCircle className="h-3 w-3 text-destructive" />
              Cancelled
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                {o.cancelled_bookings}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {o.total_bookings > 0
                  ? ((o.cancelled_bookings / o.total_bookings) * 100).toFixed(1)
                  : 0}
                %
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-amber-500" />
              Active
            </span>
            <span className="text-xs font-medium">{o.active_bookings}</span>
          </div>
          <div className="pt-1">
            <div className="h-2 w-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${o.total_bookings > 0 ? (o.completed_bookings / o.total_bookings) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width: `${o.total_bookings > 0 ? (o.active_bookings / o.total_bookings) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-destructive transition-all"
                style={{
                  width: `${o.total_bookings > 0 ? (o.cancelled_bookings / o.total_bookings) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
