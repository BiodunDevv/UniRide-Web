"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersTable } from "@/components/tables/users-table";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  LoadingState,
} from "@/components/shared";
import { Users, Flag } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { User } from "@/store/useAdminStore";

export default function UsersPage() {
  const { users, isLoading, getAllUsers, flagUser, deleteUser } =
    useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [users, searchQuery],
  );

  const handleFlagUser = async (user: User) => {
    setFlaggingId(user._id);
    try {
      await flagUser(user._id, !user.is_flagged);
      await getAllUsers();
    } finally {
      setFlaggingId(null);
    }
  };

  const handleDeleteUser = async (forceDelete: boolean) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser._id, forceDelete);
      setShowDeleteModal(false);
      setSelectedUser(null);
      await getAllUsers();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Users"
        description="Manage registered riders and passengers"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatsCard icon={Users} value={users.length} label="Total Users" />
        <StatsCard
          icon={Users}
          iconColor="text-green-500"
          value={users.filter((u) => !u.is_flagged).length}
          label="Active Users"
        />
        <StatsCard
          icon={Flag}
          iconColor="text-destructive"
          value={users.filter((u) => u.is_flagged).length}
          label="Flagged Users"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">All Users</CardTitle>
              <CardDescription className="text-xs">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && users.length === 0 ? (
            <LoadingState />
          ) : (
            <UsersTable
              users={filteredUsers}
              onFlag={handleFlagUser}
              flaggingId={flaggingId}
              onDelete={(user) => {
                setSelectedUser(user);
                setShowDeleteModal(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <DeleteConfirmModal
          open={showDeleteModal}
          onOpenChange={(open) => {
            setShowDeleteModal(open);
            if (!open) setSelectedUser(null);
          }}
          title="Delete User"
          entityName={selectedUser.name}
          entityType="user"
          onConfirm={handleDeleteUser}
          isLoading={actionLoading}
          showForceOption
        />
      )}
    </div>
  );
}
