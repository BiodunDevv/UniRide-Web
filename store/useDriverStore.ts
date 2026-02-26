import { create } from "zustand";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DriverApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_model: string;
  plate_number: string;
  drivers_license: string;
  vehicle_image?: string;
  vehicle_color?: string;
  vehicle_description?: string;
  available_seats: number;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface DriverState {
  application: DriverApplication | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  applyAsDriver: (data: {
    name: string;
    email: string;
    phone: string;
    vehicle_model: string;
    plate_number: string;
    drivers_license: string;
    available_seats?: number;
    vehicle_image?: string;
    vehicle_color?: string;
    vehicle_description?: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useDriverStore = create<DriverState>()((set) => ({
  application: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  applyAsDriver: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/driver/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.message || "Failed to submit application";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success("Application submitted successfully!");
      set({
        application: responseData.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit application";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
}));
