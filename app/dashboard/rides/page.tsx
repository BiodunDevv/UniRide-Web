"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAdminStore, type AdminRide } from "@/store/useAdminStore";
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
  Car,
  Clock,
  RefreshCw,
  Ban,
  Route,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  StatusFilter,
  LoadingState,
} from "@/components/shared";
import { RidesTable } from "@/components/tables/rides-table";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "available", label: "Available" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function RidesPage() {
  const { rides, ridesTotalCount, getAllRides, cancelRide, isLoading } =
    useAdminStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [cancelTarget, setCancelTarget] = useState<AdminRide | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchRides = useCallback(() => {
    getAllRides({
      status: statusFilter === "all" ? undefined : statusFilter,
      page,
      limit,
    });
  }, [getAllRides, statusFilter, page, limit]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const filteredRides = useMemo(() => {
    if (!searchQuery.trim()) return rides;
    const q = searchQuery.toLowerCase();
    return rides.filter((r) => {
      const driverName =
        typeof r.driver_id === "object" && r.driver_id
          ? (
              r.driver_id.user_id?.name ||
              r.driver_id.vehicle_model ||
              ""
            ).toLowerCase()
          : typeof r.created_by === "object" && r.created_by
            ? (r.created_by.name || "").toLowerCase()
            : "";
      const pickup =
        typeof r.pickup_location_id === "object" && r.pickup_location_id
          ? (
              r.pickup_location_id.name ||
              r.pickup_location_id.address ||
              ""
            ).toLowerCase()
          : "";
      const dest =
        typeof r.destination_id === "object" && r.destination_id
          ? (
              r.destination_id.name ||
              r.destination_id.address ||
              ""
            ).toLowerCase()
          : "";
      return (
        driverName.includes(q) ||
        pickup.includes(q) ||
        dest.includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });
  }, [rides, searchQuery]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelRide(cancelTarget._id, cancelReason || undefined);
      setCancelTarget(null);
      setCancelReason("");
      fetchRides();
    } catch {
      // toast handled in store
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Rides"
        description="Monitor and manage all driver-created rides across the platform"
        actions={
          <Button
            onClick={fetchRides}
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
        <StatsCard icon={Car} value={ridesTotalCount} label="Total Rides" />
        <StatsCard
          icon={Route}
          iconColor="text-emerald-500"
          value={rides.filter((r) => r.status === "available").length}
          label="Available"
        />
        <StatsCard
          icon={Clock}
          iconColor="text-purple-500"
          value={rides.filter((r) => r.status === "in_progress").length}
          label="In Progress"
        />
        <StatsCard
          icon={CheckCircle2}
          iconColor="text-green-500"
          value={rides.filter((r) => r.status === "completed").length}
          label="Completed"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">All Rides</CardTitle>
              <CardDescription className="text-xs">
                {filteredRides.length} ride
                {filteredRides.length !== 1 ? "s" : ""}
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
                placeholder="Search rides..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && rides.length === 0 ? (
            <LoadingState />
          ) : (
            <RidesTable
              rides={filteredRides}
              onCancel={(ride) => setCancelTarget(ride)}
            />
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Ride</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this ride? This will notify the
              driver and all joined passengers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="ride-cancel-reason" className="text-sm">
              Cancellation reason (optional)
            </Label>
            <Textarea
              id="ride-cancel-reason"
              rows={3}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Share context for support logs and passenger communication…"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason("");
              }}
              disabled={cancelling}
            >
              Keep Ride
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelling}
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Cancel Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
