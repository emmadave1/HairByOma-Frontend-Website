import { apiRequest } from "@/lib/api";

export type ReferralStatus = "PENDING" | "SUCCESSFUL";
export type ReferralRewardStatus = "PENDING" | "AVAILABLE" | "REDEEMED";

export type AdminReferralCustomer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  referralCode?: string;
};

export type AdminReferralOrder = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus?: string;
};

export type AdminReferral = {
  _id: string;
  referrer: AdminReferralCustomer;
  referredUser: AdminReferralCustomer;
  status: ReferralStatus;
  qualifyingOrder: AdminReferralOrder | null;
  referrerRewardStatus: ReferralRewardStatus;
  rewardOrder: AdminReferralOrder | null;
  discountPercentage: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminReferralStatistics = {
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  availableRewards: number;
  redeemedRewards: number;
  uniqueReferrers: number;
};

export type AdminReferralStatsResponse = {
  success: boolean;
  statistics: AdminReferralStatistics;
};

export type AdminReferralParams = {
  status?: ReferralStatus;
  rewardStatus?: ReferralRewardStatus;
  page?: number;
  limit?: number;
};

export type AdminReferralResponse = {
  success: boolean;
  totalReferrals: number;
  currentPage: number;
  totalPages: number;
  referrals: AdminReferral[];
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export const adminReferralService = {
  getStats: () => apiRequest<AdminReferralStatsResponse>("/admin/referrals/stats"),

  getReferrals: (params: AdminReferralParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<AdminReferralResponse>(`/admin/referrals${query ? `?${query}` : ""}`);
  },
};
