"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Loader2, Edit2 } from "lucide-react";

interface UpdateAdminRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminName: string;
  currentRole: string;
  onSubmit: (role: "admin" | "super_admin") => Promise<void>;
  isLoading?: boolean;
}

export function UpdateAdminRoleModal({
  open,
  onOpenChange,
  adminName,
  currentRole,
  onSubmit,
  isLoading = false,
}: UpdateAdminRoleModalProps) {
  const [role, setRole] = useState<"admin" | "super_admin">(
    currentRole as "admin" | "super_admin",
  );

  const handleSubmit = async () => {
    await onSubmit(role);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-sm flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Update Admin Role
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs">
            Change role for <strong>{adminName}</strong>
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-3 px-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="update-role" className="text-xs">
                Select New Role
              </Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "admin" | "super_admin")}
              >
                <SelectTrigger id="update-role" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="text-xs">
                    Admin
                  </SelectItem>
                  <SelectItem value="super_admin" className="text-xs">
                    Super Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 pb-4 pt-2 shrink-0 border-t">
          <Button
            size="sm"
            className="text-xs w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Role"
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
