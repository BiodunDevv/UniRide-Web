"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Search,
  Loader2,
  Database,
  UserRound,
  Mail,
  Phone,
  Shield,
  FileText,
  Car,
  Trash2,
  Eye,
  Terminal,
  Flag,
  Clock3,
  Route,
  AlertTriangle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type LookupUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  is_flagged: boolean;
  profile_picture?: string | null;
  createdAt: string;
};

type BookingCountMap = {
  pending?: number;
  accepted?: number;
  declined?: number;
  in_progress?: number;
  completed?: number;
  cancelled?: number;
};

type SupportCountMap = Record<string, number>;

type UserInsightMetrics = {
  bookings_total: number;
  bookings_by_status: BookingCountMap;
  active_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
  rides_created_total: number;
  rides_created_active: number;
  rides_joined_total: number;
  notifications_total: number;
  notifications_unread: number;
  support_tickets_total: number;
  support_tickets_by_status: SupportCountMap;
  reviews_written: number;
  devices_count: number;
  self_cancelled_bookings?: number;
  driver_cancelled_rides?: number;
  cancellation_events_total?: number;
};

type InsightLocation = {
  short_name?: string;
  name?: string;
  address?: string;
};

type InsightRide = {
  _id?: string;
  status?: string;
  departure_time?: string;
  fare?: number;
  pickup_location_id?: InsightLocation | string;
  destination_id?: InsightLocation | string;
};

type InsightBooking = {
  _id: string;
  status: string;
  seats_requested: number;
  total_fare: number;
  payment_method: string;
  booking_time?: string;
  createdAt?: string;
  ride_id?: InsightRide | string | null;
};

type CancellationTimelineEvent = {
  id: string;
  event_type: "user_cancelled_booking" | "driver_cancelled_ride";
  title: string;
  occurred_at?: string;
  reason?: string;
  actor?: {
    id?: string;
    name?: string;
    role?: string;
  };
  booking_id?: string | null;
  ride_id?: string | null;
  route?: {
    pickup?: InsightLocation | string | null;
    destination?: InsightLocation | string | null;
  };
  meta?: {
    seats_requested?: number;
    payment_method?: string;
    total_fare?: number;
    booked_seats?: number;
    available_seats?: number;
    fare?: number;
  };
};

type CancellationSummary = {
  self_cancelled_bookings: number;
  driver_cancelled_rides: number;
  total_events: number;
};

type UserInsightsResponse = {
  user: LookupUser & {
    email_verified?: boolean;
    biometric_enabled?: boolean;
    pin_enabled?: boolean;
    account_deletion_status?: string;
    devices?: Array<{ device_id?: string }>;
  };
  metrics: UserInsightMetrics;
  recent_bookings: InsightBooking[];
  recent_rides: Array<
    InsightRide & {
      booked_seats?: number;
      available_seats?: number;
    }
  >;
  cancellation_summary?: CancellationSummary;
  cancellation_timeline?: CancellationTimelineEvent[];
  user_self_cancelled_bookings?: InsightBooking[];
  driver_cancelled_rides?: InsightRide[];
};

type ClearScriptResponse = {
  success: boolean;
  message: string;
  command?: string;
  data?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
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

function locationLabel(location?: InsightLocation | string): string {
  if (!location) return "—";
  if (typeof location === "string") return location;
  return location.short_name || location.name || location.address || "—";
}

function formatTimelineTime(value?: string): string {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return date.toLocaleString();
}

export default function UserDataToolsPage() {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const [query, setQuery] = useState("");
  const [lookupResults, setLookupResults] = useState<LookupUser[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [insights, setInsights] = useState<UserInsightsResponse | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [scriptRunning, setScriptRunning] = useState(false);
  const [flagUpdating, setFlagUpdating] = useState(false);
  const [scriptResponse, setScriptResponse] =
    useState<ClearScriptResponse | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const selectedUser = insights?.user || null;

  const commandPreview = useMemo(() => {
    if (!selectedUser?.email)
      return "node src/scripts/clearUserData.js <user-email>";
    return `node src/scripts/clearUserData.js ${selectedUser.email}`;
  }, [selectedUser?.email]);

  const performLookup = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (trimmed.length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }

    setSearching(true);
    try {
      const data = await authFetch<{ success: boolean; data: LookupUser[] }>(
        `${API_URL}/api/admin/users/lookup?query=${encodeURIComponent(trimmed)}&limit=20`,
      );
      setLookupResults(data.data || []);
      if ((data.data || []).length === 0) {
        toast.message("No users matched your search");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Lookup failed";
      toast.error(msg);
    } finally {
      setSearching(false);
    }
  }, []);

  const searchUsers = useCallback(async () => {
    await performLookup(query);
  }, [performLookup, query]);

  const loadInsights = useCallback(async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingInsights(true);
    try {
      const data = await authFetch<{
        success: boolean;
        data: UserInsightsResponse;
      }>(`${API_URL}/api/admin/users/${userId}/insights`);
      setInsights(data.data || null);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load user insights";
      toast.error(msg);
      setInsights(null);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const userId = params.get("userId")?.trim();
    const q = params.get("q")?.trim() || params.get("query")?.trim() || "";

    if (q) {
      setQuery(q);
    }

    if (userId) {
      void loadInsights(userId);
      return;
    }

    if (q.length >= 2) {
      void performLookup(q);
    }
  }, [loadInsights, performLookup, searchParamsKey]);

  const runClearScript = useCallback(
    async (dryRun: boolean) => {
      if (!selectedUserId) return;

      setScriptRunning(true);
      try {
        const data = await authFetch<ClearScriptResponse>(
          `${API_URL}/api/admin/users/${selectedUserId}/clear-data`,
          {
            method: "POST",
            body: JSON.stringify({ dry_run: dryRun }),
          },
        );

        setScriptResponse(data);
        toast.success(
          dryRun
            ? "Preview generated successfully"
            : "User data cleared successfully",
        );

        await loadInsights(selectedUserId);
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Script execution failed";
        toast.error(msg);
      } finally {
        setScriptRunning(false);
      }
    },
    [loadInsights, selectedUserId],
  );

  const handleToggleFlag = useCallback(async () => {
    if (!selectedUserId || !selectedUser) return;

    setFlagUpdating(true);
    try {
      const data = await authFetch<{
        success: boolean;
        message: string;
        data?: { is_flagged?: boolean };
      }>(`${API_URL}/api/admin/users/flag/${selectedUserId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_flagged: !selectedUser.is_flagged }),
      });

      toast.success(data.message || "User flag status updated");
      await loadInsights(selectedUserId);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to update flag status";
      toast.error(msg);
    } finally {
      setFlagUpdating(false);
    }
  }, [loadInsights, selectedUser, selectedUserId]);

  const bookingCounts = insights?.metrics.bookings_by_status || {};
  const supportCounts = insights?.metrics.support_tickets_by_status || {};
  const cancellationSummary = insights?.cancellation_summary || {
    self_cancelled_bookings: 0,
    driver_cancelled_rides: 0,
    total_events: 0,
  };
  const cancellationTimeline = insights?.cancellation_timeline || [];

  const cancellationRisk = useMemo(() => {
    const selfCancelled = Number(
      cancellationSummary.self_cancelled_bookings || 0,
    );
    if (selfCancelled >= 4) {
      return {
        label: "High cancellation risk",
        tone: "text-red-600 bg-red-50 border-red-100",
        icon: AlertTriangle,
      };
    }
    if (selfCancelled >= 2) {
      return {
        label: "Moderate cancellation risk",
        tone: "text-amber-600 bg-amber-50 border-amber-100",
        icon: AlertTriangle,
      };
    }
    return {
      label: "Low cancellation risk",
      tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
      icon: Flag,
    };
  }, [cancellationSummary.self_cancelled_bookings]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="User Data Tools"
          description="Inspect a user deeply and run the clear-data workflow with script-backed execution"
        />
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs w-full sm:w-auto"
        >
          <Link href="/dashboard/users">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Users
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Specific User
          </CardTitle>
          <CardDescription className="text-xs">
            Search by email, name, phone, or user ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: gmm527000@gmail.com"
              className="h-9 text-xs"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void searchUsers();
                }
              }}
            />
            <Button
              size="sm"
              className="text-xs"
              onClick={() => {
                void searchUsers();
              }}
              disabled={searching}
            >
              {searching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Search className="h-3.5 w-3.5 mr-1.5" />
              )}
              Search
            </Button>
          </div>

          <div className="rounded-lg border">
            {lookupResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                Search results will appear here.
              </div>
            ) : (
              <div className="divide-y">
                {lookupResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold truncate">
                          {user.name}
                        </p>
                        <Badge
                          variant={user.is_flagged ? "destructive" : "outline"}
                          className="text-[10px]"
                        >
                          {user.is_flagged ? "Flagged" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {user.phone || "No phone"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        selectedUserId === user._id ? "default" : "outline"
                      }
                      className="text-xs"
                      onClick={() => {
                        void loadInsights(user._id);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Inspect
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loadingInsights && (
        <Card>
          <CardContent className="py-8 flex items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading user insights...
          </CardContent>
        </Card>
      )}

      {!loadingInsights && selectedUser && insights && (
        <>
          <Card className="border-0 overflow-hidden bg-linear-to-br from-[#042F40] via-[#06384A] to-[#041B24] text-white shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <Route className="h-4 w-4 text-[#D4A017]" />
                Cancellation Intelligence
              </CardTitle>
              <CardDescription className="text-xs text-slate-200">
                Uber-style risk snapshot for behaviour-based moderation and
                quick flag decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-200">
                    Self Cancellations
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {cancellationSummary.self_cancelled_bookings}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-200">
                    Driver Cancellations
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {cancellationSummary.driver_cancelled_rides}
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-200">
                    Timeline Events
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {cancellationSummary.total_events}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cancellationRisk.tone}`}
                >
                  <cancellationRisk.icon className="h-3.5 w-3.5" />
                  {cancellationRisk.label}
                </div>

                <Button
                  size="sm"
                  variant={selectedUser.is_flagged ? "outline" : "destructive"}
                  className="text-xs border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => {
                    void handleToggleFlag();
                  }}
                  disabled={flagUpdating}
                >
                  {flagUpdating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {selectedUser.is_flagged ? "Remove Flag" : "Flag User"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card>
              <CardContent className="p-3">
                <p className="text-[11px] text-muted-foreground">Bookings</p>
                <p className="mt-1 text-lg font-bold">
                  {insights.metrics.bookings_total}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-[11px] text-muted-foreground">
                  Active Bookings
                </p>
                <p className="mt-1 text-lg font-bold">
                  {insights.metrics.active_bookings}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-[11px] text-muted-foreground">Total Spend</p>
                <p className="mt-1 text-lg font-bold">
                  ₦{Number(insights.metrics.total_spent || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-[11px] text-muted-foreground">
                  Rides Created
                </p>
                <p className="mt-1 text-lg font-bold">
                  {insights.metrics.rides_created_total}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  User Snapshot
                </CardTitle>
                <CardDescription className="text-xs">
                  Core profile and security state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <UserRound className="h-3 w-3" /> Name
                  </span>
                  <span className="text-xs font-medium text-right">
                    {selectedUser.name}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                  <span className="text-xs text-right">
                    {selectedUser.email}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Phone
                  </span>
                  <span className="text-xs text-right">
                    {selectedUser.phone || "N/A"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3 w-3" /> Status
                  </span>
                  <Badge
                    variant={
                      selectedUser.is_flagged ? "destructive" : "outline"
                    }
                    className="text-[10px]"
                  >
                    {selectedUser.is_flagged ? "Flagged" : "Active"}
                  </Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-md border p-2">
                    Email Verified: {selectedUser.email_verified ? "Yes" : "No"}
                  </div>
                  <div className="rounded-md border p-2">
                    Biometric: {selectedUser.biometric_enabled ? "On" : "Off"}
                  </div>
                  <div className="rounded-md border p-2">
                    PIN: {selectedUser.pin_enabled ? "On" : "Off"}
                  </div>
                  <div className="rounded-md border p-2">
                    Devices: {insights.metrics.devices_count}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Activity Snapshot
                </CardTitle>
                <CardDescription className="text-xs">
                  Booking lifecycle and support/notification health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-md border p-2">
                    Pending: {bookingCounts.pending || 0}
                  </div>
                  <div className="rounded-md border p-2">
                    Accepted: {bookingCounts.accepted || 0}
                  </div>
                  <div className="rounded-md border p-2">
                    In Progress: {bookingCounts.in_progress || 0}
                  </div>
                  <div className="rounded-md border p-2">
                    Completed: {bookingCounts.completed || 0}
                  </div>
                  <div className="rounded-md border p-2">
                    Cancelled: {bookingCounts.cancelled || 0}
                  </div>
                  <div className="rounded-md border p-2">
                    Declined: {bookingCounts.declined || 0}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-md border p-2">
                    Notifications: {insights.metrics.notifications_total}
                  </div>
                  <div className="rounded-md border p-2">
                    Unread Notifications:{" "}
                    {insights.metrics.notifications_unread}
                  </div>
                  <div className="rounded-md border p-2">
                    Support Tickets: {insights.metrics.support_tickets_total}
                  </div>
                  <div className="rounded-md border p-2">
                    Reviews Written: {insights.metrics.reviews_written}
                  </div>
                </div>
                {Object.keys(supportCounts).length > 0 && (
                  <div className="rounded-md border p-2 text-[11px]">
                    <p className="font-semibold mb-1">Support Status Mix</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(supportCounts).map(([status, count]) => (
                        <Badge
                          key={status}
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {status}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Clear Data Workflow
              </CardTitle>
              <CardDescription className="text-xs">
                Executes the backend script workflow using the command pattern
                you requested
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/20 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  Command Preview
                </p>
                <p className="text-xs font-mono mt-1 break-all">
                  {commandPreview}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    void runClearScript(true);
                  }}
                  disabled={scriptRunning}
                >
                  {scriptRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Run Preview (Dry Run)
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={scriptRunning}
                >
                  {scriptRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Clear User Data
                </Button>
              </div>

              {scriptResponse && (
                <div className="space-y-2">
                  <Label className="text-xs">Last Script Output</Label>
                  <Textarea
                    readOnly
                    className="min-h-55 font-mono text-[11px]"
                    value={JSON.stringify(scriptResponse, null, 2)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Cancellation Timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Chronological behaviour log for self-cancelled bookings and
                driver-cancelled rides with reasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cancellationTimeline.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No cancellation events yet for this user.
                </p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-1.75 top-1 bottom-1 w-px bg-slate-200" />
                  {cancellationTimeline.map((event) => {
                    const isUserCancellation =
                      event.event_type === "user_cancelled_booking";
                    const pickup = locationLabel(
                      event.route?.pickup || undefined,
                    );
                    const destination = locationLabel(
                      event.route?.destination || undefined,
                    );

                    return (
                      <div
                        key={event.id}
                        className="relative pb-4 pl-4 last:pb-0"
                      >
                        <span
                          className={`absolute -left-px top-2 h-2.5 w-2.5 rounded-full ${
                            isUserCancellation ? "bg-red-500" : "bg-amber-500"
                          }`}
                        />
                        <div className="rounded-xl border bg-white px-3 py-2.5">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-semibold">
                              {event.title}
                            </p>
                            <Badge
                              variant={
                                isUserCancellation ? "destructive" : "secondary"
                              }
                              className="text-[10px] w-fit"
                            >
                              {isUserCancellation
                                ? "Self Cancel"
                                : "Driver Cancel"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {pickup} → {destination}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {event.reason || "No additional reason provided."}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                            <span>
                              Actor: {event.actor?.name || "Unknown"} (
                              {event.actor?.role || "unknown"})
                            </span>
                            <span>•</span>
                            <span>{formatTimelineTime(event.occurred_at)}</span>
                            {isUserCancellation && (
                              <>
                                <span>•</span>
                                <span>
                                  Seats: {event.meta?.seats_requested || 0}
                                </span>
                                <span>•</span>
                                <span>
                                  Fare: ₦
                                  {Number(
                                    event.meta?.total_fare || 0,
                                  ).toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.recent_bookings.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No bookings found.
                  </p>
                ) : (
                  insights.recent_bookings.map((booking) => {
                    const ride =
                      booking.ride_id && typeof booking.ride_id === "object"
                        ? booking.ride_id
                        : null;
                    return (
                      <div
                        key={booking._id}
                        className="rounded-md border px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold capitalize">
                            {booking.status.replace("_", " ")}
                          </p>
                          <p className="text-xs font-bold">
                            ₦{Number(booking.total_fare || 0).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {locationLabel(ride?.pickup_location_id)} →{" "}
                          {locationLabel(ride?.destination_id)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {booking.seats_requested} seat(s) ·{" "}
                          {booking.payment_method}
                        </p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Recent User-Created Rides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.recent_rides.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No user-created rides found.
                  </p>
                ) : (
                  insights.recent_rides.map((ride, index) => (
                    <div
                      key={ride._id || `recent-ride-${index}`}
                      className="rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold capitalize">
                          {(ride.status || "unknown").replace("_", " ")}
                        </p>
                        <p className="text-xs font-bold">
                          ₦{Number(ride.fare || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {locationLabel(ride.pickup_location_id)} →{" "}
                        {locationLabel(ride.destination_id)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Seats booked: {ride.booked_seats || 0} /{" "}
                        {ride.available_seats || 0}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-destructive" />
              Clear User Data
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This executes the clear-data script for{" "}
              <strong>{selectedUser?.email || "the selected user"}</strong>. Use
              dry-run first if you want to preview what will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs" disabled={scriptRunning}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={scriptRunning}
              onClick={() => {
                void runClearScript(false);
                setConfirmClearOpen(false);
              }}
            >
              {scriptRunning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Run Clear Script
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
