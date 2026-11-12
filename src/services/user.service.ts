import { apiRequest } from "@/lib/api";
import type { AppUser } from "@/types";

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string | null;
};

type ProfileResponse = {
  success: boolean;
  message: string;
  user: AppUser;
};

export const userService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    apiRequest<ProfileResponse>("/users/me", {
      method: "PATCH",
      body: payload,
    }),

  deleteAccount: (currentPassword: string) =>
    apiRequest<{ success: boolean; message: string }>("/users/me", {
      method: "DELETE",
      body: { currentPassword },
    }),};
