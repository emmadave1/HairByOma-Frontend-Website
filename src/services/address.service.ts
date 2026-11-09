import { apiRequest } from "@/lib/api";

export type SavedAddress = {
  _id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  additionalInfo: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressPayload = {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  additionalInfo?: string;
  isDefault?: boolean;
};

type AddressResponse = {
  success: boolean;
  message: string;
  address: SavedAddress;
};

type AddressesResponse = {
  success: boolean;
  count: number;
  addresses: SavedAddress[];
};

export const addressService = {
  list: () => apiRequest<AddressesResponse>("/addresses"),

  create: (payload: AddressPayload) =>
    apiRequest<AddressResponse>("/addresses", {
      method: "POST",
      body: payload,
    }),

  update: (addressId: string, payload: Partial<AddressPayload>) =>
    apiRequest<AddressResponse>(`/addresses/${addressId}`, {
      method: "PATCH",
      body: payload,
    }),

  remove: (addressId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/addresses/${addressId}`, {
      method: "DELETE",
    }),

  setDefault: (addressId: string) =>
    apiRequest<AddressResponse>(`/addresses/${addressId}/default`, {
      method: "PATCH",
    }),
};
