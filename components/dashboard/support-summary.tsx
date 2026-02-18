"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardData } from "@/store/useDashboardStore";

interface SupportSummaryProps {
  support_tickets: DashboardData["support_tickets"];
}

export function SupportSummary({ support_tickets }: SupportSummaryProps) {
  const hasByPriority =
    support_tickets.by_priority && support_tickets.by_priority.length > 0;
  const hasByCategory =
    support_tickets.by_category && support_tickets.by_category.length > 0;

  if (!hasByPriority && !hasByCategory) return null;

  return (
    <>
      {hasByPriority && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tickets by Priority</CardTitle>
            <CardDescription className="text-xs">
              {support_tickets.total} total tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {support_tickets.by_priority.map((item) => (
              <div
                key={item.priority}
                className="flex items-center justify-between"
              >
                <span className="text-xs text-muted-foreground capitalize">
                  {item.priority}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasByCategory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tickets by Category</CardTitle>
            <CardDescription className="text-xs">
              Grouped by issue type
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {support_tickets.by_category.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between"
              >
                <span className="text-xs text-muted-foreground capitalize">
                  {item.category.replace(/_/g, " ")}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
