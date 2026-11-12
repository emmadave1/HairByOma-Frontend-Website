import { apiRequest } from "@/lib/api";

export type LoyaltyTransactionType = "EARN" | "REDEEM" | "REVERSAL";

export type LoyaltyTransaction = {
  _id: string;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  createdAt: string;
  order: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  } | null;
};

export type CustomerLoyaltyResponse = {
  success: boolean;
  loyalty: {
    pointsBalance: number;
    totalTransactions: number;
    currentPage: number;
    totalPages: number;
    transactions: LoyaltyTransaction[];
  };
};

export type CustomerLoyaltyParams = {
  type?: LoyaltyTransactionType;
  page?: number;
  limit?: number;
};

function buildQuery(params: CustomerLoyaltyParams = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export const loyaltyService = {
  getMyTransactions: (params: CustomerLoyaltyParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<CustomerLoyaltyResponse>(`/users/my-loyalty${query ? `?${query}` : ""}`);
  },
};
