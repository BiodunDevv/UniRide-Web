"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminStore } from "@/store/useAdminStore";
import type { Driver, AdminRide } from "@/store/useAdminStore";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Palette,
  ImageIcon,
  Info,
  Pencil,
  RotateCcw,
  Banknote,
  CreditCard,
  Building2,
  MapPin,
  Navigation,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  ProfileAvatar,
  ImagePreview,
} from "@/components/shared/profile-avatar";
import { getDriverStatus } from "@/lib/utils/driver-status";

export default function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    getDriverById,
    deleteDriver,
    flagUser,
    adminUpdateDriver,
    resetDriverLicense,
    getDriverRideHistory,
  } = useAdminStore();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [resetLicenseLoading, setResetLicenseLoading] = useState(false);
  const [rideHistory, setRideHistory] = useState<AdminRide[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: "",
    vehicle_model: "",
    plate_number: "",
    available_seats: "",
    vehicle_color: "",
    vehicle_description: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
    status: "",
  });

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

  // Fetch ride history when driver is loaded
  useEffect(() => {
    if (!driver?._id) return;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const rides = await getDriverRideHistory(driver._id);
        setRideHistory(rides);
      } catch {
        // silent fail
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [driver?._id, getDriverRideHistory]);

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

  const handleToggleFlag = async () => {
    if (!driver?.user_id?._id) return;
    setFlagLoading(true);
    try {
      const newFlagState = !driver.user_id.is_flagged;
      await flagUser(driver.user_id._id, newFlagState);
      const refreshed = await getDriverById(id);
      setDriver(refreshed);
      toast.success(
        newFlagState
          ? "Driver account has been flagged"
          : "Driver account has been unflagged",
      );
    } catch {
      toast.error("Failed to update flag status");
    } finally {
      setFlagLoading(false);
    }
  };

  const openEditModal = () => {
    if (!driver) return;
    setEditForm({
      phone: driver.phone || "",
      vehicle_model: driver.vehicle_model || "",
      plate_number: driver.plate_number || "",
      available_seats: String(driver.available_seats || 4),
      vehicle_color: driver.vehicle_color || "",
      vehicle_description: driver.vehicle_description || "",
      bank_name: driver.bank_name || "",
      bank_account_number: driver.bank_account_number || "",
      bank_account_name: driver.bank_account_name || "",
      status: driver.status || "active",
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!driver) return;
    setEditLoading(true);
    try {
      await adminUpdateDriver(driver._id, {
        ...editForm,
        available_seats: parseInt(editForm.available_seats) || 4,
      } as unknown as Partial<Driver>);
      const refreshed = await getDriverById(id);
      setDriver(refreshed);
      setShowEditModal(false);
    } catch {
      // toast handled in store
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetLicense = async () => {
    if (!driver) return;
    setResetLicenseLoading(true);
    try {
      await resetDriverLicense(driver._id);
      const refreshed = await getDriverById(id);
      setDriver(refreshed);
    } catch {
      // toast handled in store
    } finally {
      setResetLicenseLoading(false);
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
            <ProfileAvatar
              src={driver.user_id?.profile_picture}
              name={driver.user_id?.name ?? "Driver"}
              size="md"
            />
            <div>
              <h1 className="text-base font-semibold leading-tight">
                {driver.user_id?.name ?? "Driver Profile Pending"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {(() => {
                  const sc = getDriverStatus(driver.status);
                  return (
                    <Badge
                      variant={
                        sc.variant as
                          | "outline"
                          | "secondary"
                          | "destructive"
                          | "default"
                      }
                      className={`text-[10px] ${sc.className}`}
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${sc.dotColor}`}
                        />
                        {sc.label}
                      </span>
                    </Badge>
                  );
                })()}
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
            variant="outline"
            className="text-xs"
            onClick={openEditModal}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit Driver
          </Button>
          <Button
            size="sm"
            variant={driver.user_id?.is_flagged ? "outline" : "secondary"}
            className={`text-xs ${
              driver.user_id?.is_flagged
                ? "border-green-200 text-green-700 hover:bg-green-50"
                : "text-orange-700 hover:bg-orange-50"
            }`}
            onClick={handleToggleFlag}
            disabled={flagLoading}
          >
            {flagLoading ? (
              <span className="h-3.5 w-3.5 mr-1.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Flag className="h-3.5 w-3.5 mr-1.5" />
            )}
            {driver.user_id?.is_flagged ? "Unflag Driver" : "Flag Driver"}
          </Button>
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

      {/* Flagged banner */}
      {driver.user_id?.is_flagged && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Flag className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              This driver&apos;s account is flagged
            </p>
            <p className="text-xs text-muted-foreground">
              The driver cannot sign in until their account is unflagged.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50 text-xs shrink-0"
            onClick={handleToggleFlag}
            disabled={flagLoading}
          >
            {flagLoading ? (
              <span className="h-3.5 w-3.5 mr-1.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            )}
            Unflag Account
          </Button>
        </div>
      )}

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
                {driver.user_id?.name ?? "Driver Profile Pending"}
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
            {driver.vehicle_color && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Palette className="h-3 w-3" /> Color
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{
                        backgroundColor: driver.vehicle_color.toLowerCase(),
                      }}
                    />
                    <span className="text-xs font-medium">
                      {driver.vehicle_color}
                    </span>
                  </div>
                </div>
              </>
            )}
            {driver.vehicle_description && (
              <>
                <Separator />
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> Description
                  </span>
                  <p className="text-xs text-foreground leading-relaxed pl-4.5">
                    {driver.vehicle_description}
                  </p>
                </div>
              </>
            )}
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
              {(() => {
                const sc = getDriverStatus(driver.status);
                return (
                  <Badge
                    variant={
                      sc.variant as
                        | "outline"
                        | "secondary"
                        | "destructive"
                        | "default"
                    }
                    className={`text-[10px] ${sc.className}`}
                  >
                    <span className="flex items-center gap-1">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${sc.dotColor}`}
                      />
                      {sc.label}
                    </span>
                  </Badge>
                );
              })()}
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
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    driver.user_id?.is_flagged ? "destructive" : "outline"
                  }
                  className="text-[10px]"
                >
                  {driver.user_id?.is_flagged ? "Yes" : "No"}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-6 px-2 text-[10px] ${
                    driver.user_id?.is_flagged
                      ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                      : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  }`}
                  onClick={handleToggleFlag}
                  disabled={flagLoading}
                >
                  {driver.user_id?.is_flagged ? "Unflag" : "Flag"}
                </Button>
              </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Driver&apos;s License
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={handleResetLicense}
                disabled={resetLicenseLoading}
              >
                {resetLicenseLoading ? (
                  <span className="h-3 w-3 mr-1.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                )}
                Reset Update Restriction
              </Button>
            </div>
            <CardDescription className="text-xs">
              Uploaded license document
              {driver.license_last_updated && (
                <span className="ml-1">
                  · Last updated{" "}
                  {new Date(driver.license_last_updated).toLocaleDateString(
                    "en-NG",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImagePreview
              src={driver.drivers_license}
              alt="Driver's License"
              aspectRatio="aspect-[3/2]"
              className="max-w-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Vehicle Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            Vehicle Photo
          </CardTitle>
          <CardDescription className="text-xs">
            {driver.vehicle_image
              ? "Uploaded vehicle photo"
              : "No vehicle photo available"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driver.vehicle_image ? (
            <ImagePreview
              src={driver.vehicle_image}
              alt="Vehicle Photo"
              aspectRatio="aspect-video"
              className="max-w-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted bg-muted/20 max-w-lg">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Image Not Available
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                The driver did not upload a vehicle photo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      {(driver.bank_name || driver.bank_account_number) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              Bank Details
            </CardTitle>
            <CardDescription className="text-xs">
              Payment information for ride earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> Bank
              </span>
              <span className="text-xs font-medium">
                {driver.bank_name || "Not set"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" /> Account Number
              </span>
              <span className="text-xs font-mono font-medium">
                {driver.bank_account_number || "Not set"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Account Name
              </span>
              <span className="text-xs font-medium">
                {driver.bank_account_name || "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ride History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              Ride History
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {rideHistory.length} ride{rideHistory.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Recent rides created by this driver
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : rideHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Navigation className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No rides found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rideHistory.map((ride) => {
                const pickup =
                  typeof ride.pickup_location_id === "object" &&
                  ride.pickup_location_id
                    ? ride.pickup_location_id.name ||
                      ride.pickup_location_id.address ||
                      "Route point"
                    : "Route point";
                const dest =
                  typeof ride.destination_id === "object" && ride.destination_id
                    ? ride.destination_id.name ||
                      ride.destination_id.address ||
                      "Route point"
                    : "Route point";

                const statusStyles: Record<string, string> = {
                  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
                  available: "bg-cyan-50 text-cyan-700 border-cyan-200",
                  accepted: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
                  completed: "bg-green-50 text-green-700 border-green-200",
                  cancelled: "bg-red-50 text-red-700 border-red-200",
                };

                return (
                  <div
                    key={ride._id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Route visualization */}
                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-green-500/20" />
                      <div className="w-px h-6 bg-border" />
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                    </div>

                    {/* Route details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-green-600 shrink-0" />
                        <span className="text-xs truncate">{pickup}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-red-600 shrink-0" />
                        <span className="text-xs truncate">{dest}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(ride.departure_time).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" />
                          {ride.booked_seats}/{ride.available_seats} seats
                        </span>
                      </div>
                    </div>

                    {/* Fare + status */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs font-semibold">
                        ₦{ride.fare?.toLocaleString() ?? "0"}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${statusStyles[ride.status] || ""}`}
                      >
                        {ride.status?.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Driver Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Driver Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update driver information. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="e.g. +234 800 000 0000"
                className="text-sm"
              />
            </div>
            <Separator />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Vehicle
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Model</Label>
                <Input
                  value={editForm.vehicle_model}
                  onChange={(e) =>
                    setEditForm({ ...editForm, vehicle_model: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Plate Number</Label>
                <Input
                  value={editForm.plate_number}
                  onChange={(e) =>
                    setEditForm({ ...editForm, plate_number: e.target.value })
                  }
                  className="text-sm font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Color</Label>
                <Input
                  value={editForm.vehicle_color}
                  onChange={(e) =>
                    setEditForm({ ...editForm, vehicle_color: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Available Seats</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={editForm.available_seats}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      available_seats: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Description</Label>
              <Input
                value={editForm.vehicle_description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    vehicle_description: e.target.value,
                  })
                }
                placeholder="Brief vehicle description"
                className="text-sm"
              />
            </div>
            <Separator />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bank Details
            </p>
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Bank Name</Label>
              <Input
                value={editForm.bank_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, bank_name: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Account Number</Label>
                <Input
                  value={editForm.bank_account_number}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bank_account_number: e.target.value,
                    })
                  }
                  className="text-sm font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Account Name</Label>
                <Input
                  value={editForm.bank_account_name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      bank_account_name: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label className="text-xs font-medium">Status</Label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="active">On Duty</option>
                <option value="inactive">Off Duty</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditSave}
              disabled={editLoading}
              className="text-xs"
            >
              {editLoading ? (
                <span className="h-3.5 w-3.5 mr-1.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
