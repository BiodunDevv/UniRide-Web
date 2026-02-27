import { create } from "zustand";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TrackedTicketMessage {
  _id: string;
  sender_id?: { _id: string; name: string; role: string } | null;
  sender_name?: string;
  sender_role: string;
  message: string;
  timestamp: string;
}

interface TrackedTicket {
  _id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: { _id: string; name: string } | null;
  messages: TrackedTicketMessage[];
  resolved_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  createdAt: string;
}

interface SubmitTicketPayload {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority?: string;
}

interface SubmitResult {
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface SupportState {
  // Submit ticket
  isSubmitting: boolean;
  submitResult: SubmitResult | null;
  submitError: string | null;

  // Track tickets
  isTracking: boolean;
  trackedTickets: TrackedTicket[];
  trackError: string | null;

  // Actions
  submitTicket: (payload: SubmitTicketPayload) => Promise<boolean>;
  trackTickets: (email: string, ticketNumber?: string) => Promise<boolean>;
  clearSubmitResult: () => void;
  clearTrackResults: () => void;
  clearAll: () => void;
}

export const useSupportStore = create<SupportState>()((set) => ({
  isSubmitting: false,
  submitResult: null,
  submitError: null,
  isTracking: false,
  trackedTickets: [],
  trackError: null,

  submitTicket: async (payload) => {
    set({ isSubmitting: true, submitError: null, submitResult: null });
    try {
      const response = await fetch(`${API_URL}/api/support/tickets/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit ticket");
      }

      set({
        submitResult: data.data,
        isSubmitting: false,
        submitError: null,
      });
      return true;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to submit ticket";
      toast.error(msg);
      set({ submitError: msg, isSubmitting: false });
      return false;
    }
  },

  trackTickets: async (email, ticketNumber) => {
    set({ isTracking: true, trackError: null, trackedTickets: [] });
    try {
      const body: Record<string, string> = { email };
      if (ticketNumber) body.ticket_number = ticketNumber;

      const response = await fetch(`${API_URL}/api/support/tickets/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No tickets found");
      }

      set({
        trackedTickets: data.data,
        isTracking: false,
        trackError: null,
      });
      return true;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to track tickets";
      set({ trackError: msg, isTracking: false });
      return false;
    }
  },

  clearSubmitResult: () => set({ submitResult: null, submitError: null }),
  clearTrackResults: () => set({ trackedTickets: [], trackError: null }),
  clearAll: () =>
    set({
      submitResult: null,
      submitError: null,
      trackedTickets: [],
      trackError: null,
    }),
}));
