import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { getDeviceInfo } from "@/lib/deviceDetection";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  biometric_enabled: boolean;
  first_login: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  device_id: string | null;
  isLoading: boolean;
  error: string | null;
  emailVerificationRequired: boolean;

  // Actions
  login: (
    email: string,
    password: string,
    device_id: string,
    device_name?: string,
    device_type?: string,
  ) => Promise<void>;
  logout: (device_id: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<void>;
  changePassword: (
    current_password: string,
    new_password: string,
  ) => Promise<void>;
  enableBiometric: () => Promise<void>;
  getMe: () => Promise<null | void>;
  clearError: () => void;
  setUser: (user: User | null, token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      device_id: null,
      isLoading: false,
      error: null,
      emailVerificationRequired: false,

      setUser: (user, token) => set({ user, token }),

      clearError: () => set({ error: null, emailVerificationRequired: false }),

      login: async (
        email: string,
        password: string,
        device_id: string,
        device_name?: string,
        device_type?: string,
      ) => {
        set({ isLoading: true, error: null, emailVerificationRequired: false });
        try {
          const deviceInfo = getDeviceInfo();

          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              device_id,
              device_name: device_name || deviceInfo.name,
              device_type: device_type || deviceInfo.type,
            }),
          });

          const data = await response.json();

          if (data.email_verification_required) {
            set({
              error: data.message,
              emailVerificationRequired: true,
              isLoading: false,
            });
            throw new Error("EMAIL_VERIFICATION_REQUIRED");
          }

          if (!response.ok) {
            throw new Error(data.message || "Login failed");
          }

          const userRole = data.data.user.role.toLowerCase();
          if (userRole !== "admin" && userRole !== "super_admin") {
            set({ isLoading: false, error: null });
            toast.error(
              "Access denied. Only administrators can sign in to this portal.",
            );
            throw new Error(
              "Access denied. Only administrators can sign in to this portal.",
            );
          }

          toast.success("Login successful!");
          set({
            user: data.data.user,
            token: data.data.token,
            device_id: device_id,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred during login";

          if (errorMessage !== "EMAIL_VERIFICATION_REQUIRED") {
            toast.error(errorMessage);
            set({
              error: errorMessage,
              isLoading: false,
            });
          }

          throw error;
        }
      },

      logout: async (device_id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = get();
          if (token) {
            await fetch(`${API_URL}/api/auth/logout`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ device_id }),
            });
          }

          toast.success("Logged out successfully");
          set({
            user: null,
            token: null,
            device_id: null,
            isLoading: false,
            error: null,
            emailVerificationRequired: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Logout failed";
          set({
            user: null,
            token: null,
            device_id: null,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      verifyEmail: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Verification failed");
          }

          toast.success("Email verified successfully!");
          set({
            user: data.data.user,
            token: data.data.token,
            isLoading: false,
            error: null,
            emailVerificationRequired: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred during verification";
          toast.error(errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      resendVerificationCode: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_URL}/api/auth/resend-verification`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to resend code");
          }

          toast.success("Verification code sent to your email");
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while resending code";
          toast.error(errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to send reset code");
          }

          toast.success("Password reset code sent to your email");
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

      resetPassword: async (
        email: string,
        code: string,
        newPassword: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to reset password");
          }

          toast.success("Password reset successfully!");
          set({ isLoading: false, error: null });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while resetting password";
          toast.error(errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (
        current_password: string,
        new_password: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = get();
          if (!token) throw new Error("Not authenticated");

          const response = await fetch(`${API_URL}/api/auth/change-password`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ current_password, new_password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to change password");
          }

          toast.success("Password changed successfully!");
          const currentUser = get().user;
          if (currentUser?.first_login) {
            set({
              user: { ...currentUser, first_login: false },
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false, error: null });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while changing password";
          toast.error(errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      enableBiometric: async () => {
        set({ isLoading: true, error: null });
        try {
          const { token } = get();
          if (!token) throw new Error("Not authenticated");

          const response = await fetch(`${API_URL}/api/auth/enable-biometric`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to enable biometric");
          }

          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, biometric_enabled: true },
              isLoading: false,
              error: null,
            });
          } else {
            set({ isLoading: false, error: null });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while enabling biometric";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      getMe: async () => {
        set({ isLoading: true, error: null });
        try {
          const { token } = get();
          if (!token) {
            set({ isLoading: false });
            return null;
          }

          const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch user data");
          }

          set({
            user: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An error occurred while fetching user data";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        device_id: state.device_id,
      }),
    },
  ),
);
