"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminsTable } from "@/components/tables/admins-table";
import { CreateAdminModal } from "@/components/modals/create-admin-modal";
import { UpdateAdminRoleModal } from "@/components/modals/update-admin-role-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Shield, Search, Plus, Users, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { Admin } from "@/store/useAdminStore";

export default function AdminsPage() {
  const {
    admins,
    isLoading,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Admin Management</h2>
          <p className="text-xs text-muted-foreground">
            Manage admin accounts and permissions
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="text-xs">Add Admin</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold">{admins.length}</p>
                <p className="text-[10px] text-muted-foreground">
                  Total Admins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-lg font-bold">
                  {admins.filter((a) => !a.is_flagged).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <div>
                <p className="text-lg font-bold">
                  {admins.filter((a) => a.role === "super_admin").length}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Super Admins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">
                  {admins.filter((a) => a.is_flagged).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && admins.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AdminsTable
              admins={filteredAdmins}
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
