import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Message {
  _id: string;
  sender_id: {
    _id: string;
    name: string;
    role: string;
  };
  sender_role: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticket_number: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
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
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  processingTicketId: string | null;

  // Actions
  getAllTickets: (
    status?: string,
    priority?: string,
    category?: string
  ) => Promise<void>;
  getAvailableTickets: (priority?: string, category?: string) => Promise<void>;
  getTicketById: (id: string) => Promise<void>;
  acceptTicket: (id: string) => Promise<void>;
  declineTicket: (id: string) => Promise<void>;
  addMessage: (id: string, message: string) => Promise<void>;
  resolveTicket: (id: string) => Promise<void>;
  updatePriority: (id: string, priority: string) => Promise<void>;
  clearError: () => void;
  setCurrentTicket: (ticket: Ticket | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      tickets: [],
      availableTickets: [],
      currentTicket: null,
      isLoading: false,
      error: null,
      processingTicketId: null,

      clearError: () => set({ error: null }),

      setCurrentTicket: (ticket) => set({ currentTicket: ticket }),

      getAllTickets: async (status, priority, category) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const params = new URLSearchParams();
          if (status) params.append("status", status);
          if (priority) params.append("priority", priority);
          if (category) params.append("category", category);

          const queryString = params.toString();
          const url = `${API_URL}/api/support/admin/tickets${
            queryString ? `?${queryString}` : ""
          }`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authData.state.token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch tickets");
          }

          set({
            tickets: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch tickets";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      getAvailableTickets: async (priority, category) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const params = new URLSearchParams();
          if (priority) params.append("priority", priority);
          if (category) params.append("category", category);

          const queryString = params.toString();
          const url = `${API_URL}/api/support/admin/tickets/available${
            queryString ? `?${queryString}` : ""
          }`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authData.state.token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Failed to fetch available tickets"
            );
          }

          set({
            availableTickets: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch available tickets";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      getTicketById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const response = await fetch(`${API_URL}/api/support/tickets/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authData.state.token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch ticket");
          }

          set({
            currentTicket: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch ticket";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      acceptTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const response = await fetch(
            `${API_URL}/api/support/admin/tickets/${id}/accept`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData.state.token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to accept ticket");
          }

          // Update the ticket in the lists
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket._id === id ? data.data : ticket
            ),
            availableTickets: state.availableTickets.filter(
              (ticket) => ticket._id !== id
            ),
            currentTicket:
              state.currentTicket?._id === id ? data.data : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to accept ticket";
          set({
            error: errorMessage,
            processingTicketId: null,
          });
          throw error;
        }
      },

      declineTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const response = await fetch(
            `${API_URL}/api/support/admin/tickets/${id}/decline`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData.state.token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to decline ticket");
          }

          // Update the ticket in the lists
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket._id === id ? data.data : ticket
            ),
            availableTickets: [...state.availableTickets, data.data],
            currentTicket:
              state.currentTicket?._id === id ? data.data : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to decline ticket";
          set({
            error: errorMessage,
            processingTicketId: null,
          });
          throw error;
        }
      },

      addMessage: async (id: string, message: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const response = await fetch(
            `${API_URL}/api/support/tickets/${id}/message`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData.state.token}`,
              },
              body: JSON.stringify({ message }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to add message");
          }

          // Update the ticket in the lists
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket._id === id ? data.data : ticket
            ),
            currentTicket:
              state.currentTicket?._id === id ? data.data : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to add message";
          set({
            error: errorMessage,
            processingTicketId: null,
          });
          throw error;
        }
      },

      resolveTicket: async (id: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const response = await fetch(
            `${API_URL}/api/support/tickets/${id}/resolve`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData.state.token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to resolve ticket");
          }

          // Update the ticket in the lists
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket._id === id ? data.data : ticket
            ),
            currentTicket:
              state.currentTicket?._id === id ? data.data : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to resolve ticket";
          set({
            error: errorMessage,
            processingTicketId: null,
          });
          throw error;
        }
      },

      updatePriority: async (id: string, priority: string) => {
        set({ processingTicketId: id, error: null });
        try {
          const token = localStorage.getItem("auth-storage");
          if (!token) throw new Error("No authentication token found");

          const authData = JSON.parse(token);
          if (!authData.state?.token)
            throw new Error("No authentication token found");

          const response = await fetch(
            `${API_URL}/api/support/admin/tickets/${id}/priority`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData.state.token}`,
              },
              body: JSON.stringify({ priority }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to update priority");
          }

          // Update the ticket in the lists
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket._id === id ? data.data : ticket
            ),
            availableTickets: state.availableTickets.map((ticket) =>
              ticket._id === id ? data.data : ticket
            ),
            currentTicket:
              state.currentTicket?._id === id ? data.data : state.currentTicket,
            processingTicketId: null,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update priority";
          set({
            error: errorMessage,
            processingTicketId: null,
          });
          throw error;
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        currentTicket: state.currentTicket,
      }),
    }
  )
);
