import { apiRequest } from "@/lib/api";

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export type CouponEligibility = "EVERYONE" | "FIRST_TIME_CUSTOMERS" | "SELECTED_CUSTOMERS";

export type CouponRedemptionStatus = "RESERVED" | "REDEEMED" | "RELEASED";

export type AdminCouponCustomer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AdminCouponOrder = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus?: string;
  orderStatus?: string;
};

export type AdminCoupon = {
  _id: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number;
  startsAt: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  eligibility: CouponEligibility;
  eligibleUsers: (AdminCouponCustomer | string)[];
  isActive: boolean;
  createdBy?: AdminCouponCustomer | string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCouponPayload = {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minimumOrderAmount?: number;
  startsAt?: string;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number;
  eligibility?: CouponEligibility;
  eligibleUsers?: string[];
  isActive?: boolean;
};

export type AdminCouponUpdatePayload = Partial<Omit<AdminCouponPayload, "code">>;

export type AdminCouponListParams = {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export type AdminCouponListResponse = {
  success: boolean;
  totalCoupons: number;
  currentPage: number;
  totalPages: number;
  coupons: AdminCoupon[];
};

export type AdminCouponResponse = {
  success: boolean;
  message?: string;
  coupon: AdminCoupon;
};

export type AdminCouponDetailsResponse = {
  success: boolean;
  coupon: AdminCoupon;
};

export type AdminCouponStats = {
  couponCode: string;
  discountType: CouponDiscountType;
  discountValue: number;
  usageLimit: number | null;
  usageCount: number;
  remainingUses: number | null;
  reservedRedemptions: number;
  successfulRedemptions: number;
  releasedRedemptions: number;
  uniqueCustomers: number;
  totalDiscountGiven: number;
};

export type AdminCouponStatsResponse = {
  success: boolean;
  stats: AdminCouponStats;
};

export type AdminCouponRedemption = {
  _id: string;
  user: AdminCouponCustomer;
  order: AdminCouponOrder | null;
  coupon: string;
  status: CouponRedemptionStatus;
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCouponRedemptionParams = {
  status?: CouponRedemptionStatus;
  page?: number;
  limit?: number;
};

export type AdminCouponRedemptionResponse = {
  success: boolean;
  couponCode: string;
  totalRedemptions: number;
  currentPage: number;
  totalPages: number;
  redemptions: AdminCouponRedemption[];
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export const adminCouponService = {
  list: (params: AdminCouponListParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<AdminCouponListResponse>(`/admin/coupons${query ? `?${query}` : ""}`);
  },

  create: (payload: AdminCouponPayload) =>
    apiRequest<AdminCouponResponse>("/admin/coupons", {
      method: "POST",
      body: payload,
    }),

  getById: (id: string) => apiRequest<AdminCouponDetailsResponse>(`/admin/coupons/${id}`),

  update: (id: string, payload: AdminCouponUpdatePayload) =>
    apiRequest<AdminCouponResponse>(`/admin/coupons/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  deactivate: (id: string) =>
    apiRequest<AdminCouponResponse>(`/admin/coupons/${id}/deactivate`, {
      method: "PATCH",
    }),

  getStats: (id: string) => apiRequest<AdminCouponStatsResponse>(`/admin/coupons/${id}/stats`),

  getRedemptions: (id: string, params: AdminCouponRedemptionParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<AdminCouponRedemptionResponse>(
      `/admin/coupons/${id}/redemptions${query ? `?${query}` : ""}`,
    );
  },
};
