import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Device {
  device_id: string;
  device_name: string;
  device_type: "mobile" | "tablet" | "desktop" | "other";
  last_login: string;
  ip_address?: string;
}

interface DeviceState {
  devices: Device[];
  maxDevices: string | number;
  isLoading: boolean;
  error: string | null;

  // Actions
  getDevices: () => Promise<void>;
  removeDevice: (device_id: string) => Promise<void>;
  logoutAllDevices: (
    except_current?: boolean,
    current_device_id?: string
  ) => Promise<void>;
  clearError: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  maxDevices: 3,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  getDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/auth/devices`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a device session error
        if (data.message && data.message.includes("Device session invalid")) {
          // Logout user
          const { logout, device_id } = useAuthStore.getState();
          await logout(device_id || "");
          throw new Error("SESSION_INVALID");
        }
        throw new Error(data.message || "Failed to fetch devices");
      }

      // Check if current device is in the list
      const { device_id, logout } = useAuthStore.getState();
      const currentDeviceExists = data.data.devices.some(
        (d: Device) => d.device_id === device_id
      );

      if (device_id && !currentDeviceExists) {
        // Current device not in list, logout user
        await logout(device_id);
        throw new Error("DEVICE_NOT_FOUND");
      }

      set({
        devices: data.data.devices,
        maxDevices: data.data.max_devices,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch devices";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  removeDevice: async (device_id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/auth/devices/${device_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove device");
      }

      toast.success("Device removed successfully");
      set({
        devices: data.data.devices,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove device";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logoutAllDevices: async (except_current = false, current_device_id = "") => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/auth/devices/logout-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ except_current, current_device_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to logout from devices");
      }

      toast.success(
        except_current
          ? "Logged out from all other devices"
          : "Logged out from all devices"
      );
      // Refresh devices list
      await useDeviceStore.getState().getDevices();

      set({
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to logout from devices";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
}));
