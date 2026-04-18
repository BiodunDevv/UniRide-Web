"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  CalendarDays,
  CreditCard,
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Hash,
  Phone,
  ExternalLink,
} from "lucide-react";
import type { AdminBooking } from "@/store/useAdminStore";

const statusStyles: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
    className: string;
  }
> = {
  pending: {
    variant: "outline",
    label: "Pending",
    className: "text-amber-700 border-amber-200 bg-amber-50",
  },
  accepted: {
    variant: "outline",
    label: "Accepted",
    className: "text-blue-700 border-blue-200 bg-blue-50",
  },
  declined: {
    variant: "destructive",
    label: "Declined",
    className: "",
  },
  in_progress: {
    variant: "outline",
    label: "In Progress",
    className: "text-purple-700 border-purple-200 bg-purple-50",
  },
  completed: {
    variant: "default",
    label: "Completed",
    className: "",
  },
  cancelled: {
    variant: "secondary",
    label: "Cancelled",
    className: "",
  },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateSafe(value?: string) {
  if (!value) return "";
  return formatDate(value);
}

function getLocationName(loc: any): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.short_name || loc.name || "—";
}

interface BookingDetailDrawerProps {
  booking: AdminBooking;
  trigger?: React.ReactNode;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function BookingDetailDrawer({
  booking,
  trigger,
  onAccept,
  onDecline,
}: BookingDetailDrawerProps) {
  const isMobile = useIsMobile();

  const user = booking.user_id;
  const userName =
    typeof user === "object" ? (user?.name ?? "Passenger") : "Passenger";
  const userEmail = typeof user === "object" ? user?.email : undefined;
  const userPhone = typeof user === "object" ? user?.phone : undefined;
  const userAvatar =
    typeof user === "object" ? user?.profile_picture : undefined;

  const ride = booking.ride_id;
  const pickupName =
    ride && typeof ride === "object"
      ? getLocationName(ride.pickup_location_id)
      : "—";
  const destName =
    ride && typeof ride === "object"
      ? getLocationName(ride.destination_id)
      : "—";
  const rideDepartureTime =
    ride && typeof ride === "object" ? ride.departure_time : undefined;
  const ridePassengers = booking.ride_passengers || [];
  const assignedDriverName =
    ride &&
    typeof ride === "object" &&
    ride.driver_id &&
    typeof ride.driver_id === "object"
      ? ride.driver_id.user_id?.name || "Assigned Driver"
      : "Awaiting Driver Assignment";

  const timelineItems: Array<{
    id: string;
    label: string;
    detail?: string;
    time?: string;
    tone?: "default" | "success" | "danger";
  }> = [
    {
      id: "booking-created",
      label: "Booking requested",
      detail: `${pickupName} → ${destName}`,
      time: booking.booking_time || booking.createdAt,
      tone: "success",
    },
  ];

  if (ridePassengers.length > 0) {
    timelineItems.push({
      id: "ride-passengers",
      label: "Ride participants",
      detail: `${ridePassengers.length} passenger${ridePassengers.length === 1 ? "" : "s"} currently on this route`,
      time: ridePassengers[0]?.booking_time || ridePassengers[0]?.createdAt,
      tone: "success",
    });
  }

  if (["accepted", "in_progress", "completed"].includes(booking.status)) {
    timelineItems.push({
      id: "accepted",
      label: "Booking accepted",
      detail: `Driver: ${assignedDriverName}`,
      time: booking.updatedAt,
      tone: "success",
    });
  }

  if (booking.check_in_status === "checked_in") {
    timelineItems.push({
      id: "checked-in",
      label: "Passenger checked in",
      detail: "Passenger verified boarding code",
      time: booking.updatedAt,
      tone: "success",
    });
  }

  if (booking.status === "completed") {
    timelineItems.push({
      id: "completed",
      label: "Session completed",
      detail: "Ride and booking completed successfully",
      time:
        ride && typeof ride === "object"
          ? ride.ended_at || booking.updatedAt
          : booking.updatedAt,
      tone: "success",
    });
  }

  if (["declined", "cancelled"].includes(booking.status)) {
    timelineItems.push({
      id: "cancelled-or-declined",
      label:
        booking.status === "declined"
          ? "Booking declined"
          : "Booking cancelled",
      detail: booking.admin_note || "No additional note provided",
      time: booking.updatedAt,
      tone: "danger",
    });
  }

  const status = statusStyles[booking.status] || {
    variant: "secondary" as const,
    label: booking.status,
    className: "",
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-mono font-medium hover:underline"
          >
            {booking._id.slice(-8).toUpperCase()}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Booking Details</DrawerTitle>
          <DrawerDescription className="text-xs font-mono">
            {booking._id}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />

          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <Badge
              variant={status.variant}
              className={`text-[10px] ${status.className}`}
            >
              {status.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(booking.createdAt)}
            </span>
          </div>

          {/* Passenger */}
          <div className="flex items-center gap-3">
            <ProfileAvatar src={userAvatar} name={userName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{userName}</p>
              {userEmail && (
                <p className="text-[10px] text-muted-foreground">{userEmail}</p>
              )}
              {userPhone && (
                <a
                  href={`tel:${userPhone}`}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:text-sky-800"
                >
                  <Phone className="h-3 w-3" />
                  {userPhone}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <Separator />

          {/* Route */}
          <div className="rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="w-px h-6 bg-border" />
                <div className="h-2 w-2 rounded-full bg-destructive" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-medium">{pickupName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="text-sm font-medium">{destName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">
                ₦{booking.total_fare?.toLocaleString() || "0"}
              </p>
              <p className="text-[10px] text-muted-foreground">Total Fare</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">{booking.seats_requested}</p>
              <p className="text-[10px] text-muted-foreground">
                Seats Requested
              </p>
            </div>
          </div>

          {/* Joined Passengers */}
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-900">
                Ride Passengers
              </p>
              <Badge variant="secondary" className="text-[10px]">
                {ridePassengers.length}
              </Badge>
            </div>

            {ridePassengers.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                No passengers are currently linked to this ride.
              </p>
            ) : (
              <div className="space-y-2">
                {ridePassengers.slice(0, 8).map((passenger) => {
                  const passengerName =
                    passenger.name || passenger.passenger_name || "Passenger";
                  const isCurrentBooking =
                    passenger.booking_id &&
                    passenger.booking_id === booking._id;

                  return (
                    <div
                      key={
                        passenger.booking_id ||
                        `${passengerName}-${passenger.createdAt}`
                      }
                      className={`flex items-center justify-between rounded-md border px-2.5 py-2 ${
                        isCurrentBooking
                          ? "border-blue-100 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ProfileAvatar
                          src={passenger.profile_picture || undefined}
                          name={passengerName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {isCurrentBooking
                              ? `${passengerName} (this booking)`
                              : passengerName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {passenger.seats_requested || 1} seat
                            {(passenger.seats_requested || 1) > 1 ? "s" : ""}
                            {passenger.check_in_status === "checked_in"
                              ? " · Checked in"
                              : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {(passenger.status || "pending").replace("_", " ")}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" /> Payment
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs capitalize">
                  {booking.payment_method}
                </span>
                <Badge
                  variant={
                    booking.payment_status === "paid" ? "default" : "secondary"
                  }
                  className="text-[10px]"
                >
                  {booking.payment_status === "paid"
                    ? "Paid"
                    : booking.payment_status === "not_applicable"
                      ? "N/A"
                      : "Pending"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> Booked
              </Label>
              <span className="text-xs">
                {formatDate(booking.booking_time || booking.createdAt)}
              </span>
            </div>
            {rideDepartureTime && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" /> Departure
                </Label>
                <span className="text-xs">{formatDate(rideDepartureTime)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Check‑in
              </Label>
              <Badge
                variant={
                  booking.check_in_status === "checked_in"
                    ? "default"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {booking.check_in_status === "checked_in"
                  ? "Checked In"
                  : "Not Checked In"}
              </Badge>
            </div>
          </div>

          {/* Rating & Feedback */}
          {booking.rating != null && (
            <>
              <Separator />
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <p className="text-xs text-muted-foreground">
                    Rating & Feedback
                  </p>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < (booking.rating ?? 0)
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="text-xs ml-1">({booking.rating}/5)</span>
                </div>
                {booking.feedback && (
                  <p className="text-xs text-muted-foreground italic">
                    &ldquo;{booking.feedback}&rdquo;
                  </p>
                )}
              </div>
            </>
          )}

          {/* Admin Note */}
          {booking.admin_note && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                <p className="text-xs text-amber-700 font-medium">Admin Note</p>
              </div>
              <p className="text-xs text-amber-800">{booking.admin_note}</p>
            </div>
          )}

          {/* Session Timeline */}
          <div className="rounded-lg border p-3">
            <p className="text-xs font-semibold text-slate-900 mb-2">
              Session Timeline
            </p>
            <div className="space-y-3">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="flex gap-2.5">
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.tone === "danger"
                          ? "bg-red-500"
                          : item.tone === "success"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                      }`}
                    />
                    {index < timelineItems.length - 1 && (
                      <span className="mt-1 h-full min-h-4 w-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-900">
                        {item.label}
                      </p>
                      {item.time ? (
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateSafe(item.time)}
                        </span>
                      ) : null}
                    </div>
                    {item.detail ? (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter>
          {booking.status === "pending" && (onAccept || onDecline) && (
            <div className="flex gap-2 w-full">
              {onAccept && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                  onClick={onAccept}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Accept
                </Button>
              )}
              {onDecline && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs"
                  onClick={onDecline}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Decline
                </Button>
              )}
            </div>
          )}
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="text-xs w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
