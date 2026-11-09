import { apiRequest } from "@/lib/api";

export type AvailableCoupon = {
  _id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number;
  startsAt: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  eligibility: "EVERYONE" | "FIRST_TIME_CUSTOMERS" | "SELECTED_CUSTOMERS";
  remainingUses: number | null;
};

export type AvailableCouponsResponse = {
  success: boolean;
  count: number;
  coupons: AvailableCoupon[];
};

export const couponService = {
  available: () =>
    apiRequest<AvailableCouponsResponse>("/coupons/available"),
};
