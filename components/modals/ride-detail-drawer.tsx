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
  Car,
  MapPin,
  DollarSign,
  CalendarDays,
  Users,
  Hash,
  Clock,
  Star,
  Phone,
  Palette,
  Ban,
  Route,
  Navigation,
} from "lucide-react";
import type { AdminRide } from "@/store/useAdminStore";

const statusStyles: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
    className: string;
  }
> = {
  scheduled: {
    variant: "outline",
    label: "Scheduled",
    className: "text-blue-700 border-blue-200 bg-blue-50",
  },
  available: {
    variant: "outline",
    label: "Available",
    className: "text-emerald-700 border-emerald-200 bg-emerald-50",
  },
  accepted: {
    variant: "outline",
    label: "Accepted",
    className: "text-amber-700 border-amber-200 bg-amber-50",
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
    variant: "destructive",
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

interface RideDetailDrawerProps {
  ride: AdminRide;
  trigger?: React.ReactNode;
  onCancel?: () => void;
}

export function RideDetailDrawer({
  ride,
  trigger,
  onCancel,
}: RideDetailDrawerProps) {
  const isMobile = useIsMobile();

  // Extract populated data
  const driver = ride.driver_id;
  const driverName =
    typeof driver === "object"
      ? (driver?.user_id?.name ?? "Unknown")
      : "Unknown";
  const driverPhone = typeof driver === "object" ? driver?.phone : undefined;
  const driverVehicle =
    typeof driver === "object" ? driver?.vehicle_model : undefined;
  const driverPlate =
    typeof driver === "object" ? driver?.plate_number : undefined;
  const driverColor =
    typeof driver === "object" ? driver?.vehicle_color : undefined;
  const driverRating = typeof driver === "object" ? driver?.rating : undefined;
  const driverAvatar =
    typeof driver === "object" ? driver?.vehicle_image : undefined;
  const driverOnline = typeof driver === "object" ? driver?.is_online : false;

  const pickupLoc = ride.pickup_location_id;
  const pickupName =
    typeof pickupLoc === "object"
      ? pickupLoc?.short_name || pickupLoc?.name
      : "—";
  const pickupAddress =
    typeof pickupLoc === "object" ? pickupLoc?.address : undefined;

  const destLoc = ride.destination_id;
  const destName =
    typeof destLoc === "object" ? destLoc?.short_name || destLoc?.name : "—";
  const destAddress =
    typeof destLoc === "object" ? destLoc?.address : undefined;

  const status = statusStyles[ride.status] || {
    variant: "secondary" as const,
    label: ride.status,
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
            {ride._id.slice(-8).toUpperCase()}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Ride Details</DrawerTitle>
          <DrawerDescription className="text-xs font-mono">
            {ride._id}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />

          {/* Status + Created */}
          <div className="flex items-center justify-between">
            <Badge
              variant={status.variant}
              className={`text-[10px] ${status.className}`}
            >
              {status.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(ride.createdAt)}
            </span>
          </div>

          {/* Driver Profile */}
          <div className="flex items-center gap-3">
            <ProfileAvatar src={driverAvatar} name={driverName} size="md" />
            <div>
              <p className="text-sm font-medium">{driverName}</p>
              <div className="flex items-center gap-2 mt-1">
                {driverRating != null && (
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs">{driverRating.toFixed(1)}</span>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    driverOnline
                      ? "text-green-700 border-green-200 bg-green-50"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        driverOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {driverOnline ? "Online" : "Offline"}
                  </span>
                </Badge>
              </div>
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
                  {pickupAddress && pickupAddress !== pickupName && (
                    <p className="text-[10px] text-muted-foreground">
                      {pickupAddress}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="text-sm font-medium">{destName}</p>
                  {destAddress && destAddress !== destName && (
                    <p className="text-[10px] text-muted-foreground">
                      {destAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">
                ₦{ride.fare?.toLocaleString() || "0"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Fare ({ride.fare_policy_source})
              </p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">
                {ride.booked_seats || 0}/{ride.available_seats}
              </p>
              <p className="text-[10px] text-muted-foreground">Seats Booked</p>
            </div>
          </div>

          {/* Driver Details */}
          <div className="grid gap-3">
            {driverVehicle && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Car className="h-3 w-3" /> Vehicle
                </Label>
                <span className="text-xs">{driverVehicle}</span>
              </div>
            )}
            {driverPlate && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Navigation className="h-3 w-3" /> Plate
                </Label>
                <span className="text-xs font-mono">{driverPlate}</span>
              </div>
            )}
            {driverColor && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Palette className="h-3 w-3" /> Color
                </Label>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{
                      backgroundColor: driverColor.toLowerCase(),
                    }}
                  />
                  <span className="text-xs">{driverColor}</span>
                </div>
              </div>
            )}
            {driverPhone && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone
                </Label>
                <span className="text-xs">{driverPhone}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3" /> Departure
              </Label>
              <span className="text-xs">{formatDate(ride.departure_time)}</span>
            </div>
          </div>

          {/* Check-in Code */}
          {ride.check_in_code && (
            <>
              <Separator />
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Check‑in Code</p>
                </div>
                <p className="text-xl font-bold font-mono tracking-widest text-center">
                  {ride.check_in_code}
                </p>
              </div>
            </>
          )}

          {/* Timing */}
          {ride.ended_at && (
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Ended At
              </Label>
              <span className="text-xs">{formatDate(ride.ended_at)}</span>
            </div>
          )}

          {ride.distance_meters != null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm font-bold">
                  {(ride.distance_meters / 1000).toFixed(1)} km
                </p>
                <p className="text-[10px] text-muted-foreground">Distance</p>
              </div>
              {ride.duration_seconds != null && (
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-sm font-bold">
                    {Math.round(ride.duration_seconds / 60)} min
                  </p>
                  <p className="text-[10px] text-muted-foreground">Duration</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter>
          {onCancel && !["completed", "cancelled"].includes(ride.status) && (
            <Button
              size="sm"
              variant="destructive"
              className="text-xs w-full"
              onClick={onCancel}
            >
              <Ban className="h-3.5 w-3.5 mr-1.5" />
              Cancel Ride
            </Button>
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
