"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardListIcon,
  FileTextIcon,
  FlagIcon,
  BellIcon,
} from "lucide-react";
import type { DashboardData } from "@/store/useDashboardStore";

interface SecondaryStatsProps {
  overview: DashboardData["overview"];
  support_tickets: DashboardData["support_tickets"];
  driver_applications: DashboardData["driver_applications"];
}

export function SecondaryStats({
  overview: o,
  support_tickets,
  driver_applications,
}: SecondaryStatsProps) {
  const approvalRate = parseFloat(driver_applications.approval_rate) || 0;

  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6 @xl/main:grid-cols-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
            <ClipboardListIcon className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-xl font-bold tabular-nums">
            {driver_applications.pending}
          </span>
          <p className="text-[10px] text-muted-foreground">
            Pending Applications
          </p>
          <p className="text-[10px] text-muted-foreground">
            {approvalRate.toFixed(0)}% approval rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-1">
            <FileTextIcon className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-xl font-bold tabular-nums">
            {support_tickets.open}
          </span>
          <p className="text-[10px] text-muted-foreground">Open Tickets</p>
          <p className="text-[10px] text-muted-foreground">
            {support_tickets.total} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
            <FlagIcon className="h-4 w-4 text-destructive" />
          </div>
          <span className="text-xl font-bold tabular-nums">
            {o.flagged_users + o.flagged_drivers}
          </span>
          <p className="text-[10px] text-muted-foreground">Flagged Accounts</p>
          <p className="text-[10px] text-muted-foreground">
            {o.flagged_users} users · {o.flagged_drivers} drivers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4 gap-1">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <BellIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xl font-bold tabular-nums">
            {o.unread_notifications}
          </span>
          <p className="text-[10px] text-muted-foreground">
            Unread Notifications
          </p>
          <p className="text-[10px] text-muted-foreground">
            {o.total_admins} admins · {o.super_admins} super
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
