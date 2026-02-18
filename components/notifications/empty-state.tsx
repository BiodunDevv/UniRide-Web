"use client";

import { BellOff } from "lucide-react";

interface EmptyStateProps {
  filtered: boolean;
}

export function EmptyState({ filtered }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <BellOff className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">No notifications</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {filtered
            ? "No notifications match this filter."
            : "You're all caught up!"}
        </p>
      </div>
    </div>
  );
}
