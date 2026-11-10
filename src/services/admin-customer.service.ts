import { apiRequest } from "@/lib/api";

export type CustomerStatus = "ACTIVE" | "INACTIVE";
export type LoyaltyTransactionType = "EARN" | "REDEEM" | "REVERSAL";

export type AdminCustomerReferral = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type AdminCustomer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  loyaltyPoints: number;
  referralCode?: string;
  referredBy?: AdminCustomerReferral | null;
  hasUsedReferralDiscount?: boolean;
  dateOfBirth?: string | null;
  birthdayEmailsEnabled?: boolean;
  birthdayWishesEnabled?: boolean;
  promotionalEmailsEnabled?: boolean;
  promotionalEmailConsentAt?: string | null;
  promotionalInAppEnabled?: boolean;
  isActive: boolean;
  abandonedCartEmailsEnabled?: boolean;
  newProductEmailsEnabled?: boolean;
  newProductInAppEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type AdminCustomerListParams = {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
};

export type AdminCustomerListResponse = {
  success: boolean;
  totalCustomers: number;
  currentPage: number;
  totalPages: number;
  customers: AdminCustomer[];
};

export type AdminCustomerOrdersResponse = {
  success: boolean;
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  orders: import("@/services/order.service").AdminOrder[];
};

export type LoyaltyTransactionOrder = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
};

export type AdminLoyaltyTransaction = {
  _id: string;
  order: LoyaltyTransactionOrder;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  relatedTransaction?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomerLoyaltyResponse = {
  success: boolean;
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  transactions: AdminLoyaltyTransaction[];
};

export type CustomerLoyaltyParams = {
  type?: LoyaltyTransactionType;
  page?: number;
  limit?: number;
};

type CustomerDetailsResponse = {
  success: boolean;
  customer: AdminCustomer;
};

type CustomerStatusResponse = {
  success: boolean;
  message: string;
  customer?: Pick<AdminCustomer, "_id" | "firstName" | "lastName" | "email" | "isActive"> & {
    tokenVersion?: number;
  };
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

export const adminCustomerService = {
  list: (params: AdminCustomerListParams = {}) => {
    const query = buildQuery(params);
    return apiRequest<AdminCustomerListResponse>(`/admin/customers${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => apiRequest<CustomerDetailsResponse>(`/admin/customers/${id}`),

  getOrders: (id: string, page = 1, limit = 10) => {
    const query = buildQuery({ page, limit });
    return apiRequest<AdminCustomerOrdersResponse>(`/admin/customers/${id}/orders?${query}`);
  },

  getLoyaltyTransactions: (id: string, params: CustomerLoyaltyParams = {}) => {
    const query = buildQuery(params);
    return apiRequest<AdminCustomerLoyaltyResponse>(
      `/admin/customers/${id}/loyalty-transactions${query ? `?${query}` : ""}`,
    );
  },

  updateStatus: (id: string, isActive: boolean) =>
    apiRequest<CustomerStatusResponse>(`/admin/customers/${id}/status`, {
      method: "PATCH",
      body: { isActive },
    }),
};
