import { apiRequest, tokenStorage } from "@/lib/api";
import type { AppUser, AuthResponse, RegisterResponse } from "@/types";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  referralCode?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerificationPayload = {
  email: string;
  code: string;
};

export const authService = {
  register: (payload: RegisterPayload) =>
    apiRequest<RegisterResponse>("/users/register", {
      method: "POST",
      auth: false,
      body: payload,
    }),

  verifyEmail: (payload: VerificationPayload) =>
    apiRequest<{ success: boolean; message: string }>("/users/verify-email", {
      method: "POST",
      auth: false,
      body: payload,
    }),

  resendVerification: (email: string) =>
    apiRequest<{ success: boolean; message: string }>("/users/resend-verification", {
      method: "POST",
      auth: false,
      body: { email },
    }),

  login: async (payload: LoginPayload) => {
    const response = await apiRequest<AuthResponse>("/users/login", {
      method: "POST",
      auth: false,
      body: payload,
    });

    tokenStorage.set(response.token);

    return response;
  },

  getCurrentUser: () => apiRequest<{ success: boolean; user: AppUser }>("/users/me"),

  logout: async () => {
    try {
      await apiRequest("/users/logout", {
        method: "POST",
      });
    } finally {
      tokenStorage.clear();
    }
  },
};
