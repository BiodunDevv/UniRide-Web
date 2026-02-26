"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminStore } from "@/store/useAdminStore";
import type { User } from "@/store/useAdminStore";
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
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Flag,
  FlagOff,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/shared/profile-avatar";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getUserById, flagUser, deleteUser } = useAdminStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [flagLoading, setFlagLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getUserById(id);
      setUser(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch user";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleFlag = async () => {
    if (!user) return;
    setFlagLoading(true);
    try {
      const newFlagState = !user.is_flagged;
      await flagUser(user._id, newFlagState);
      const updated = await getUserById(id);
      setUser(updated);
      toast.success(
        newFlagState
          ? "User account has been flagged"
          : "User account has been unflagged",
      );
    } catch {
      toast.error("Failed to update user flag status");
    } finally {
      setFlagLoading(false);
    }
  };

  const handleDelete = async (forceDelete: boolean) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await deleteUser(user._id, forceDelete);
      setShowDeleteModal(false);
      router.push("/dashboard/users");
    } catch {
      toast.error("Failed to delete user");
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

  if (error || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {error || "User not found"}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={user.profile_picture}
              name={user.name}
              size="md"
            />
            <div>
              <h1 className="text-base font-semibold leading-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={!user.is_flagged ? "outline" : "destructive"}
                  className="text-[10px] capitalize"
                >
                  {user.is_flagged ? "Flagged" : "Active"}
                </Badge>
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={user.is_flagged ? "outline" : "secondary"}
            className={`text-xs ${
              user.is_flagged
                ? "border-green-200 text-green-700 hover:bg-green-50"
                : "text-amber-700 hover:bg-amber-50"
            }`}
            onClick={handleFlag}
            disabled={flagLoading}
          >
            {flagLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : user.is_flagged ? (
              <FlagOff className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <Flag className="h-3.5 w-3.5 mr-1.5" />
            )}
            {user.is_flagged ? "Unflag User" : "Flag User"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status banner */}
      {user.is_flagged && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Flag className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              This user&apos;s account is flagged
            </p>
            <p className="text-xs text-muted-foreground">
              The user cannot sign in until their account is unflagged.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50 text-xs shrink-0"
            onClick={handleFlag}
            disabled={flagLoading}
          >
            {flagLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            )}
            Unflag Account
          </Button>
        </div>
      )}

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription className="text-xs">
              User profile and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" /> Name
              </span>
              <span className="text-xs font-medium">{user.name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </span>
              <span className="text-xs">{user.email}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Role
              </span>
              <Badge variant="secondary" className="text-[10px] capitalize">
                {user.role}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Joined
              </span>
              <span className="text-xs">
                {new Date(user.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Last Updated
              </span>
              <span className="text-xs">
                {new Date(user.updatedAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status & Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Status & Security
            </CardTitle>
            <CardDescription className="text-xs">
              Account status and security information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Account Status
              </span>
              <Badge
                variant={!user.is_flagged ? "outline" : "destructive"}
                className="text-[10px]"
              >
                <span className="flex items-center gap-1">
                  {user.is_flagged ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {user.is_flagged ? "Flagged" : "Active"}
                </span>
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Role Type</span>
              <span className="text-xs capitalize font-medium">
                {user.role}
              </span>
            </div>
            <Separator />

            {/* Quick Actions */}
            <div className="pt-3 space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </p>
              <Button
                size="sm"
                variant={user.is_flagged ? "default" : "secondary"}
                className="text-xs w-full"
                onClick={handleFlag}
                disabled={flagLoading}
              >
                {flagLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : user.is_flagged ? (
                  <FlagOff className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <Flag className="h-3.5 w-3.5 mr-1.5" />
                )}
                {user.is_flagged
                  ? "Unflag User — Restore Access"
                  : "Flag User — Restrict Access"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs w-full"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete User Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete User"
        entityName={user.name}
        entityType="user"
        onConfirm={handleDelete}
        isLoading={actionLoading}
        showForceOption
      />
    </div>
  );
}
