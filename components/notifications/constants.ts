import {
  Bell,
  AlertCircle,
  UserCheck,
  MessageSquare,
  DollarSign,
  Car,
} from "lucide-react";

export const TYPE_ICONS: Record<string, React.ElementType> = {
  application: UserCheck,
  payment: DollarSign,
  support: MessageSquare,
  driver: Car,
  user: Bell,
  system: AlertCircle,
};

export const TYPE_LABELS: Record<string, string> = {
  application: "Application",
  payment: "Payment",
  support: "Support",
  driver: "Driver",
  user: "User",
  system: "System",
};

export const FILTER_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Unread", value: false },
  { label: "Read", value: true },
] as const;
