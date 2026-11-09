import { apiRequest } from "@/lib/api";

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type InventoryAdjustmentType = "INCREASE" | "DECREASE" | "SET";

export type InventoryVariant = {
  _id: string;
  length: number;
  texture: string;
  colour: string;
  density?: number;
  price: number;
  stock: number;
};

export type InventoryProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  inventoryStock: number;
  variants: InventoryVariant[];
  isActive: boolean;
  createdAt: string;
};

export type InventoryListParams = {
  search?: string;
  status?: InventoryStatus;
  page?: number;
  limit?: number;
};

export type InventoryListResponse = {
  success: boolean;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  lowStockThreshold: number;
  inventory: InventoryProduct[];
};

export type StockAdjustmentPayload = {
  variantId?: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  reason: string;
};

export type InventoryAdjustment = {
  _id: string;
  product:
    | {
        _id: string;
        name: string;
        category: string;
      }
    | string;
  productName: string;
  variantId: string | null;
  adjustmentType: InventoryAdjustmentType;
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | string;
  createdAt: string;
  updatedAt: string;
};

export type AdjustmentHistoryParams = {
  productId?: string;
  adjustmentType?: InventoryAdjustmentType;
  page?: number;
  limit?: number;
};

export type AdjustmentHistoryResponse = {
  success: boolean;
  totalAdjustments: number;
  currentPage: number;
  totalPages: number;
  adjustments: InventoryAdjustment[];
};

type StockAdjustmentResponse = {
  success: boolean;
  message: string;
  adjustment: InventoryAdjustment;
};

export const inventoryService = {
  list: (params: InventoryListParams = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString();

    return apiRequest<InventoryListResponse>(`/admin/inventory${suffix ? `?${suffix}` : ""}`);
  },

  adjustStock: (productId: string, data: StockAdjustmentPayload) =>
    apiRequest<StockAdjustmentResponse>(`/admin/inventory/${productId}/adjust-stock`, {
      method: "PATCH",
      body: data,
    }),

  getHistory: (params: AdjustmentHistoryParams = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString();

    return apiRequest<AdjustmentHistoryResponse>(
      `/admin/inventory/adjustments${suffix ? `?${suffix}` : ""}`,
    );
  },
};
