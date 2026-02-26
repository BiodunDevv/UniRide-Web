/**
 * Professional driver status labels and styling
 * Maps internal status values to user-facing labels
 */

export type DriverStatusKey = "active" | "inactive" | "suspended" | string;

export interface DriverStatusConfig {
  /** User-facing label */
  label: string;
  /** Badge variant for shadcn Badge component */
  variant: "default" | "secondary" | "destructive" | "outline";
  /** Additional className for custom styling */
  className: string;
  /** Dot color for status indicators */
  dotColor: string;
}

const statusMap: Record<string, DriverStatusConfig> = {
  active: {
    label: "On Duty",
    variant: "outline",
    className:
      "text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950",
    dotColor: "bg-green-500",
  },
  inactive: {
    label: "Off Duty",
    variant: "secondary",
    className: "text-muted-foreground",
    dotColor: "bg-gray-400",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive",
    className: "",
    dotColor: "bg-red-500",
  },
};

/**
 * Get professional status config for a driver status value
 */
export function getDriverStatus(status: DriverStatusKey): DriverStatusConfig {
  return (
    statusMap[status] ?? {
      label: status,
      variant: "secondary" as const,
      className: "",
      dotColor: "bg-gray-400",
    }
  );
}

/**
 * Get the display label for a status value (for use in edit forms)
 */
export function getDriverStatusLabel(status: DriverStatusKey): string {
  return getDriverStatus(status).label;
}
