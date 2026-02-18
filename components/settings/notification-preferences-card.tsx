"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

const PREFERENCES = [
  { label: "Email Notifications", desc: "Receive updates via email" },
  { label: "Push Notifications", desc: "Browser push notifications" },
  { label: "New Driver Applications", desc: "Alert for new applications" },
  { label: "Support Tickets", desc: "Alert for new support tickets" },
];

export function NotificationPreferencesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-xs">
          Configure how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {PREFERENCES.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-1"
          >
            <div>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              On
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
