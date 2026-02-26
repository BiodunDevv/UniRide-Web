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
} from "lucide-react";
import type { Driver } from "@/store/useAdminStore";

interface DriverDetailDrawerProps {
  driver: Driver;
  onFlag?: () => void;
  onDelete?: () => void;
}

export function DriverDetailDrawer({
  driver,
  onFlag,
  onDelete,
}: DriverDetailDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-medium hover:underline"
        >
          {driver.user_id?.name ?? "Unknown"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Driver Profile</DrawerTitle>
          <DrawerDescription className="text-xs">
            View driver details and statistics
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
                {driver.user_id?.name ?? "Unknown"}
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
