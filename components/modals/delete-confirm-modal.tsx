"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityName: string;
  entityType: string;
  onConfirm: (forceDelete: boolean) => Promise<void>;
  isLoading?: boolean;
  showForceOption?: boolean;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  entityName,
  entityType,
  onConfirm,
  isLoading = false,
  showForceOption = true,
}: DeleteConfirmModalProps) {
  const [forceDelete, setForceDelete] = useState(false);

  const handleConfirm = async () => {
    await onConfirm(forceDelete);
    setForceDelete(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-sm flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {title}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs">
            Are you sure you want to delete <strong>{entityName}</strong>? This
            action cannot be easily undone.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-4 py-2">
            {showForceOption && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-delete"
                  checked={forceDelete}
                  onCheckedChange={(checked) =>
                    setForceDelete(checked === true)
                  }
                />
                <Label htmlFor="force-delete" className="text-xs">
                  Permanent delete (otherwise, {entityType} will be flagged)
                </Label>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 px-4 pb-4 pt-2 shrink-0 border-t sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs w-full sm:w-auto"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs w-full sm:w-auto"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
