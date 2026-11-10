import { apiRequest } from "@/lib/api";

export type BirthdayPreference =
  "all" | "email" | "no-email" | "wishes-enabled" | "wishes-disabled";

export type BirthdayPeriod = "all" | "upcoming" | "this-month";

export type AdminBirthdayCustomer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  birthdayEmailsEnabled: boolean;
  birthdayWishesEnabled: boolean;
  birthdayWishLastSentYear: number | null;
  nextBirthday: string;
  daysUntilBirthday: number;
  birthdayMonth: number;
  birthdayDay: number;
};

export type AdminBirthdayStatistics = {
  customersWithBirthdays: number;
  upcomingThisMonth: number;
  birthdayEmailOptIns: number;
  birthdayWishesEnabled: number;
  birthdayWishesDisabled: number;
};

export type AdminBirthdayStatsResponse = {
  success: boolean;
  statistics: AdminBirthdayStatistics;
  generatedAt: string;
};

export type AdminBirthdayParams = {
  search?: string;
  preference?: BirthdayPreference;
  period?: BirthdayPeriod;
  page?: number;
  limit?: number;
};

export type AdminBirthdayResponse = {
  success: boolean;
  totalBirthdays: number;
  currentPage: number;
  totalPages: number;
  birthdays: AdminBirthdayCustomer[];
};

function buildQuery(params: AdminBirthdayParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export const adminBirthdayService = {
  getStats: () => apiRequest<AdminBirthdayStatsResponse>("/admin/birthdays/stats"),

  getBirthdays: (params: AdminBirthdayParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<AdminBirthdayResponse>(`/admin/birthdays${query ? `?${query}` : ""}`);
  },
};
