"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminStore, type AdminBooking } from "@/store/useAdminStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  StatusFilter,
  LoadingState,
} from "@/components/shared";
import { BookingsTable } from "@/components/tables/bookings-table";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const {
    bookings,
    bookingsTotalCount,
    getAllBookings,
    acceptBooking,
    declineBooking,
    isLoading,
  } = useAdminStore();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [actionBooking, setActionBooking] = useState<{
    id: string;
    action: "accept" | "decline";
  } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchBookings = useCallback(() => {
    getAllBookings({
      status: statusFilter === "all" ? undefined : statusFilter,
      page,
      limit,
    });
  }, [getAllBookings, statusFilter, page, limit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      const userName =
        typeof b.user_id === "object" && b.user_id
          ? (b.user_id.name || "").toLowerCase()
          : "";
      const ridePickup =
        typeof b.ride_id === "object" && b.ride_id
          ? typeof b.ride_id.pickup_location_id === "object" &&
            b.ride_id.pickup_location_id
            ? (
                b.ride_id.pickup_location_id.name ||
                b.ride_id.pickup_location_id.address ||
                ""
              ).toLowerCase()
            : ""
          : "";
      const rideDest =
        typeof b.ride_id === "object" && b.ride_id
          ? typeof b.ride_id.destination_id === "object" &&
            b.ride_id.destination_id
            ? (
                b.ride_id.destination_id.name ||
                b.ride_id.destination_id.address ||
                ""
              ).toLowerCase()
            : ""
          : "";
      return (
        userName.includes(q) ||
        ridePickup.includes(q) ||
        rideDest.includes(q) ||
        b.status.toLowerCase().includes(q) ||
        b.payment_method?.toLowerCase().includes(q)
      );
    });
  }, [bookings, searchQuery]);

  const handleAction = async () => {
    if (!actionBooking) return;
    setProcessing(true);
    try {
      if (actionBooking.action === "accept") {
        await acceptBooking(actionBooking.id, adminNote || undefined);
      } else {
        await declineBooking(actionBooking.id, adminNote || undefined);
      }
      setActionBooking(null);
      setAdminNote("");
      fetchBookings();
    } catch {
      // toast handled in store
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Bookings"
        description="Review, accept, or decline passenger booking requests"
        actions={
          <Button
            onClick={fetchBookings}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={FileText}
          value={bookingsTotalCount}
          label="Total Bookings"
        />
        <StatsCard
          icon={Clock}
          iconColor="text-amber-500"
          value={bookings.filter((b) => b.status === "pending").length}
          label="Pending"
        />
        <StatsCard
          icon={CheckCircle2}
          iconColor="text-blue-500"
          value={bookings.filter((b) => b.status === "accepted").length}
          label="Accepted"
        />
        <StatsCard
          icon={Star}
          iconColor="text-green-500"
          value={bookings.filter((b) => b.status === "completed").length}
          label="Completed"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">All Bookings</CardTitle>
              <CardDescription className="text-xs">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                placeholder="Status"
              />
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search bookings..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && bookings.length === 0 ? (
            <LoadingState />
          ) : (
            <BookingsTable
              bookings={filteredBookings}
              onAccept={(booking) =>
                setActionBooking({ id: booking._id, action: "accept" })
              }
              onDecline={(booking) =>
                setActionBooking({ id: booking._id, action: "decline" })
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Accept/Decline Dialog */}
      <Dialog
        open={!!actionBooking}
        onOpenChange={(open) => {
          if (!open) {
            setActionBooking(null);
            setAdminNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionBooking?.action === "accept"
                ? "Accept Booking"
                : "Decline Booking"}
            </DialogTitle>
            <DialogDescription>
              {actionBooking?.action === "accept"
                ? "Confirm this booking request. The passenger will be notified."
                : "Decline this booking request. The passenger will be notified of the rejection."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="admin-note" className="text-sm">
              Admin Note (optional)
            </Label>
            <Textarea
              id="admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={
                actionBooking?.action === "accept"
                  ? "Any notes for this approval…"
                  : "Reason for declining…"
              }
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setActionBooking(null);
                setAdminNote("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionBooking?.action === "accept" ? "default" : "destructive"
              }
              onClick={handleAction}
              disabled={processing}
              className={
                actionBooking?.action === "accept"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : actionBooking?.action === "accept" ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {actionBooking?.action === "accept" ? "Accept" : "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
