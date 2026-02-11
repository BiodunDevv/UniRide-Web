import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ReadBy {
  admin_id: string;
  read_at: string;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  read_by: ReadBy[];
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  getNotifications: (params?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  getNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const queryParams = new URLSearchParams();
      if (params?.is_read !== undefined) {
        queryParams.append("is_read", String(params.is_read));
      }
      if (params?.type) {
        queryParams.append("type", params.type);
      }
      if (params?.limit) {
        queryParams.append("limit", String(params.limit));
      }

      const queryString = queryParams.toString();
      const url = `${API_URL}/api/admin/notifications${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
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
          // Redirect will be handled by the app
          throw new Error("SESSION_INVALID");
        }
        throw new Error(data.message || "Failed to fetch notifications");
      }

      set({
        notifications: data.data,
        unreadCount: data.unread_count,
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

  markNotificationRead: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark notification as read");
      }

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif._id === id ? { ...notif, is_read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        isLoading: false,
        error: null,
      }));
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

  markAllNotificationsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/notifications/mark-all-read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark all notifications as read"
        );
      }

      toast.success("All notifications marked as read");
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          is_read: true,
        })),
        unreadCount: 0,
        isLoading: false,
        error: null,
      }));
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

  deleteNotification: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notification");
      }

      toast.success("Notification deleted");
      // Update local state
      set((state) => {
        const deletedNotification = state.notifications.find(
          (notif) => notif._id === id
        );
        const wasUnread = deletedNotification && !deletedNotification.is_read;

        return {
          notifications: state.notifications.filter(
            (notif) => notif._id !== id
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
          isLoading: false,
          error: null,
        };
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

  clearAllNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_URL}/api/admin/notifications/clear-all`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear notifications");
      }

      toast.success("All read notifications cleared");
      // Update local state - remove all read notifications
      set((state) => ({
        notifications: state.notifications.filter((notif) => !notif.is_read),
        isLoading: false,
        error: null,
      }));
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
}));
