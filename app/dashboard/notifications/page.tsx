"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  UserCheck,
  MessageSquare,
  DollarSign,
  Car,
  Clock,
} from "lucide-react";

const mockNotifications = [
  {
    id: "1",
    title: "New driver application",
    message: "Fatima Bello submitted a driver application",
    type: "application",
    read: false,
    createdAt: "2 minutes ago",
  },
  {
    id: "2",
    title: "Payment dispute",
    message: "Ayo Adeniyi reported a payment issue for booking BK001",
    type: "payment",
    read: false,
    createdAt: "15 minutes ago",
  },
  {
    id: "3",
    title: "Support ticket opened",
    message: "New support ticket #T003 - App crash on booking",
    type: "support",
    read: false,
    createdAt: "30 minutes ago",
  },
  {
    id: "4",
    title: "Driver suspended",
    message: "Ngozi Eze has been automatically suspended due to low rating",
    type: "driver",
    read: true,
    createdAt: "1 hour ago",
  },
  {
    id: "5",
    title: "New user registration",
    message: "50 new users registered in the last 24 hours",
    type: "user",
    read: true,
    createdAt: "2 hours ago",
  },
  {
    id: "6",
    title: "Revenue milestone",
    message: "Monthly revenue exceeded ₦2M target",
    type: "payment",
    read: true,
    createdAt: "5 hours ago",
  },
  {
    id: "7",
    title: "Driver application approved",
    message: "Grace Okafor's application was approved",
    type: "application",
    read: true,
    createdAt: "1 day ago",
  },
  {
    id: "8",
    title: "System update",
    message: "Platform update v2.3.1 deployed successfully",
    type: "system",
    read: true,
    createdAt: "2 days ago",
  },
];

const typeIcons: Record<string, typeof Bell> = {
  application: UserCheck,
  payment: DollarSign,
  support: MessageSquare,
  driver: Car,
  user: Bell,
  system: AlertCircle,
};

export default function NotificationsPage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-xs text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <CheckCheck className="h-4 w-4 mr-1.5" />
          <span className="text-xs">Mark all read</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {mockNotifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      !notification.read
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs ${!notification.read ? "font-semibold" : "font-medium"}`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {notification.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
