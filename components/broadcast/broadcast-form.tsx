"use client";

import { useState } from "react";
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
import { Send, Users, Car, Megaphone, Shield, Loader2 } from "lucide-react";

interface BroadcastFormProps {
  onSend: (
    title: string,
    message: string,
    target: "all" | "users" | "drivers" | "admins",
    notificationType: "push" | "email" | "both",
  ) => Promise<void>;
}

export function BroadcastForm({ onSend }: BroadcastFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "users" | "drivers" | "admins">(
    "all",
  );
  const [notificationType, setNotificationType] = useState<
    "push" | "email" | "both"
  >("push");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await onSend(title, message, target, notificationType);
      setTitle("");
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
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
  );
}
