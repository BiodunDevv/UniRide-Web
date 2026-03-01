import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DriverApplication {
  _id: string;
  name: string;
  email: string;
  user_id?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    email_verified: boolean;
    createdAt: string;
  };
  phone: string;
  vehicle_model: string;
  plate_number: string;
  available_seats: number;
  drivers_license: string;
  vehicle_image?: string;
  vehicle_color?: string;
  vehicle_description?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  reviewed_at?: string;
  submitted_at: string;
  rejection_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    email_verified: boolean;
    createdAt: string;
    is_flagged: boolean;
    profile_picture?: string;
  };
  phone: string;
  vehicle_model: string;
  plate_number: string;
  available_seats: number;
  drivers_license: string;
  vehicle_image?: string;
  vehicle_color?: string;
  vehicle_description?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  license_last_updated?: string;
  application_status: string;
  status: string;
  approved_by?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  approval_date?: string;
  rating: number;
  total_ratings: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface FarePolicy {
  _id: string;
  mode: "admin" | "driver" | "distance_auto";
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  updated_by?: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_flagged: boolean;
  profile_picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  is_flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastMessage {
  _id: string;
  title: string;
  message: string;
  target_audience: "all" | "users" | "drivers" | "admins";
  notification_type: "push" | "email" | "both";
  status: "sending" | "completed" | "failed";
  sent_by: string;
  sent_by_name: string;
  total_recipients: number;
  successful_sends: number;
  failed_sends: number;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRide {
  _id: string;
  created_by: any;
  driver_id: any;
  pickup_location_id: any;
  destination_id: any;
  fare: number;
  fare_policy_source: "admin" | "driver" | "distance_auto";
  departure_time: string;
  available_seats: number;
  booked_seats: number;
  status:
    | "scheduled"
    | "available"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled";
  check_in_code: string;
  distance_meters?: number;
  duration_seconds?: number;
  ended_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooking {
  _id: string;
  ride_id: any;
  user_id: any;
  seats_requested: number;
  total_fare: number;
  payment_method: "cash" | "transfer";
  payment_status: "pending" | "paid" | "not_applicable";
  booking_time: string;
  check_in_status: "not_checked_in" | "checked_in";
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "in_progress"
    | "completed"
    | "cancelled";
  rating?: number;
  feedback?: string;
  admin_note?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  applications: DriverApplication[];
  drivers: Driver[];
  users: User[];
  admins: Admin[];
  farePolicy: FarePolicy | null;
  broadcasts: BroadcastMessage[];
  rides: AdminRide[];
  ridesTotalCount: number;
  bookings: AdminBooking[];
  bookingsTotalCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  createAdmin: (name: string, email: string, password: string) => Promise<void>;
  getPendingApplications: () => Promise<void>;
  getAllApplications: (status?: string) => Promise<void>;
  getApplicationDetails: (id: string) => Promise<DriverApplication>;
  approveDriver: (id: string) => Promise<void>;
  rejectDriver: (id: string, rejection_reason: string) => Promise<void>;
  getAllDrivers: () => Promise<void>;
  getDriverById: (id: string) => Promise<Driver>;
  getAllUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  getAllAdmins: () => Promise<void>;
  getAdminById: (id: string) => Promise<Admin>;
  updateAdmin: (id: string, role: "admin" | "super_admin") => Promise<void>;
  deleteAdmin: (id: string, force?: boolean) => Promise<void>;
  deleteUser: (id: string, force?: boolean) => Promise<void>;
  deleteDriver: (id: string, force?: boolean) => Promise<void>;
  getFarePolicy: () => Promise<void>;
  updateFarePolicy: (policy: Partial<FarePolicy>) => Promise<void>;
  adminUpdateDriver: (id: string, updates: Partial<Driver>) => Promise<void>;
  resetDriverLicense: (id: string) => Promise<void>;
  flagUser: (id: string, is_flagged: boolean) => Promise<void>;
  sendBroadcastMessage: (
    title: string,
    message: string,
    target_audience: "all" | "users" | "drivers" | "admins",
    notification_type?: "push" | "email" | "both",
  ) => Promise<void>;
  getBroadcastHistory: (limit?: number) => Promise<void>;
  // Rides
  getAllRides: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  updateRide: (id: string, updates: Record<string, any>) => Promise<void>;
  cancelRide: (id: string) => Promise<void>;
  // Bookings
  getAllBookings: (params?: {
    status?: string;
    ride_id?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  acceptBooking: (id: string, admin_note?: string) => Promise<void>;
  declineBooking: (id: string, admin_note?: string) => Promise<void>;
  // History
  getDriverRideHistory: (driverId: string) => Promise<AdminRide[]>;
  getUserBookingHistory: (userId: string) => Promise<AdminBooking[]>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  applications: [],
  drivers: [],
  users: [],
  admins: [],
  farePolicy: null,
  broadcasts: [],
  rides: [],
  ridesTotalCount: 0,
  bookings: [],
  bookingsTotalCount: 0,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  createAdmin: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create admin");
      }

      toast.success("Admin created successfully!");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getPendingApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/drivers/pending`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      set({
        applications: data.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getAllApplications: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const url = status
        ? `${API_URL}/api/admin/drivers/all?status=${status}`
        : `${API_URL}/api/admin/drivers/all`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      set({
        applications: data.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getApplicationDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/drivers/application/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch application details");
      }

      set({ isLoading: false, error: null });
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  approveDriver: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/drivers/approve/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve driver");
      }

      toast.success("Driver approved successfully!");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  rejectDriver: async (id: string, rejection_reason: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/drivers/reject/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejection_reason }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject driver");
      }

      toast.success("Driver application rejected");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getAllDrivers: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/drivers/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch drivers");
      }

      set({
        drivers: data.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getDriverById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/drivers/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch driver details");
      }

      set({ isLoading: false, error: null });
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getAllUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      set({
        users: data.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user details");
      }

      set({ isLoading: false, error: null });
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getAllAdmins: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admins");
      }

      set({
        admins: data.data,
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
      throw error;
    }
  },

  getAdminById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin details");
      }

      set({ isLoading: false, error: null });
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  updateAdmin: async (id: string, role: "admin" | "super_admin") => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update admin");
      }

      toast.success("Admin role updated successfully");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAdmin: async (id: string, force = false) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const url = force
        ? `${API_URL}/api/admin/delete/${id}?force=true`
        : `${API_URL}/api/admin/delete/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete admin");
      }

      toast.success(
        force ? "Admin deleted permanently" : "Admin flagged successfully",
      );
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id: string, force = false) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const url = force
        ? `${API_URL}/api/admin/users/delete/${id}?force=true`
        : `${API_URL}/api/admin/users/delete/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      toast.success(
        force ? "User deleted permanently" : "User flagged successfully",
      );
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDriver: async (id: string, force = false) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const url = force
        ? `${API_URL}/api/admin/drivers/delete/${id}?force=true`
        : `${API_URL}/api/admin/drivers/delete/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete driver");
      }

      toast.success(
        force ? "Driver deleted permanently" : "Driver flagged successfully",
      );
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getFarePolicy: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/fare-policy`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch fare policy");
      }

      set({
        farePolicy: data.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  updateFarePolicy: async (policy: Partial<FarePolicy>) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/fare-policy`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policy),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update fare policy");
      }

      toast.success("Fare policy updated successfully");
      set({
        farePolicy: data.data,
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
      throw error;
    }
  },

  adminUpdateDriver: async (id: string, updates: Partial<Driver>) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/drivers/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update driver");
      }

      toast.success("Driver updated successfully");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resetDriverLicense: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/drivers/reset-license/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset license");
      }

      toast.success("Driver license restriction reset successfully");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  flagUser: async (id: string, is_flagged: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/users/flag/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_flagged }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to flag user");
      }

      toast.success(
        is_flagged
          ? "User flagged successfully"
          : "User unflagged successfully",
      );
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  sendBroadcastMessage: async (
    title: string,
    message: string,
    target_audience: "all" | "users" | "drivers" | "admins",
    notification_type: "push" | "email" | "both" = "both",
  ) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          target_audience,
          notification_type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send broadcast message");
      }

      toast.success("Broadcast message sent successfully!");
      set({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getBroadcastHistory: async (limit: number = 20) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/broadcasts?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch broadcast history");
      }

      set({
        broadcasts: data.data,
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
      throw error;
    }
  },

  // ── Rides Management ──────────────────────────────────────────────
  getAllRides: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));

      const response = await fetch(`${API_URL}/api/rides/all?${qs}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch rides");

      set({
        rides: data.data || [],
        ridesTotalCount: data.total || 0,
        isLoading: false,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      set({ error: msg, isLoading: false });
    }
  },

  updateRide: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/rides/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update ride");

      toast.success("Ride updated successfully");
      set({ isLoading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  cancelRide: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/rides/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to cancel ride");

      toast.success("Ride cancelled successfully");
      set({ isLoading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // ── Bookings Management ───────────────────────────────────────────
  getAllBookings: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.ride_id) qs.set("ride_id", params.ride_id);
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));

      const response = await fetch(`${API_URL}/api/booking/all?${qs}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch bookings");

      set({
        bookings: data.data || [],
        bookingsTotalCount: data.total || 0,
        isLoading: false,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      set({ error: msg, isLoading: false });
    }
  },

  acceptBooking: async (id, admin_note) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/booking/accept/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_note }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to accept booking");

      toast.success("Booking accepted");
      set({ isLoading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  declineBooking: async (id, admin_note) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/booking/decline/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_note }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to decline booking");

      toast.success("Booking declined");
      set({ isLoading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error(msg);
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // ── History ─────────────────────────────────────────────────────────
  getDriverRideHistory: async (driverId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const qs = new URLSearchParams({ driver_id: driverId, limit: "50" });
      const response = await fetch(`${API_URL}/api/rides/all?${qs}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch ride history");
      return (data.data || []) as AdminRide[];
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error(msg);
      return [];
    }
  },

  getUserBookingHistory: async (userId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const qs = new URLSearchParams({ user_id: userId, limit: "50" });
      const response = await fetch(`${API_URL}/api/booking/all?${qs}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch booking history");
      return (data.data || []) as AdminBooking[];
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error(msg);
      return [];
    }
  },
}));
