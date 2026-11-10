import { apiRequest } from "@/lib/api";

export type AdminDeliveryCity = {
  name: string;
  deliveryFee: number;
};

export type AdminDeliveryState = {
  name: string;
  cities: AdminDeliveryCity[];
};

export type AdminStoreSettings = {
  _id: string;
  singletonKey: string;
  payment: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    whatsappNumber: string;
  };
  delivery: {
    currency: string;
    states: AdminDeliveryState[];
  };
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSettingsResponse = {
  success: boolean;
  settings: AdminStoreSettings;
  message?: string;
};

export type AdminSettingsUpdatePayload = {
  payment?: Partial<AdminStoreSettings["payment"]>;
  delivery?: {
    currency?: string;
    states?: AdminDeliveryState[];
  };
};

export const adminSettingsService = {
  get: () => apiRequest<AdminSettingsResponse>("/admin/settings"),

  update: (payload: AdminSettingsUpdatePayload) =>
    apiRequest<AdminSettingsResponse>("/admin/settings", {
      method: "PATCH",
      body: payload,
    }),
};
