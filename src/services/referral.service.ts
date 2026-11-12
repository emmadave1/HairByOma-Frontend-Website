import { apiRequest } from "@/lib/api";

export type CustomerReferral = {
  _id: string;
  status: "PENDING" | "SUCCESSFUL";
  referrerRewardStatus: "PENDING" | "AVAILABLE" | "REDEEMED";
  qualifyingOrder?: string | null;
  rewardOrder?: string | null;
  createdAt: string;
  referredUser: {
    _id: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  } | null;
};

export type CustomerReferralResponse = {
  success: boolean;
  referral: {
    referralCode: string;
    welcomeDiscountAvailable: boolean;
    welcomeDiscountPercentage: number;
    referrerRewardPercentage: number;
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    availableRewards: number;
    redeemedRewards: number;
    referrals: CustomerReferral[];
  };
};

export const referralService = {
  getMyReferrals: () =>
    apiRequest<CustomerReferralResponse>("/users/my-referrals"),
};
