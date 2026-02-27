import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Message {
  _id: string;
  sender_id?: {
    _id: string;
    name: string;
    role: string;
  } | null;
  sender_name?: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

interface Ticket {
  _id: string;
  ticket_number?: string;
  user_id?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  guest_name?: string;
  guest_email?: string;
  subject: string;
  category: "account" | "payment" | "ride" | "technical" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned_to?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  messages: Message[];
  resolved_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  satisfaction_comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  tickets: Ticket[];
  availableTickets: Ticket[];
  myTickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  processingTicketId: string | null;

  // Actions
  getAllTickets: (
    status?: string,
    priority?: string,
    category?: string,
  ) => Promise<void>;
  getAvailableTickets: (priority?: string, category?: string) => Promise<void>;
  getMyAssignedTickets: (status?: string, priority?: string) => Promise<void>;
  getTicketById: (id: string) => Promise<void>;
  acceptTicket: (id: string) => Promise<Ticket>;
  declineTicket: (id: string) => Promise<void>;
  addMessage: (id: string, message: string) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;
  closeTicket: (id: string) => Promise<void>;
  updatePriority: (id: string, priority: string) => Promise<void>;
  clearError: () => void;
  setCurrentTicket: (ticket: Ticket | null) => void;
}

// Helper to get auth token
function getAuthToken(): string {
  const token = localStorage.getItem("auth-storage");
  if (!token) throw new Error("No authentication token found");
  const authData = JSON.parse(token);
  if (!authData.state?.token) throw new Error("No authentication token found");
  return authData.state.token;
}

// Helper for authenticated fetch
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

// Helper to update a ticket across all list states
function updateTicketInLists(
  state: ChatState,
  id: string,
  updatedTicket: Ticket,
) {
  return {
    tickets: state.tickets.map((t) => (t._id === id ? updatedTicket : t)),
    availableTickets: state.availableTickets.map((t) =>
      t._id === id ? updatedTicket : t,
    ),
    myTickets: state.myTickets.map((t) => (t._id === id ? updatedTicket : t)),
    currentTicket:
      state.currentTicket?._id === id ? updatedTicket : state.currentTicket,
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      tickets: [],
      availableTickets: [],
      myTickets: [],
      currentTicket: null,
      isLoading: false,
      error: null,
      processingTicketId: null,

      clearError: () => set({ error: null }),

      setCurrentTicket: (ticket) => set({ currentTicket: ticket }),

      getAllTickets: async (status, priority, category) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (status) params.append("status", status);
          if (priority) params.append("priority", priority);
          if (category) params.append("category", category);

          const qs = params.toString();
          const data = await authFetch(
            `${API_URL}/api/support/admin/tickets${qs ? `?${qs}` : ""}`,
          );

          set({ tickets: data.data, isLoading: false, error: null });
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to fetch tickets";
          toast.error(msg);
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      getAvailableTickets: async (priority, category) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (priority) params.append("priority", priority);
          if (category) params.append("category", category);

          const qs = params.toString();
          const data = await authFetch(
            `${API_URL}/api/support/admin/tickets/available${qs ? `?${qs}` : ""}`,
          );

          set({ availableTickets: data.data, isLoading: false, error: null });
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : "Failed to fetch available tickets";
          toast.error(msg);
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      getMyAssignedTickets: async (status, priority) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (status) params.append("status", status);
          if (priority) params.append("priority", priority);

          const qs = params.toString();
          const data = await authFetch(
            `${API_URL}/api/support/admin/tickets/mine${qs ? `?${qs}` : ""}`,
          );

          set({ myTickets: data.data, isLoading: false, error: null });
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : "Failed to fetch assigned tickets";
          toast.error(msg);
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      getTicketById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authFetch(`${API_URL}/api/support/tickets/${id}`);

          set({ currentTicket: data.data, isLoading: false, error: null });
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to fetch ticket";
          toast.error(msg);
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      acceptTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const data = await authFetch(
            `${API_URL}/api/support/admin/tickets/${id}/accept`,
            { method: "PATCH" },
          );

          const accepted: Ticket = data.data;

          // Remove from available, add to myTickets
          set((state) => ({
            tickets: state.tickets.map((t) => (t._id === id ? accepted : t)),
            availableTickets: state.availableTickets.filter(
              (t) => t._id !== id,
            ),
            myTickets: [
              accepted,
              ...state.myTickets.filter((t) => t._id !== id),
            ],
            currentTicket:
              state.currentTicket?._id === id ? accepted : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
          toast.success("Ticket accepted successfully");
          return accepted;
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to accept ticket";
          toast.error(msg);
          set({ error: msg, processingTicketId: null });
          throw error;
        }
      },

      declineTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const data = await authFetch(
            `${API_URL}/api/support/admin/tickets/${id}/decline`,
            { method: "PATCH" },
          );

          const declined: Ticket = data.data;

          // Remove from myTickets, add back to available
          set((state) => ({
            tickets: state.tickets.map((t) => (t._id === id ? declined : t)),
            availableTickets: [declined, ...state.availableTickets],
            myTickets: state.myTickets.filter((t) => t._id !== id),
            currentTicket:
              state.currentTicket?._id === id ? declined : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
          toast.success("Ticket declined — now available for others");
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to decline ticket";
          toast.error(msg);
          set({ error: msg, processingTicketId: null });
          throw error;
        }
      },

      addMessage: async (id: string, message: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const data = await authFetch(
            `${API_URL}/api/support/tickets/${id}/message`,
            { method: "POST", body: JSON.stringify({ message }) },
          );

          set((state) => ({
            ...updateTicketInLists(state, id, data.data),
            processingTicketId: null,
            error: null,
          }));
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to add message";
          toast.error(msg);
          set({ error: msg, processingTicketId: null });
          throw error;
        }
      },

      resolveTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const data = await authFetch(
            `${API_URL}/api/support/tickets/${id}/resolve`,
            { method: "PATCH" },
          );

          set((state) => ({
            ...updateTicketInLists(state, id, data.data),
            processingTicketId: null,
            error: null,
          }));
          toast.success("Ticket resolved successfully");
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to resolve ticket";
          toast.error(msg);
          set({ error: msg, processingTicketId: null });
          throw error;
        }
      },

      closeTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const data = await authFetch(
            `${API_URL}/api/support/tickets/${id}/close`,
            { method: "PATCH" },
          );

          set((state) => ({
            ...updateTicketInLists(state, id, data.data),
            processingTicketId: null,
            error: null,
          }));
          toast.success("Ticket closed successfully");
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Failed to close ticket";
          toast.error(msg);
          set({ error: msg, processingTicketId: null });
          throw error;
        }
      },

      updatePriority: async (id: string, priority: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const data = await authFetch(
            `${API_URL}/api/support/admin/tickets/${id}/priority`,
            { method: "PATCH", body: JSON.stringify({ priority }) },
          );

          set((state) => ({
            ...updateTicketInLists(state, id, data.data),
            processingTicketId: null,
            error: null,
          }));
          toast.success("Priority updated successfully");
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : "Failed to update priority";
          toast.error(msg);
          set({ error: msg, processingTicketId: null });
          throw error;
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        currentTicket: state.currentTicket,
      }),
    },
  ),
);
