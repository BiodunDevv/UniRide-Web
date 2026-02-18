"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Clock,
  MoreHorizontal,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import type { Notification } from "@/store/useNotificationStore";
import { formatDistanceToNow } from "date-fns";
import { TYPE_ICONS, TYPE_LABELS } from "./constants";

interface NotificationRowProps {
  notification: Notification;
  isDeleting: boolean;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationRow({
  notification,
  isDeleting,
  onMarkRead,
  onDelete,
}: NotificationRowProps) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  const isUnread = !notification.is_read;

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : "";

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-md transition-all duration-300
        hover:bg-muted/50
        ${isUnread ? "bg-primary/5" : ""}
        ${isDeleting ? "opacity-40 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"}
      `}
    >
      {/* Icon */}
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isUnread
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-xs ${isUnread ? "font-semibold" : "font-medium"}`}
          >
            {notification.title ??
              TYPE_LABELS[notification.type] ??
              "Notification"}
          </p>
          {isUnread && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          )}
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 capitalize"
          >
            {notification.type}
          </Badge>
        </div>

        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
          {notification.message}
        </p>

        <div className="flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
        </div>
      </div>

      {/* Row actions */}
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0 mt-0.5" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {isUnread && (
              <>
                <DropdownMenuItem
                  className="text-xs gap-2"
                  onClick={() => onMarkRead(notification._id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Mark as read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-xs gap-2 text-destructive focus:text-destructive"
              onClick={() => onDelete(notification._id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
