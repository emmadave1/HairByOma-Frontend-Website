import { apiRequest } from "@/lib/api";

export type LoyaltyTransactionType = "EARN" | "REDEEM" | "REVERSAL";

export type AdminLoyaltyCustomer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AdminLoyaltyOrder = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
};

export type AdminLoyaltyTransaction = {
  _id: string;
  user: AdminLoyaltyCustomer;
  order: AdminLoyaltyOrder;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  relatedTransaction?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLoyaltyStatistics = {
  totalCustomers: number;
  customersWithPoints: number;
  totalPointsHeld: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalPointsReversed: number;
  transactions: {
    EARN: {
      totalPoints: number;
      transactionCount: number;
    };
    REDEEM: {
      totalPoints: number;
      transactionCount: number;
    };
    REVERSAL: {
      totalPoints: number;
      transactionCount: number;
    };
  };
};

export type AdminLoyaltyStatsResponse = {
  success: boolean;
  statistics: AdminLoyaltyStatistics;
};

export type AdminLoyaltyTransactionParams = {
  type?: LoyaltyTransactionType;
  customerId?: string;
  page?: number;
  limit?: number;
};

export type AdminLoyaltyTransactionResponse = {
  success: boolean;
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  transactions: AdminLoyaltyTransaction[];
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

export const adminLoyaltyService = {
  getStats: () => apiRequest<AdminLoyaltyStatsResponse>("/admin/loyalty/stats"),

  getTransactions: (params: AdminLoyaltyTransactionParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<AdminLoyaltyTransactionResponse>(
      `/admin/loyalty/transactions${query ? `?${query}` : ""}`,
    );
  },
};
