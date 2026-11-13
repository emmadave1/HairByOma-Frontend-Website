import { apiRequest } from "@/lib/api";

export type StorefrontDeliveryCity = {
  name: string;
  deliveryFee: number;
};

export type StorefrontDeliveryState = {
  name: string;
  cities: StorefrontDeliveryCity[];
};

export type StorefrontSettings = {
  payment: {
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    whatsappNumber: string | null;
  };
  delivery: {
    currency: string;
    states: StorefrontDeliveryState[];
  };
};

type StorefrontSettingsResponse = {
  success: boolean;
  settings: StorefrontSettings;
};

export const storeSettingsService = {
  get: () =>
    apiRequest<StorefrontSettingsResponse>("/store/settings", {
      method: "GET",
      auth: false,
    }),
};
