"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAdminStore } from "@/store/useAdminStore";
import type { Driver } from "@/store/useAdminStore";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/shared";
import {
  ArrowLeft,
  Mail,
  Phone,
  Car,
  Star,
  Calendar,
  Users,
  Hash,
  ShieldCheck,
  FileText,
  AlertCircle,
  Trash2,
  CheckCircle,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

export default function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getDriverById, deleteDriver } = useAdminStore();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        const data = await getDriverById(id);
        setDriver(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch driver";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id, getDriverById]);

  const handleDelete = async (forceDelete: boolean) => {
    if (!driver) return;
    setActionLoading(true);
    try {
      await deleteDriver(driver._id, forceDelete);
      setShowDeleteModal(false);
      router.push("/dashboard/drivers");
    } catch {
      toast.error("Failed to delete driver");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <LoadingState />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {error || "Driver not found"}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/drivers">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Drivers
          </Link>
        </Button>
      </div>
    );
  }

  const ratingPercentage = driver.rating ? (driver.rating / 5) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/drivers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                {driver.user_id?.name ?? "Unknown Driver"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={
                    driver.status === "active" ? "outline" : "destructive"
                  }
                  className="text-[10px] capitalize"
                >
                  {driver.status}
                </Badge>
                {driver.user_id?.is_flagged && (
                  <Badge variant="destructive" className="text-[10px]">
                    <Flag className="h-2.5 w-2.5 mr-1" />
                    Flagged
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Driver
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">
                {driver.rating?.toFixed(1) ?? "N/A"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold">{driver.total_ratings}</span>
            <p className="text-[10px] text-muted-foreground mt-1">
              Total Ratings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold">{driver.available_seats}</span>
            <p className="text-[10px] text-muted-foreground mt-1">
              Available Seats
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold capitalize">
              {driver.application_status}
            </span>
            <p className="text-[10px] text-muted-foreground mt-1">
              App. Status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Name
              </span>
              <span className="text-xs font-medium">
                {driver.user_id?.name ?? "Unknown"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </span>
              <span className="text-xs">{driver.user_id?.email ?? "N/A"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone
              </span>
              <span className="text-xs">
                {driver.phone || driver.user_id?.phone || "N/A"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Role
              </span>
              <Badge variant="secondary" className="text-[10px] capitalize">
                {driver.user_id?.role ?? "N/A"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Verified
              </span>
              <Badge
                variant={
                  driver.user_id?.email_verified ? "default" : "secondary"
                }
                className="text-[10px]"
              >
                {driver.user_id?.email_verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Joined
              </span>
              <span className="text-xs">
                {driver.user_id?.createdAt
                  ? new Date(driver.user_id.createdAt).toLocaleDateString(
                      "en-NG",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3 w-3" /> Model
              </span>
              <span className="text-xs font-medium">
                {driver.vehicle_model}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Plate Number
              </span>
              <span className="text-xs font-mono font-medium">
                {driver.plate_number}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Available Seats
              </span>
              <span className="text-xs font-medium">
                {driver.available_seats}
              </span>
            </div>
            <Separator />
            {/* Rating bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Rating Overview
                </span>
                <span className="text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {driver.rating?.toFixed(1) ?? "0.0"} / 5.0
                </span>
              </div>
              <div className="h-2 w-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${ratingPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Based on {driver.total_ratings} rating
                {driver.total_ratings !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Approval & Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Approval & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Driver Status
              </span>
              <Badge
                variant={driver.status === "active" ? "outline" : "destructive"}
                className="text-[10px] capitalize"
              >
                {driver.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Application Status
              </span>
              <Badge
                variant={
                  driver.application_status === "approved"
                    ? "default"
                    : "secondary"
                }
                className="text-[10px] capitalize"
              >
                {driver.application_status}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Account Flagged
              </span>
              <Badge
                variant={driver.user_id?.is_flagged ? "destructive" : "outline"}
                className="text-[10px]"
              >
                {driver.user_id?.is_flagged ? "Yes" : "No"}
              </Badge>
            </div>

            {driver.approved_by && (
              <>
                <Separator />
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Approved By
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Name</span>
                    <span className="text-xs font-medium">
                      {driver.approved_by.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <span className="text-xs">{driver.approved_by.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Role</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] capitalize"
                    >
                      {driver.approved_by.role?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {driver.approval_date && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Approval Date
                  </span>
                  <span className="text-xs">
                    {new Date(driver.approval_date).toLocaleDateString(
                      "en-NG",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Created
              </span>
              <span className="text-xs">
                {new Date(driver.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver's License */}
      {driver.drivers_license && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Driver&apos;s License
            </CardTitle>
            <CardDescription className="text-xs">
              Uploaded license document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-md aspect-[3/2] border bg-muted/30 overflow-hidden">
              <Image
                src={driver.drivers_license}
                alt="Driver's License"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Driver"
        entityName={driver.user_id?.name ?? "this driver"}
        entityType="driver"
        onConfirm={handleDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}
