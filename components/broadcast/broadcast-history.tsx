"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { BroadcastMessage } from "@/store/useAdminStore";

function targetLabel(t: string) {
  switch (t) {
    case "users":
      return "Users";
    case "drivers":
      return "Drivers";
    case "admins":
      return "Admins";
    default:
      return "All";
  }
}

interface BroadcastHistoryProps {
  broadcasts: BroadcastMessage[];
  isLoading: boolean;
}

export function BroadcastHistory({
  broadcasts,
  isLoading,
}: BroadcastHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Broadcasts</CardTitle>
        <CardDescription className="text-xs">
          Previously sent messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && broadcasts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : broadcasts.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No broadcasts sent yet
          </p>
        ) : (
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <div
                key={broadcast._id}
                className="border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium">{broadcast.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {broadcast.message}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize shrink-0"
                  >
                    {targetLabel(broadcast.target_audience)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(broadcast.createdAt).toLocaleString()}
                  </div>
                  {broadcast.status === "completed" ? (
                    <div className="flex items-center gap-1 text-[10px] text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      {broadcast.successful_sends}/{broadcast.total_recipients}{" "}
                      sent
                    </div>
                  ) : broadcast.status === "failed" ? (
                    <div className="flex items-center gap-1 text-[10px] text-red-600">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {broadcast.status}
                    </div>
                  )}
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {broadcast.notification_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
