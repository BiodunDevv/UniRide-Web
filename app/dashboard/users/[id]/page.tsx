"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminStore } from "@/store/useAdminStore";
import type { User, AdminBooking } from "@/store/useAdminStore";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingState, StatsCard } from "@/components/shared";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Flag,
  FlagOff,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  CalendarDays,
  CreditCard,
  Armchair,
} from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/shared/profile-avatar";

function getLocationName(loc: any): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.short_name || loc.name || "—";
}

const bookingStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border-blue-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getUserById, flagUser, deleteUser, getUserBookingHistory } =
    useAdminStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [bookingHistory, setBookingHistory] = useState<AdminBooking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserById(id);
      setUser(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch user";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user) {
      setHistoryLoading(true);
      getUserBookingHistory(user._id)
        .then(setBookingHistory)
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [user?._id]);

  const handleFlag = async () => {
    if (!user) return;
    setFlagLoading(true);
    try {
      const newFlagState = !user.is_flagged;
      await flagUser(user._id, newFlagState);
      const updated = await getUserById(id);
      setUser(updated);
      toast.success(
        newFlagState
          ? "User account has been flagged"
          : "User account has been unflagged",
      );
    } catch {
      toast.error("Failed to update user flag status");
    } finally {
      setFlagLoading(false);
    }
  };

  const handleDelete = async (forceDelete: boolean) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await deleteUser(user._id, forceDelete);
      setShowDeleteModal(false);
      router.push("/dashboard/users");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <LoadingState />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {error || "User not found"}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  const completedBookings = bookingHistory.filter(
    (b) => b.status === "completed",
  );
  const totalSpent = bookingHistory.reduce(
    (sum, b) => sum + (b.total_fare || 0),
    0,
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={user.profile_picture}
              name={user.name}
              size="md"
            />
            <div>
              <h1 className="text-base font-semibold leading-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={!user.is_flagged ? "outline" : "destructive"}
                  className="text-[10px] capitalize"
                >
                  {user.is_flagged ? "Flagged" : "Active"}
                </Badge>
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={user.is_flagged ? "outline" : "secondary"}
            className={`text-xs ${
              user.is_flagged
                ? "border-green-200 text-green-700 hover:bg-green-50"
                : "text-amber-700 hover:bg-amber-50"
            }`}
            onClick={handleFlag}
            disabled={flagLoading}
          >
            {flagLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : user.is_flagged ? (
              <FlagOff className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <Flag className="h-3.5 w-3.5 mr-1.5" />
            )}
            {user.is_flagged ? "Unflag User" : "Flag User"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Flagged banner */}
      {user.is_flagged && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Flag className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              This user&apos;s account is flagged
            </p>
            <p className="text-xs text-muted-foreground">
              The user cannot sign in until their account is unflagged.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50 text-xs shrink-0"
            onClick={handleFlag}
            disabled={flagLoading}
          >
            {flagLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            )}
            Unflag Account
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={FileText}
          value={bookingHistory.length}
          label="Total Bookings"
        />
        <StatsCard
          icon={CheckCircle}
          iconColor="text-green-500"
          value={completedBookings.length}
          label="Completed"
        />
        <StatsCard
          icon={CreditCard}
          iconColor="text-[#D4A017]"
          value={`₦${totalSpent.toLocaleString()}`}
          label="Total Spent"
        />
        <StatsCard
          icon={Calendar}
          iconColor="text-blue-500"
          value={new Date(user.createdAt).toLocaleDateString("en-NG", {
            month: "short",
            year: "numeric",
          })}
          label="Member Since"
        />
      </div>

      {/* Detail Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription className="text-xs">
              User profile and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Name
              </span>
              <span className="text-xs font-medium">{user.name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </span>
              <span className="text-xs">{user.email}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Role
              </span>
              <Badge variant="secondary" className="text-[10px] capitalize">
                {user.role}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Joined
              </span>
              <span className="text-xs">
                {new Date(user.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Last Updated
              </span>
              <span className="text-xs">
                {new Date(user.updatedAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status & Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Status & Security
            </CardTitle>
            <CardDescription className="text-xs">
              Account status and security information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Account Status
              </span>
              <Badge
                variant={!user.is_flagged ? "outline" : "destructive"}
                className="text-[10px]"
              >
                <span className="flex items-center gap-1">
                  {user.is_flagged ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {user.is_flagged ? "Flagged" : "Active"}
                </span>
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Role Type</span>
              <span className="text-xs capitalize font-medium">
                {user.role}
              </span>
            </div>
            <Separator />

            {/* Quick Actions */}
            <div className="pt-3 space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </p>
              <Button
                size="sm"
                variant={user.is_flagged ? "default" : "secondary"}
                className="text-xs w-full"
                onClick={handleFlag}
                disabled={flagLoading}
              >
                {flagLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : user.is_flagged ? (
                  <FlagOff className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <Flag className="h-3.5 w-3.5 mr-1.5" />
                )}
                {user.is_flagged
                  ? "Unflag User — Restore Access"
                  : "Flag User — Restrict Access"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs w-full"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete User Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Booking History
              </CardTitle>
              <CardDescription className="text-xs">
                Recent ride bookings made by this user
              </CardDescription>
            </div>
            {bookingHistory.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {bookingHistory.length} booking
                {bookingHistory.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">
                Loading booking history…
              </span>
            </div>
          ) : bookingHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">
                No bookings found for this user
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookingHistory.map((booking) => {
                const ride = booking.ride_id;
                const pickup =
                  ride && typeof ride === "object"
                    ? getLocationName(ride.pickup_location_id)
                    : "—";
                const dest =
                  ride && typeof ride === "object"
                    ? getLocationName(ride.destination_id)
                    : "—";
                const style =
                  bookingStatusStyles[booking.status] ||
                  bookingStatusStyles.cancelled;

                return (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <div className="w-px h-3 bg-border" />
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="truncate font-medium">{pickup}</span>
                          <span className="text-muted-foreground shrink-0">
                            →
                          </span>
                          <span className="truncate font-medium">{dest}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <CalendarDays className="h-2.5 w-2.5" />
                            {new Date(
                              booking.booking_time || booking.createdAt,
                            ).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Armchair className="h-2.5 w-2.5" />
                            {booking.seats_requested} seat
                            {booking.seats_requested > 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <CreditCard className="h-2.5 w-2.5" />
                            {booking.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs font-bold">
                        ₦{booking.total_fare?.toLocaleString() || "0"}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${style}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete User"
        entityName={user.name}
        entityType="user"
        onConfirm={handleDelete}
        isLoading={actionLoading}
        showForceOption
      />
    </div>
  );
}
