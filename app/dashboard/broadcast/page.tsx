"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Users,
  Car,
  Megaphone,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { BroadcastMessage } from "@/store/useAdminStore";

export default function BroadcastPage() {
  const { broadcasts, isLoading, sendBroadcastMessage, getBroadcastHistory } =
    useAdminStore();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "users" | "drivers" | "admins">(
    "all",
  );
  const [notificationType, setNotificationType] = useState<
    "push" | "email" | "both"
  >("push");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getBroadcastHistory(20);
  }, [getBroadcastHistory]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await sendBroadcastMessage(title, message, target, notificationType);
      setTitle("");
      setMessage("");
      await getBroadcastHistory(20);
    } finally {
      setSending(false);
    }
  };

  const targetLabel = (t: string) => {
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
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-lg font-semibold">Broadcast</h2>
        <p className="text-xs text-muted-foreground">
          Send notifications to users and drivers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              New Broadcast
            </CardTitle>
            <CardDescription className="text-xs">
              Compose and send a broadcast message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Target Audience</Label>
              <Select
                value={target}
                onValueChange={(v) =>
                  setTarget(v as "all" | "users" | "drivers" | "admins")
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="users" className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Users Only
                    </div>
                  </SelectItem>
                  <SelectItem value="drivers" className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5" />
                      Drivers Only
                    </div>
                  </SelectItem>
                  <SelectItem value="admins" className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Admins Only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notification Type</Label>
              <Select
                value={notificationType}
                onValueChange={(v) =>
                  setNotificationType(v as "push" | "email" | "both")
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push" className="text-xs">
                    Push Notification
                  </SelectItem>
                  <SelectItem value="email" className="text-xs">
                    Email
                  </SelectItem>
                  <SelectItem value="both" className="text-xs">
                    Both
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Broadcast title"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your broadcast message..."
                className="text-xs min-h-25"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!title.trim() || !message.trim() || sending}
              className="w-full"
              size="sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1.5" />
              )}
              <span className="text-xs">
                {sending ? "Sending..." : "Send Broadcast"}
              </span>
            </Button>
          </CardContent>
        </Card>

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
                {broadcasts.map((broadcast: BroadcastMessage) => (
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
                          {broadcast.successful_sends}/
                          {broadcast.total_recipients} sent
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
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize"
                      >
                        {broadcast.notification_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
