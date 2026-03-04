import { create } from "zustand";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Review {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    profile_picture?: string;
    role: string;
  };
  rating: number;
  title: string;
  message: string;
  is_featured: boolean;
  is_approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewState {
  reviews: Review[];
  total: number;
  isLoading: boolean;

  getAllReviews: (
    token: string,
    params?: Record<string, string>,
  ) => Promise<void>;
  toggleFeatured: (token: string, id: string) => Promise<void>;
  toggleApproval: (token: string, id: string) => Promise<void>;
  deleteReview: (token: string, id: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  reviews: [],
  total: 0,
  isLoading: false,

  getAllReviews: async (token, params = {}) => {
    set({ isLoading: true });
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/api/reviews/all?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        set({ reviews: data.data, total: data.total });
      } else {
        toast.error(data.message || "Failed to fetch reviews");
      }
    } catch {
      toast.error("Network error fetching reviews");
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFeatured: async (token, id) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}/featured`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        set({
          reviews: get().reviews.map((r) =>
            r._id === id ? { ...r, is_featured: data.data.is_featured } : r,
          ),
        });
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to toggle featured status");
      }
    } catch {
      toast.error("Network error");
    }
  },

  toggleApproval: async (token, id) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}/approval`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        set({
          reviews: get().reviews.map((r) =>
            r._id === id
              ? {
                  ...r,
                  is_approved: data.data.is_approved,
                  is_featured: data.data.is_featured,
                }
              : r,
          ),
        });
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to toggle approval status");
      }
    } catch {
      toast.error("Network error");
    }
  },

  deleteReview: async (token, id) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        set({ reviews: get().reviews.filter((r) => r._id !== id) });
        toast.success("Review deleted");
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch {
      toast.error("Network error");
    }
  },
}));
