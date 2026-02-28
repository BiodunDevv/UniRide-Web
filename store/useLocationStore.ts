import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CampusLocation {
  _id: string;
  name: string;
  short_name?: string;
  category:
    | "academic"
    | "hostel"
    | "cafeteria"
    | "admin_building"
    | "religious"
    | "library"
    | "market"
    | "other";
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  is_popular: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationInput {
  name: string;
  short_name?: string;
  category: CampusLocation["category"];
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  is_active?: boolean;
  is_popular?: boolean;
  order?: number;
}

interface LocationState {
  locations: CampusLocation[];
  isLoading: boolean;
  error: string | null;

  getLocations: () => Promise<void>;
  createLocation: (data: LocationInput) => Promise<void>;
  updateLocation: (id: string, data: Partial<LocationInput>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  toggleActive: (id: string, is_active: boolean) => Promise<void>;
  togglePopular: (id: string, is_popular: boolean) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,

  getLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_URL}/api/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch locations");
      set({ locations: data.data || data.locations || data, isLoading: false });
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch locations");
      set({ error: err.message, isLoading: false });
    }
  },

  createLocation: async (input: LocationInput) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const body = {
        name: input.name,
        short_name: input.short_name,
        category: input.category,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        description: input.description,
        is_active: input.is_active ?? true,
        is_popular: input.is_popular ?? false,
        order: input.order ?? 0,
      };
      const res = await fetch(`${API_URL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create location");
      toast.success("Location created successfully");
      await get().getLocations();
    } catch (err: any) {
      toast.error(err.message || "Failed to create location");
      set({ error: err.message, isLoading: false });
    }
  },

  updateLocation: async (id: string, input: Partial<LocationInput>) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const body: any = { ...input };
      // No need to transform - backend accepts latitude/longitude directly
      const res = await fetch(`${API_URL}/api/locations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update location");
      toast.success("Location updated successfully");
      await get().getLocations();
    } catch (err: any) {
      toast.error(err.message || "Failed to update location");
      set({ error: err.message, isLoading: false });
    }
  },

  deleteLocation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_URL}/api/locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete location");
      }
      toast.success("Location deleted successfully");
      await get().getLocations();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete location");
      set({ error: err.message, isLoading: false });
    }
  },

  toggleActive: async (id: string, is_active: boolean) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_URL}/api/locations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Location ${is_active ? "activated" : "deactivated"}`);
      await get().getLocations();
    } catch (err: any) {
      toast.error(err.message);
    }
  },

  togglePopular: async (id: string, is_popular: boolean) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_URL}/api/locations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_popular }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(
        `Location ${is_popular ? "marked as popular" : "unmarked as popular"}`,
      );
      await get().getLocations();
    } catch (err: any) {
      toast.error(err.message);
    }
  },
}));
