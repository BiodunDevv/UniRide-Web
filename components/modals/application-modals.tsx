"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  UserCheck,
  Mail,
  Phone,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { DriverApplication } from "@/store/useAdminStore";

const statusColors: Record<string, string> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

interface ApplicationDetailDrawerProps {
  application: DriverApplication;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ApplicationDetailDrawer({
  application,
  onApprove,
  onReject,
}: ApplicationDetailDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left h-auto p-0 text-xs font-medium hover:underline"
        >
          {application.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm">Application Details</DrawerTitle>
          <DrawerDescription className="text-xs">
            Review driver application
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{application.name}</p>
              <Badge
                variant={
                  (statusColors[application.status] || "secondary") as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                }
                className="text-[10px] capitalize mt-1"
              >
                {application.status}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <span className="text-xs">{application.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <span className="text-xs">{application.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Vehicle Model
              </Label>
              <span className="text-xs">{application.vehicle_model}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Plate Number
              </Label>
              <span className="text-xs font-mono">
                {application.plate_number}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Available Seats
              </Label>
              <span className="text-xs">{application.available_seats}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Applied
              </Label>
              <span className="text-xs">
                {new Date(
                  application.submitted_at || application.createdAt,
                ).toLocaleDateString()}
              </span>
            </div>
            {application.rejection_reason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <Label className="text-xs text-destructive font-medium">
                  Rejection Reason
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {application.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>
        <DrawerFooter className="shrink-0 border-t">
          {application.status === "pending" && (
            <div className="flex gap-2 w-full">
              {onApprove && (
                <Button
                  size="sm"
                  className="text-xs flex-1"
                  onClick={onApprove}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs flex-1"
                  onClick={onReject}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Reject
                </Button>
              )}
            </div>
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

interface RejectApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName: string;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function RejectApplicationModal({
  open,
  onOpenChange,
  applicantName,
  onConfirm,
  isLoading = false,
}: RejectApplicationModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason);
    setReason("");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-sm text-destructive">
            Reject Application
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            Provide a reason for rejecting{" "}
            <strong>{applicantName}&apos;s</strong> application
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="reject-reason" className="text-xs">
              Rejection Reason
            </Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="text-xs min-h-[80px]"
              required
            />
          </div>
        </div>
        <DrawerFooter className="shrink-0 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="text-xs"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            Confirm Rejection
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
