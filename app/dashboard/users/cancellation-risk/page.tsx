"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Database,
  Flag,
  Loader2,
  Route,
  Search,
  UserRound,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RiskUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  is_flagged: boolean;
  profile_picture?: string | null;
};

type RiskTimelineEvent = {
  id: string;
  event_type: "user_cancelled_booking" | "driver_cancelled_ride";
  title: string;
  occurred_at?: string;
  reason?: string;
  actor?: {
    name?: string;
    role?: string;
  };
  route?: {
    pickup?: {
      short_name?: string;
      name?: string;
      address?: string;
    } | null;
    destination?: {
      short_name?: string;
      name?: string;
      address?: string;
    } | null;
  };
};

type RiskRow = {
  user: RiskUser;
  risk_score: number;
  risk_band: "high" | "medium" | "low";
  last_event_at?: string;
  metrics: {
    self_cancelled_bookings: number;
    driver_cancelled_rides: number;
    total_events: number;
  };
  top_driver_cancel_reasons: Array<{ reason: string; count: number }>;
  recent_timeline: RiskTimelineEvent[];
};

type RiskResponse = {
  success: boolean;
  count: number;
  data: RiskRow[];
};

function getAuthToken(): string {
  const tokenRaw = localStorage.getItem("auth-storage");
  if (!tokenRaw) throw new Error("No authentication token found");
  const tokenData = JSON.parse(tokenRaw);
  if (!tokenData?.state?.token) {
    throw new Error("No authentication token found");
  }
  return tokenData.state.token;
}

async function authFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

function formatTime(value?: string): string {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return date.toLocaleString();
}

function locationLabel(
  value?: { short_name?: string; name?: string; address?: string } | null,
): string {
  if (!value) return "Unknown";
  return value.short_name || value.name || value.address || "Unknown";
}

export default function CancellationRiskPage() {
  const [rows, setRows] = useState<RiskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [flaggingUserId, setFlaggingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const data = await authFetch<RiskResponse>(
      `${API_URL}/api/admin/users/cancellation-risk?limit=40&events_limit=4`,
    );
    setRows(data.data || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((item) => {
      const phone = item.user.phone || "";
      return (
        item.user.name.toLowerCase().includes(q) ||
        item.user.email.toLowerCase().includes(q) ||
        phone.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const stats = useMemo(() => {
    const high = rows.filter((item) => item.risk_band === "high").length;
    const flagged = rows.filter((item) => item.user.is_flagged).length;
    const avgScore =
      rows.length > 0
        ? rows.reduce((sum, item) => sum + Number(item.risk_score || 0), 0) /
          rows.length
        : 0;

    return {
      total: rows.length,
      high,
      flagged,
      avgScore: avgScore.toFixed(1),
    };
  }, [rows]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const applyLocalFlagState = useCallback(
    (userId: string, isFlagged: boolean) => {
      setRows((prev) =>
        prev.map((row) =>
          row.user._id === userId
            ? {
                ...row,
                user: {
                  ...row.user,
                  is_flagged: isFlagged,
                },
              }
            : row,
        ),
      );
    },
    [],
  );

  const handleToggleFlag = useCallback(
    async (item: RiskRow) => {
      const userId = item.user._id;
      const previousState = item.user.is_flagged;
      const nextState = !previousState;

      setFlaggingUserId(userId);
      applyLocalFlagState(userId, nextState);

      try {
        const response = await authFetch<{
          success: boolean;
          message?: string;
          data?: { is_flagged?: boolean };
        }>(`${API_URL}/api/admin/users/flag/${userId}`, {
          method: "PATCH",
          body: JSON.stringify({ is_flagged: nextState }),
        });

        const serverState =
          typeof response?.data?.is_flagged === "boolean"
            ? response.data.is_flagged
            : nextState;

        applyLocalFlagState(userId, serverState);
        toast.success(
          response.message ||
            `User ${serverState ? "flagged" : "unflagged"} successfully`,
        );
      } catch (error) {
        applyLocalFlagState(userId, previousState);
        const message =
          error instanceof Error ? error.message : "Failed to update flag";
        toast.error(message);
      } finally {
        setFlaggingUserId((current) => (current === userId ? null : current));
      }
    },
    [applyLocalFlagState],
  );

  const riskBadgeClasses: Record<RiskRow["risk_band"], string> = {
    high: "bg-red-50 text-red-700 border-red-100",
    medium: "bg-amber-50 text-amber-700 border-amber-100",
    low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Cancellation Risk Radar"
          description="Global moderation view of users with repeated self-cancellations and driver-cancelled ride exposure"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              void handleRefresh();
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Clock3 className="h-3.5 w-3.5 mr-1.5" />
            )}
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/dashboard/users">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-[11px] text-muted-foreground">Risk Users</p>
            <p className="mt-1 text-lg font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[11px] text-muted-foreground">High Risk</p>
            <p className="mt-1 text-lg font-bold text-red-600">{stats.high}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[11px] text-muted-foreground">Already Flagged</p>
            <p className="mt-1 text-lg font-bold text-amber-600">
              {stats.flagged}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[11px] text-muted-foreground">Avg Risk Score</p>
            <p className="mt-1 text-lg font-bold">{stats.avgScore}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 overflow-hidden bg-linear-to-br from-[#042F40] via-[#06384A] to-[#041B24] text-white shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Route className="h-4 w-4 text-[#D4A017]" />
            Platform Cancellation Risk Timeline
          </CardTitle>
          <p className="text-xs text-slate-200">
            Uber-style moderation lane using UniRide brand colors and timeline
            context
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter by name, email, or phone"
                className="h-9 pl-9 text-xs bg-white/90 text-slate-900"
              />
            </div>
            <Badge className="h-9 px-3 rounded-md bg-white/10 text-white border-white/20">
              Showing {filteredRows.length} / {rows.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-10 flex items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading cancellation risk users...
          </CardContent>
        </Card>
      ) : filteredRows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-xs text-muted-foreground">
            No cancellation-risk users found for the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((item) => (
            <Card key={item.user._id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold truncate">
                        {item.user.name}
                      </p>
                      {item.user.is_flagged ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Flagged
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {item.user.email}
                      {item.user.phone ? ` • ${item.user.phone}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`border text-[10px] capitalize ${riskBadgeClasses[item.risk_band]}`}
                    >
                      {item.risk_band} risk
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Score: {item.risk_score}
                    </Badge>
                    <Button
                      size="sm"
                      variant={item.user.is_flagged ? "outline" : "destructive"}
                      className="text-xs"
                      onClick={() => {
                        void handleToggleFlag(item);
                      }}
                      disabled={flaggingUserId === item.user._id}
                    >
                      {flaggingUserId === item.user._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Flag className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {item.user.is_flagged ? "Unflag User" : "Flag User"}
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Link
                        href={`/dashboard/users/data-tools?userId=${encodeURIComponent(
                          item.user._id,
                        )}&q=${encodeURIComponent(item.user.email)}`}
                      >
                        <Database className="h-3.5 w-3.5 mr-1.5" />
                        Inspect
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-md border p-2">
                    Self-cancelled: {item.metrics.self_cancelled_bookings}
                  </div>
                  <div className="rounded-md border p-2">
                    Driver-cancelled: {item.metrics.driver_cancelled_rides}
                  </div>
                  <div className="rounded-md border p-2">
                    Total events: {item.metrics.total_events}
                  </div>
                </div>

                {item.top_driver_cancel_reasons.length > 0 ? (
                  <div className="rounded-md border p-2">
                    <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      Frequent Driver Cancellation Reasons
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.top_driver_cancel_reasons.map((reasonRow) => (
                        <Badge
                          key={`${item.user._id}-${reasonRow.reason}`}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {reasonRow.reason} ({reasonRow.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.recent_timeline.length > 0 ? (
                  <div className="rounded-md border p-3">
                    <p className="text-[11px] font-semibold mb-2">
                      Recent Timeline
                    </p>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200" />
                      {item.recent_timeline.map((event) => {
                        const isSelf =
                          event.event_type === "user_cancelled_booking";
                        return (
                          <div
                            key={event.id}
                            className="relative pb-3 pl-4 last:pb-0"
                          >
                            <span
                              className={`absolute -left-px top-2 h-2.5 w-2.5 rounded-full ${
                                isSelf ? "bg-red-500" : "bg-amber-500"
                              }`}
                            />
                            <div className="rounded-md border px-3 py-2">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs font-semibold">
                                  {event.title}
                                </p>
                                <Badge
                                  variant={isSelf ? "destructive" : "secondary"}
                                  className="text-[10px] w-fit"
                                >
                                  {isSelf ? "Self Cancel" : "Driver Cancel"}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {locationLabel(event.route?.pickup)} →{" "}
                                {locationLabel(event.route?.destination)}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {event.reason || "No reason provided."}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                {formatTime(event.occurred_at)} •{" "}
                                {event.actor?.name || "Unknown"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
