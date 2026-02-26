"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAdminStore } from "@/store/useAdminStore";
import type { DriverApplication } from "@/store/useAdminStore";
import { RejectApplicationModal } from "@/components/modals/application-modals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/shared";
import {
  ArrowLeft,
  Mail,
  Phone,
  Car,
  Hash,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ShieldCheck,
  User,
  AlertCircle,
  Palette,
  ImageIcon,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
    label: string;
  }
> = {
  pending: { variant: "secondary", icon: Clock, label: "Pending Review" },
  approved: { variant: "default", icon: CheckCircle, label: "Approved" },
  rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
};

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getApplicationDetails, approveDriver, rejectDriver } =
    useAdminStore();

  const [application, setApplication] = useState<DriverApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getApplicationDetails(id);
        setApplication(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load application";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, getApplicationDetails]);

  const handleApprove = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      await approveDriver(application._id);
      const updated = await getApplicationDetails(id);
      setApplication(updated);
    } catch {
      // Toast already shown by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!application) return;
    setActionLoading(true);
    try {
      await rejectDriver(application._id, reason);
      setShowRejectModal(false);
      const updated = await getApplicationDetails(id);
      setApplication(updated);
    } catch {
      // Toast already shown by store
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <LoadingState />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {error || "Application not found"}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/driver-applications">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Applications
          </Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[application.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-8" asChild>
            <Link href="/dashboard/driver-applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-base font-semibold">Application Details</h1>
            <p className="text-xs text-muted-foreground">
              Reviewing {application.name}&apos;s application
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-xs gap-1 capitalize">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          {application.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="text-xs"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Applicant Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {application.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Applied{" "}
                  {new Date(
                    application.submitted_at || application.createdAt,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs truncate">{application.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs">{application.phone}</span>
              </div>
              {application.user_id && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Account Details
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Role
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {application.user_id.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Email Verified
                      </span>
                      <Badge
                        variant={
                          application.user_id.email_verified
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {application.user_id.email_verified ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Joined
                      </span>
                      <span className="text-xs">
                        {new Date(
                          application.user_id.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <Car className="h-3.5 w-3.5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Car className="h-3 w-3" /> Vehicle Model
                </span>
                <span className="text-xs font-medium">
                  {application.vehicle_model}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> Plate Number
                </span>
                <span className="text-xs font-mono font-medium">
                  {application.plate_number}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Available Seats
                </span>
                <span className="text-xs font-medium">
                  {application.available_seats}
                </span>
              </div>
              {application.vehicle_color && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Palette className="h-3 w-3" /> Vehicle Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-border"
                        style={{
                          backgroundColor:
                            application.vehicle_color.toLowerCase(),
                        }}
                      />
                      <span className="text-xs font-medium">
                        {application.vehicle_color}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {application.vehicle_description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="h-3 w-3" /> Vehicle Description
                    </span>
                    <p className="text-xs text-foreground leading-relaxed pl-4.5">
                      {application.vehicle_description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Review Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5 p-3 bg-muted/50 border">
              <StatusIcon
                className={`h-5 w-5 shrink-0 ${
                  application.status === "approved"
                    ? "text-green-600"
                    : application.status === "rejected"
                      ? "text-destructive"
                      : "text-yellow-500"
                }`}
              />
              <div>
                <p className="text-xs font-medium">{status.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {application.status === "pending"
                    ? "Awaiting admin review"
                    : application.status === "approved"
                      ? "This application has been approved"
                      : "This application has been rejected"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Submitted
                </span>
                <span className="text-xs">
                  {new Date(
                    application.submitted_at || application.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>

              {application.reviewed_by && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Reviewed By
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Name
                      </span>
                      <span className="text-xs font-medium">
                        {application.reviewed_by.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Email
                      </span>
                      <span className="text-xs truncate max-w-[140px]">
                        {application.reviewed_by.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Role
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {application.reviewed_by.role?.replace("_", " ")}
                      </Badge>
                    </div>
                    {application.reviewed_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Date
                        </span>
                        <span className="text-xs">
                          {new Date(
                            application.reviewed_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {application.rejection_reason && (
                <>
                  <Separator />
                  <div className="p-3 bg-destructive/5 border border-destructive/20 space-y-1">
                    <p className="text-xs font-medium text-destructive">
                      Rejection Reason
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {application.rejection_reason}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver's License */}
      {application.drivers_license && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Driver&apos;s License
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border overflow-hidden max-w-2xl">
              <Image
                src={application.drivers_license}
                alt="Driver's License"
                width={800}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            Vehicle Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {application.vehicle_image ? (
            <div className="border overflow-hidden max-w-2xl">
              <Image
                src={application.vehicle_image}
                alt="Vehicle Photo"
                width={800}
                height={500}
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted bg-muted/20 max-w-2xl">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Image Not Available
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                The applicant did not upload a vehicle photo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <RejectApplicationModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        applicantName={application.name}
        onConfirm={handleReject}
        isLoading={actionLoading}
      />
    </div>
  );
}
