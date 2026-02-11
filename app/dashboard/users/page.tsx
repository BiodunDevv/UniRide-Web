"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UsersTable } from "@/components/tables/users-table";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { Users, Search, Loader2, Flag } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import type { User } from "@/store/useAdminStore";

export default function UsersPage() {
  const { users, isLoading, getAllUsers, flagUser, deleteUser } =
    useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    setActionLoading(true);
    try {
      await flagUser(user._id, !user.is_flagged);
      await getAllUsers();
    } finally {
      setActionLoading(false);
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
      <div>
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-xs text-muted-foreground">
          Manage registered riders and passengers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold">{users.length}</p>
                <p className="text-[10px] text-muted-foreground">Total Users</p>
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
                  {users.filter((u) => !u.is_flagged).length}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Active Users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-bold">
                  {users.filter((u) => u.is_flagged).length}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Flagged Users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UsersTable
              users={filteredUsers}
              onFlag={handleFlagUser}
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
