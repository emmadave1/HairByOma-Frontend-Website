import { apiRequest } from "@/lib/api";

export type BackendCartVariant = {
  id: string;
  length: number;
  texture: string;
  colour: string;
  density?: number | string;
};

export type BackendCartItem = {
  itemId: string;
  productId: string;
  name?: string;
  category?: string;
  images?: string[];
  quantity: number;
  variant: BackendCartVariant | null;
  unitPrice?: number;
  subtotal: number;
  available: boolean;
  availableStock?: number;
  message?: string | null;
};

export type BackendCart = {
  success: boolean;
  cartId?: string;
  guestId?: string;
  items: BackendCartItem[];
  totalItems: number;
  totalPrice: number;
};

export type AddToCartPayload = {
  productId: string;
  variantId?: string;
  quantity?: number;
};

type CartMutationResponse = {
  success: boolean;
  message: string;
  guestId?: string;
  cart?: unknown;
  item?: BackendCartItem;
};

const guestHeaders = (guestId?: string): Record<string, string> =>
  guestId ? { "x-guest-cart-id": guestId } : {};

export const cartService = {
  get: (guestId?: string) =>
    apiRequest<BackendCart>("/cart", {
      headers: guestHeaders(guestId),
    }),

  add: (payload: AddToCartPayload, guestId?: string) =>
    apiRequest<CartMutationResponse>("/cart", {
      method: "POST",
      body: payload,
      headers: guestHeaders(guestId),
    }),

  update: (itemId: string, quantity: number, guestId?: string) =>
    apiRequest<CartMutationResponse>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: { quantity },
      headers: guestHeaders(guestId),
    }),

  remove: (itemId: string, guestId?: string) =>
    apiRequest<CartMutationResponse>(`/cart/items/${itemId}`, {
      method: "DELETE",
      headers: guestHeaders(guestId),
    }),

  clear: (guestId?: string) =>
    apiRequest<CartMutationResponse>("/cart", {
      method: "DELETE",
      headers: guestHeaders(guestId),
    }),

  merge: (guestId: string) =>
    apiRequest<CartMutationResponse>("/cart/merge", {
      method: "POST",
      headers: guestHeaders(guestId),
    }),
};
