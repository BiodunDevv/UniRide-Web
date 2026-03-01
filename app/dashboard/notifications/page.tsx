"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared";
import {
  BellOff,
  CheckCheck,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";
import {
  useNotificationStore,
  type NotificationQueryParams,
} from "@/store/useNotificationStore";
import {
  NotificationSkeleton,
  EmptyState,
  NotificationRow,
  FILTER_OPTIONS,
} from "@/components/notifications";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    isMutating,
    error,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
    clearError,
  } = useNotificationStore();

  const [readFilter, setReadFilter] = useState<boolean | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  // Track which IDs are currently being deleted (for per-row spinner)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  // Prevent overlapping "delete all" runs
  const isDeletingAllRef = useRef(false);

  const fetchNotifications = useCallback(
    (overrides?: NotificationQueryParams) => {
      getNotifications({
        is_read: readFilter,
        type: typeFilter,
        limit: 50,
        ...overrides,
      });
    },
    [getNotifications, readFilter, typeFilter],
  );

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Dismiss store-level errors (toasts already shown)
  useEffect(() => {
    if (error) clearError();
  }, [error, clearError]);

  // ── Delete one by one with a short stagger ────────────────────────────────
  const handleDeleteAll = useCallback(async () => {
    if (isDeletingAllRef.current || notifications.length === 0) return;
    isDeletingAllRef.current = true;

    const ids = notifications.map((n) => n._id);
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      setDeletingIds((prev) => new Set(prev).add(id));

      try {
        // silent=true — suppress per-item toasts during bulk, show one summary at the end
        await deleteNotification(id, true);
        deleted++;
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, 100));
    }

    isDeletingAllRef.current = false;
    setDeletingIds(new Set());

    if (deleted > 0 && failed === 0) {
      toast.success(
        `All ${deleted} notification${deleted !== 1 ? "s" : ""} deleted`,
      );
    } else if (deleted > 0 && failed > 0) {
      toast.success(`${deleted} deleted`, {
        description: `${failed} could not be removed`,
      });
    } else if (failed > 0) {
      toast.error("Could not delete notifications. Please try again.");
    }
  }, [notifications, deleteNotification]);

  const handleDeleteSingle = useCallback(
    async (id: string) => {
      setDeletingIds((prev) => new Set(prev).add(id));
      try {
        await deleteNotification(id);
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [deleteNotification],
  );

  const hasReadNotifications = notifications.some((n) => n.is_read);
  const isFiltered = readFilter !== undefined || typeFilter !== undefined;
  const isDeletingAll = isDeletingAllRef.current || deletingIds.size > 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Notifications"
          description={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}${pagination ? ` · ${pagination.total} total` : ""}`
              : `No unread notifications${pagination ? ` · ${pagination.total} total` : ""}`
          }
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchNotifications()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
              >
                <Filter className="h-3.5 w-3.5" />
                {readFilter === undefined
                  ? "All"
                  : readFilter
                    ? "Read"
                    : "Unread"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.label}
                  className="text-xs"
                  onClick={() => {
                    setReadFilter(opt.value);
                    getNotifications({
                      is_read: opt.value,
                      type: typeFilter,
                      limit: 50,
                    });
                  }}
                >
                  {opt.label}
                  {readFilter === opt.value && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                disabled={isDeletingAll && notifications.length === 0}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {unreadCount > 0 && (
                <DropdownMenuItem
                  className="text-xs gap-2"
                  disabled={isMutating}
                  onClick={markAllNotificationsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all as read
                </DropdownMenuItem>
              )}
              {hasReadNotifications && (
                <DropdownMenuItem
                  className="text-xs gap-2"
                  disabled={isMutating}
                  onClick={clearReadNotifications}
                >
                  <BellOff className="h-3.5 w-3.5" />
                  Clear read
                </DropdownMenuItem>
              )}
              {(unreadCount > 0 || hasReadNotifications) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                className="text-xs gap-2 text-destructive focus:text-destructive"
                disabled={isDeletingAll || notifications.length === 0}
                onClick={handleDeleteAll}
              >
                {isDeletingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {isDeletingAll
                  ? `Deleting… (${deletingIds.size} left)`
                  : "Delete all"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {isFiltered ? (
              <>
                Filtered results
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-2 text-xs text-muted-foreground"
                  onClick={() => {
                    setReadFilter(undefined);
                    setTypeFilter(undefined);
                    getNotifications({ limit: 50 });
                  }}
                >
                  Clear filter
                </Button>
              </>
            ) : (
              "All Notifications"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {isLoading ? (
            <div className="px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : (
            <div className="space-y-0.5 px-2">
              {notifications.map((n) => (
                <NotificationRow
                  key={n._id}
                  notification={n}
                  isDeleting={deletingIds.has(n._id)}
                  onMarkRead={markNotificationRead}
                  onDelete={handleDeleteSingle}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
