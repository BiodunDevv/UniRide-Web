"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Tag } from "lucide-react";

interface UpdatePriorityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPriority: string;
  isLoading: boolean;
  onSubmit: (priority: string) => Promise<void>;
}

export function UpdatePriorityDialog({
  open,
  onOpenChange,
  currentPriority,
  isLoading,
  onSubmit,
}: UpdatePriorityDialogProps) {
  const [priority, setPriority] = useState(currentPriority);

  const handleSubmit = async () => {
    if (!priority) return;
    await onSubmit(priority);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Update Priority
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Change the priority level for this support ticket.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-1">
          <Label className="text-xs">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low" className="text-xs">
                Low
              </SelectItem>
              <SelectItem value="medium" className="text-xs">
                Medium
              </SelectItem>
              <SelectItem value="high" className="text-xs">
                High
              </SelectItem>
              <SelectItem value="urgent" className="text-xs">
                Urgent
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs" disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="text-xs"
            onClick={handleSubmit}
            disabled={!priority || isLoading}
          >
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            )}
            Update
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
