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
import {
  FileText,
  MapPin,
  User,
  Car,
  DollarSign,
  Calendar,
} from "lucide-react";

interface Booking {
  id: string;
  rider: string;
  driver: string | null;
  from: string;
  to: string;
  fare: string;
  status: string;
  date: string;
}

const statusStyles: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
  }
> = {
  completed: { variant: "default", label: "Completed" },
  in_progress: { variant: "outline", label: "In Progress" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  pending: { variant: "secondary", label: "Pending" },
};

interface BookingDetailDrawerProps {
  booking: Booking;
}

export function BookingDetailDrawer({ booking }: BookingDetailDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-mono font-medium hover:underline"
        >
          {booking.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Booking Details</DrawerTitle>
          <DrawerDescription className="text-xs">
            Booking {booking.id}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto px-4 py-2 text-sm">
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-mono font-medium">
                {booking.id}
              </span>
            </div>
            <Badge
              variant={statusStyles[booking.status]?.variant || "secondary"}
              className="text-[10px]"
            >
              {statusStyles[booking.status]?.label || booking.status}
            </Badge>
          </div>
          <Separator />
          <div className="rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="w-px h-6 bg-border" />
                <div className="h-2 w-2 rounded-full bg-destructive" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Pickup</p>
                  <p className="text-xs font-medium">{booking.from}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Dropoff</p>
                  <p className="text-xs font-medium">{booking.to}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" /> Rider
              </Label>
              <span className="text-xs">{booking.rider}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Driver
              </Label>
              <span className="text-xs">{booking.driver || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3 w-3" /> Fare
              </Label>
              <span className="text-xs font-medium">{booking.fare}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Date
              </Label>
              <span className="text-xs">{booking.date}</span>
            </div>
          </div>
        </div>
        <DrawerFooter>
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
