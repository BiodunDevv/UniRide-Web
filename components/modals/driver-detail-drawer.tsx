"use client";

import React, { useEffect, useState } from "react";
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
import Link from "next/link";
import {
  Car,
  Mail,
  Phone,
  Star,
  ExternalLink,
  Palette,
  Info,
  Flag,
  FlagOff,
  ShieldAlert,
  Route,
  Loader2,
  CalendarDays,
} from "lucide-react";
import {
  useAdminStore,
  type Driver,
  type AdminRide,
} from "@/store/useAdminStore";

interface DriverDetailDrawerProps {
  driver: Driver;
  onFlag?: () => void;
  onDelete?: () => void;
}

function getLocationName(loc: any): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.short_name || loc.name || "—";
}

const rideStatusStyles: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  accepted: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
};

export function DriverDetailDrawer({
  driver,
  onFlag,
  onDelete,
}: DriverDetailDrawerProps) {
  const isMobile = useIsMobile();
  const [rideHistory, setRideHistory] = useState<AdminRide[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !historyLoaded) {
      setHistoryLoading(true);
      useAdminStore
        .getState()
        .getDriverRideHistory(driver._id)
        .then((rides) => {
          setRideHistory(rides);
          setHistoryLoaded(true);
        })
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [open, historyLoaded, driver._id]);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-medium hover:underline"
        >
          {driver.user_id?.name ?? "Driver profile pending"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Driver Profile</DrawerTitle>
          <DrawerDescription className="text-xs">
            View driver details and ride history
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={driver.user_id?.profile_picture}
              name={driver.user_id?.name ?? "Driver"}
              size="md"
            />
            <div>
              <p className="text-sm font-medium">
                {driver.user_id?.name ?? "Driver profile pending"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs">
                    {driver.rating?.toFixed(1) ?? "N/A"}
                  </span>
                </div>
                <Badge
                  variant={driver.status === "active" ? "outline" : "secondary"}
                  className={`text-[10px] ${
                    driver.status === "active"
                      ? "text-green-700 border-green-200 bg-green-50"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        driver.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                    {driver.status === "active" ? "On Duty" : "Off Duty"}
                  </span>
                </Badge>
                {driver.user_id?.is_flagged && (
                  <Badge variant="destructive" className="text-[10px]">
                    <ShieldAlert className="h-2.5 w-2.5 mr-0.5" />
                    Flagged
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">{driver.total_ratings}</p>
              <p className="text-[10px] text-muted-foreground">Total Ratings</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-bold">
                  {driver.rating?.toFixed(1) ?? "N/A"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Rating</p>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <span className="text-xs">{driver.user_id?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <span className="text-xs">
                {driver.phone || driver.user_id?.phone || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Vehicle
              </Label>
              <span className="text-xs">{driver.vehicle_model}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Plate
              </Label>
              <span className="text-xs font-mono">{driver.plate_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Available Seats
              </Label>
              <span className="text-xs">{driver.available_seats}</span>
            </div>
            {driver.vehicle_color && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Palette className="h-3 w-3" /> Color
                </Label>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{
                      backgroundColor: driver.vehicle_color.toLowerCase(),
                    }}
                  />
                  <span className="text-xs">{driver.vehicle_color}</span>
                </div>
              </div>
            )}
            {driver.vehicle_description && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Description
                </Label>
                <p className="text-xs text-foreground leading-relaxed">
                  {driver.vehicle_description}
                </p>
              </div>
            )}
          </div>

          {/* Ride History Section */}
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Route className="h-3.5 w-3.5 text-[#042F40]" />
              <p className="text-xs font-semibold text-[#042F40]">
                Recent Rides
              </p>
              {rideHistory.length > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {rideHistory.length}
                </Badge>
              )}
            </div>
            {historyLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">
                  Loading rides…
                </span>
              </div>
            ) : rideHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No ride history found
              </p>
            ) : (
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {rideHistory.slice(0, 10).map((ride) => {
                  const pickup = getLocationName(ride.pickup_location_id);
                  const dest = getLocationName(ride.destination_id);
                  const style =
                    rideStatusStyles[ride.status] || rideStatusStyles.cancelled;
                  return (
                    <div
                      key={ride._id}
                      className="rounded-lg border p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs min-w-0 flex-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                          <span className="truncate max-w-20">{pickup}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="truncate max-w-20">{dest}</span>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${style}`}
                        >
                          {ride.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-2.5 w-2.5" />
                          {new Date(ride.departure_time).toLocaleDateString(
                            "en-NG",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <span className="font-semibold text-foreground">
                          ₦{ride.fare?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DrawerFooter>
          {(onFlag || onDelete) && (
            <div className="flex gap-2 w-full">
              {onFlag && (
                <Button
                  size="sm"
                  variant={driver.user_id?.is_flagged ? "outline" : "secondary"}
                  className={`text-xs flex-1 ${
                    driver.user_id?.is_flagged
                      ? "border-green-200 text-green-700 hover:bg-green-50"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                  onClick={onFlag}
                >
                  {driver.user_id?.is_flagged ? (
                    <FlagOff className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {driver.user_id?.is_flagged ? "Unflag" : "Flag"}
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs flex-1"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs w-full"
            asChild
          >
            <Link href={`/dashboard/drivers/${driver._id}`}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View Full Details
            </Link>
          </Button>
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
