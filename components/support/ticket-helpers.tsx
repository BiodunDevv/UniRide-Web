"use client";

import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";

/* ─── Priority ─── */
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

const priorityVariant: Record<
  Priority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  urgent: "destructive",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority as Priority;
  return (
    <Badge variant={priorityVariant[p] ?? "outline"} className="text-[10px] capitalize">
      {priority}
    </Badge>
  );
}

/* ─── Status ─── */
export const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
] as const;

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  open: { label: "Open", icon: Clock, variant: "outline" },
  in_progress: { label: "In Progress", icon: AlertCircle, variant: "default" },
  resolved: { label: "Resolved", icon: CheckCircle2, variant: "secondary" },
  closed: { label: "Closed", icon: XCircle, variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? {
    label: status,
    icon: MessageSquare,
    variant: "outline" as const,
  };
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="text-[10px] capitalize gap-1">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

export function getStatusIcon(status: string) {
  const cfg = statusConfig[status];
  if (!cfg) return <MessageSquare className="h-4 w-4" />;
  const Icon = cfg.icon;
  return <Icon className="h-4 w-4" />;
}
