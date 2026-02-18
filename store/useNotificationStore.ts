import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReadByEntry {
  admin_id: string;
  read_at: string;
}

export interface Notification {
  _id: string;
  type: string;
  title?: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  read_by: ReadByEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  is_read?: boolean;
  type?: string;
  limit?: number;
  page?: number;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface NotificationState {
  // Data
  notifications: Notification[];
  unreadCount: number;
  pagination: NotificationPagination | null;

  // UI state
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  getNotifications: (params?: NotificationQueryParams) => Promise<void>;
  getNotificationById: (id: string) => Promise<Notification | null>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string, silent?: boolean) => Promise<void>;
  clearReadNotifications: () => Promise<void>;

  // Local helpers
  clearError: () => void;
  reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function handleApiResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    if (
      typeof data.message === "string" &&
      data.message.includes("Device session invalid")
    ) {
      const { logout, device_id } = useAuthStore.getState();
      await logout(device_id ?? "");
      throw new Error("SESSION_INVALID");
    }
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

const initialState = {
  notifications: [] as Notification[],
  unreadCount: 0,
  pagination: null as NotificationPagination | null,
  isLoading: false,
  isMutating: false,
  error: null as string | null,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  reset: () => set(initialState),

  getNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();

      const qs = new URLSearchParams();
      if (params?.is_read !== undefined)
        qs.set("is_read", String(params.is_read));
      if (params?.type) qs.set("type", params.type);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.page) qs.set("page", String(params.page));

      const url = `${API_URL}/api/admin/notifications${qs.toString() ? `?${qs}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: authHeaders(token),
      });
      const data = await handleApiResponse(response);

      set({
        notifications: data.data ?? [],
        unreadCount: data.unread_count ?? 0,
        pagination: data.pagination ?? null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getNotificationById: async (id) => {
    const cached = get().notifications.find((n) => n._id === id);
    if (cached) return cached;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/admin/notifications/${id}`, {
        method: "GET",
        headers: authHeaders(token),
      });
      const data = await handleApiResponse(response);
      return (data.data ?? data) as Notification;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch notification";
      set({ error: message });
      return null;
    }
  },

  markNotificationRead: async (id) => {
    const prev = get().notifications;
    const wasUnread = prev.find((n) => n._id === id)?.is_read === false;

    set((state) => ({
      isMutating: true,
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, is_read: true } : n,
      ),
      unreadCount: wasUnread
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: authHeaders(token),
        },
      );
      await handleApiResponse(response);
      set({ isMutating: false, error: null });
    } catch (error) {
      set({ notifications: prev, isMutating: false });
      const message =
        error instanceof Error ? error.message : "Failed to mark as read";
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  markAllNotificationsRead: async () => {
    const prev = get().notifications;

    set((state) => ({
      isMutating: true,
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/notifications/mark-all-read`,
        {
          method: "PATCH",
          headers: authHeaders(token),
        },
      );
      await handleApiResponse(response);
      toast.success("All notifications marked as read");
      set({ isMutating: false, error: null });
    } catch (error) {
      set({
        notifications: prev,
        unreadCount: prev.filter((n) => !n.is_read).length,
        isMutating: false,
      });
      const message =
        error instanceof Error ? error.message : "Failed to mark all as read";
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteNotification: async (id, silent = false) => {
    const prev = get().notifications;
    const target = prev.find((n) => n._id === id);

    set((state) => ({
      isMutating: true,
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount:
        target && !target.is_read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
    }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      await handleApiResponse(response);
      if (!silent) toast.success("Notification deleted");
      set({ isMutating: false, error: null });
    } catch (error) {
      set({ notifications: prev, isMutating: false });
      if (target && !target.is_read) {
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
      }
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete notification";
      set({ error: message });
      if (!silent) toast.error(message);
      throw error;
    }
  },

  clearReadNotifications: async () => {
    const prev = get().notifications;

    set((state) => ({
      isMutating: true,
      notifications: state.notifications.filter((n) => !n.is_read),
    }));

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/notifications/clear-all`,
        {
          method: "DELETE",
          headers: authHeaders(token),
        },
      );
      await handleApiResponse(response);
      toast.success("Read notifications cleared");
      set({ isMutating: false, error: null });
    } catch (error) {
      set({ notifications: prev, isMutating: false });
      const message =
        error instanceof Error
          ? error.message
          : "Failed to clear notifications";
      set({ error: message });
      toast.error(message);
      throw error;
    }
  },
}));
