"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminsTable } from "@/components/tables/admins-table";
import { CreateAdminModal } from "@/components/modals/create-admin-modal";
import { UpdateAdminRoleModal } from "@/components/modals/update-admin-role-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  LoadingState,
} from "@/components/shared";
import { Shield, Plus, Users, Flag } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Admin } from "@/store/useAdminStore";

export default function AdminsPage() {
  const router = useRouter();
  const { user, getMe } = useAuthStore();

  // Guard: only super_admin can access this page
  useEffect(() => {
    const checkAccess = async () => {
      // Re-fetch latest user data to ensure role is current
      await getMe();
      const currentUser = useAuthStore.getState().user;
      if (!currentUser || currentUser.role.toLowerCase() !== "super_admin") {
        router.replace("/dashboard");
      }
    };
    checkAccess();
  }, [getMe, router]);

  // Don't render anything until we confirm the user is super_admin
  if (!user || user.role.toLowerCase() !== "super_admin") {
    return <LoadingState />;
  }
  const {
    admins,
    isLoading,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    flagUser,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);

  useEffect(() => {
    getAllAdmins();
  }, [getAllAdmins]);

  const filteredAdmins = useMemo(
    () =>
      admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [admins, searchQuery],
  );

  const handleFlagAdmin = async (admin: Admin) => {
    setFlaggingId(admin._id);
    try {
      await flagUser(admin._id, !admin.is_flagged);
      await getAllAdmins();
    } finally {
      setFlaggingId(null);
    }
  };

  const handleCreateAdmin = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setActionLoading(true);
    try {
      await createAdmin(data.name, data.email, data.password);
      setShowCreateModal(false);
      await getAllAdmins();
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (role: "admin" | "super_admin") => {
    if (!selectedAdmin) return;
    setActionLoading(true);
    try {
      await updateAdmin(selectedAdmin._id, role);
      setShowEditModal(false);
      setSelectedAdmin(null);
      await getAllAdmins();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (forceDelete: boolean) => {
    if (!selectedAdmin) return;
    setActionLoading(true);
    try {
      await deleteAdmin(selectedAdmin._id, forceDelete);
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      await getAllAdmins();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Admin Management"
        description="Manage admin accounts and permissions"
        actions={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Add Admin</span>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard icon={Shield} value={admins.length} label="Total Admins" />
        <StatsCard
          icon={Users}
          iconColor="text-green-500"
          value={admins.filter((a) => !a.is_flagged).length}
          label="Active"
        />
        <StatsCard
          icon={Shield}
          iconColor="text-accent"
          value={admins.filter((a) => a.role === "super_admin").length}
          label="Super Admins"
        />
        <StatsCard
          icon={Shield}
          iconColor="text-muted-foreground"
          value={admins.filter((a) => a.is_flagged).length}
          label="Flagged"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">All Admins</CardTitle>
              <CardDescription className="text-xs">
                {filteredAdmins.length} admin
                {filteredAdmins.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search admins..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && admins.length === 0 ? (
            <LoadingState />
          ) : (
            <AdminsTable
              admins={filteredAdmins}
              onFlag={handleFlagAdmin}
              flaggingId={flaggingId}
              onEdit={(admin) => {
                setSelectedAdmin(admin);
                setShowEditModal(true);
              }}
              onDelete={(admin) => {
                setSelectedAdmin(admin);
                setShowDeleteModal(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      <CreateAdminModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateAdmin}
        isLoading={actionLoading}
      />

      {selectedAdmin && (
        <>
          <UpdateAdminRoleModal
            open={showEditModal}
            onOpenChange={(open) => {
              setShowEditModal(open);
              if (!open) setSelectedAdmin(null);
            }}
            adminName={selectedAdmin.name}
            currentRole={selectedAdmin.role}
            onSubmit={handleUpdateRole}
            isLoading={actionLoading}
          />

          <DeleteConfirmModal
            open={showDeleteModal}
            onOpenChange={(open) => {
              setShowDeleteModal(open);
              if (!open) setSelectedAdmin(null);
            }}
            title="Delete Admin"
            entityName={selectedAdmin.name}
            entityType="admin"
            onConfirm={handleDeleteAdmin}
            isLoading={actionLoading}
            showForceOption
          />
        </>
      )}
    </div>
  );
}
