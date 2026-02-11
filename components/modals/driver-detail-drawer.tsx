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
import { Car, Mail, Phone, Star } from "lucide-react";
import type { Driver } from "@/store/useAdminStore";

interface DriverDetailDrawerProps {
  driver: Driver;
  onDelete?: () => void;
}

export function DriverDetailDrawer({
  driver,
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
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-primary" />
            </div>
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
                  variant={
                    driver.status === "active" ? "outline" : "destructive"
                  }
                  className="text-[10px] capitalize"
                >
                  {driver.status}
                </Badge>
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
          </div>
        </div>
        <DrawerFooter className="shrink-0 border-t">
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="text-xs"
              onClick={onDelete}
            >
              Delete Driver
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="text-xs">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
