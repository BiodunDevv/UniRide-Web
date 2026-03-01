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
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  Users,
  Mail,
  Calendar,
  Flag,
  FlagOff,
  ExternalLink,
  ShieldAlert,
  FileText,
  Loader2,
  CalendarDays,
} from "lucide-react";
import {
  useAdminStore,
  type User,
  type AdminBooking,
} from "@/store/useAdminStore";

interface UserDetailDrawerProps {
  user: User;
  onFlag?: () => void;
  onDelete?: () => void;
}

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

export function UserDetailDrawer({
  user,
  onFlag,
  onDelete,
}: UserDetailDrawerProps) {
  const isMobile = useIsMobile();
  const [bookingHistory, setBookingHistory] = useState<AdminBooking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !historyLoaded) {
      setHistoryLoading(true);
      useAdminStore
        .getState()
        .getUserBookingHistory(user._id)
        .then((bookings) => {
          setBookingHistory(bookings);
          setHistoryLoaded(true);
        })
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [open, historyLoaded, user._id]);

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
          {user.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">User Profile</DrawerTitle>
          <DrawerDescription className="text-xs">
            View user account details and booking history
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={user.profile_picture}
              name={user.name}
              size="md"
            />
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge
                  variant={!user.is_flagged ? "outline" : "destructive"}
                  className="text-[10px] capitalize"
                >
                  {user.is_flagged ? (
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      Flagged
                    </span>
                  ) : (
                    "Active"
                  )}
                </Badge>
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold capitalize">{user.role}</p>
              <p className="text-[10px] text-muted-foreground">Role</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">
                {new Date(user.createdAt).toLocaleDateString("en-NG", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-[10px] text-muted-foreground">Member Since</p>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <span className="text-xs">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Joined
              </Label>
              <span className="text-xs">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Booking History Section */}
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-3.5 w-3.5 text-[#042F40]" />
              <p className="text-xs font-semibold text-[#042F40]">
                Recent Bookings
              </p>
              {bookingHistory.length > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {bookingHistory.length}
                </Badge>
              )}
            </div>
            {historyLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">
                  Loading bookings…
                </span>
              </div>
            ) : bookingHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No booking history found
              </p>
            ) : (
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {bookingHistory.slice(0, 10).map((booking) => {
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
                          {booking.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-2.5 w-2.5" />
                          {new Date(
                            booking.booking_time || booking.createdAt,
                          ).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]">
                            {booking.seats_requested} seat
                            {booking.seats_requested > 1 ? "s" : ""}
                          </span>
                          <span className="font-semibold text-foreground">
                            ₦{booking.total_fare?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DrawerFooter>
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full"
            asChild
          >
            <Link href={`/dashboard/users/${user._id}`}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View Full Details
            </Link>
          </Button>
          {(onFlag || onDelete) && (
            <div className="flex gap-2 w-full">
              {onFlag && (
                <Button
                  size="sm"
                  variant={user.is_flagged ? "outline" : "secondary"}
                  className={`text-xs flex-1 ${
                    user.is_flagged
                      ? "border-green-200 text-green-700 hover:bg-green-50"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                  onClick={onFlag}
                >
                  {user.is_flagged ? (
                    <FlagOff className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {user.is_flagged ? "Unflag" : "Flag"}
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
