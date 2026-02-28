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
import type { DashboardData } from "@/store/useDashboardStore";

interface ApplicationsSummaryProps {
  driver_applications: DashboardData["driver_applications"];
}

export function ApplicationsSummary({
  driver_applications,
}: ApplicationsSummaryProps) {
  const approvalRate = Number(driver_applications.approval_rate) || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Driver Applications</CardTitle>
        <CardDescription className="text-xs">
          This period&apos;s application stats
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Pending</span>
          <Badge variant="secondary" className="text-[10px]">
            {driver_applications.pending}
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Approved</span>
          <Badge variant="outline" className="text-[10px]">
            {driver_applications.approved_this_period}
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Rejected</span>
          <Badge variant="outline" className="text-[10px]">
            {driver_applications.rejected_this_period}
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Approval Rate</span>
          <span className="text-xs font-medium">
            {approvalRate.toFixed(1)}%
          </span>
        </div>
        <div className="pt-1">
          <div className="h-2 w-full bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${approvalRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
