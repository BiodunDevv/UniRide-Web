import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Interfaces
interface Overview {
  total_users: number;
  active_users: number;
  flagged_users: number;
  new_users_this_period: number;
  user_growth_percentage: number;
  total_drivers: number;
  active_drivers: number;
  inactive_drivers: number;
  flagged_drivers: number;
  new_drivers_this_period: number;
  driver_growth_percentage: number;
  total_rides: number;
  completed_rides: number;
  cancelled_rides: number;
  in_progress_rides: number;
  ride_completion_rate: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  active_bookings: number;
  booking_growth_percentage: number;
  total_revenue: number;
  revenue_growth_percentage: number;
  avg_revenue_per_day: number;
  total_seats_booked: number;
  total_seat_revenue: number;
  avg_fare_per_seat: number;
  pending_applications: number;
  total_admins: number;
  super_admins: number;
  unread_notifications: number;
  average_rating: number;
  total_rated_rides: number;
  total_locations: number;
  active_locations: number;
  popular_locations: number;
  check_in_rate: number;
}

interface ChartDataItem {
  date?: string;
  users?: number;
  status?: string;
  count?: number;
  month?: string;
  revenue?: number;
  rides?: number;
  method?: string;
  source?: string;
  rating?: number;
  priority?: string;
  category?: string;
  type?: string;
}

interface PeakHourItem {
  hour: number;
  rides: number;
}

interface TopRouteItem {
  pickup_name: string;
  dropoff_name: string;
  count: number;
}

interface SupportTickets {
  total: number;
  open: number;
  closed: number;
  by_priority: Array<{ priority: string; count: number }>;
  by_category: Array<{ category: string; count: number }>;
}

interface Notifications {
  unread: number;
  by_type: Array<{ type: string; count: number }>;
}

interface DriverApplications {
  pending: number;
  approved_this_period: number;
  rejected_this_period: number;
  approval_rate: number;
}

interface PeriodInfo {
  period: string;
  start_date: string;
  end_date: string;
  days: number;
}

export interface DashboardData {
  overview: Overview;
  user_growth_chart: ChartDataItem[];
  rides_per_day_chart: ChartDataItem[];
  ride_status_chart: ChartDataItem[];
  booking_status_chart: ChartDataItem[];
  revenue_chart: ChartDataItem[];
  application_status_chart: ChartDataItem[];
  payment_method_chart: ChartDataItem[];
  fare_source_chart: ChartDataItem[];
  rating_distribution_chart: ChartDataItem[];
  peak_hours_chart: PeakHourItem[];
  top_routes: TopRouteItem[];
  support_tickets: SupportTickets;
  notifications: Notifications;
  driver_applications: DriverApplications;
  period_info: PeriodInfo;
}

interface DashboardState {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  currentPeriod: "7days" | "30days" | "90days" | "year" | "all";

  // Actions
  getDashboardData: (period?: string) => Promise<void>;
  setPeriod: (period: "7days" | "30days" | "90days" | "year" | "all") => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboardData: null,
  isLoading: false,
  error: null,
  currentPeriod: "30days",

  getDashboardData: async (period?: string) => {
    const selectedPeriod = period || get().currentPeriod;
    set({ isLoading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/api/admin/dashboard?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      set({
        dashboardData: result.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  setPeriod: (period) => {
    set({ currentPeriod: period });
    get().getDashboardData(period);
  },

  clearError: () => set({ error: null }),
}));
