import { apiRequest } from "@/lib/api";
import type { BackendProduct, ProductListResponse } from "@/services/product.service";

export type AdminProductListParams = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  status?: "all" | "active" | "inactive";
};

export type ProductPayload = {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  videos: string[];
  variants: {
    length: number;
    texture: string;
    colour: string;
    density?: number;
    price: number;
    stock: number;
  }[];
  isFeatured: boolean;
};

type ProductResponse = {
  success: boolean;
  message: string;
  product: BackendProduct;
};

export type VariantStockPayload = {
  stock: number;
};

export type ProductMediaFile = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
};

type ProductMediaUploadResponse = {
  success: boolean;
  message: string;
  files: ProductMediaFile[];
};

export const adminProductService = {
  list: (params: AdminProductListParams = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString();

    return apiRequest<ProductListResponse>(`/products/admin${suffix ? `?${suffix}` : ""}`);
  },

  uploadMedia: (files: File[]) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("media", file);
    });

    return apiRequest<ProductMediaUploadResponse>("/products/admin/upload-media", {
      method: "POST",
      body: formData,
    });
  },

  create: (data: ProductPayload) =>
    apiRequest<ProductResponse>("/products", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<ProductPayload>) =>
    apiRequest<ProductResponse>(`/products/${id}`, {
      method: "PATCH",
      body: data,
    }),

  deactivate: (id: string) =>
    apiRequest<ProductResponse>(`/products/${id}/deactivate`, {
      method: "PATCH",
    }),

  reactivate: (id: string) =>
    apiRequest<ProductResponse>(`/products/${id}/reactivate`, {
      method: "PATCH",
    }),

  updateVariantStock: (productId: string, variantId: string, data: VariantStockPayload) =>
    apiRequest<ProductResponse>(`/products/${productId}/variants/${variantId}/stock`, {
      method: "PATCH",
      body: data,
    }),
};
