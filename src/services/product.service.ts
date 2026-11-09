import { apiRequest } from "@/lib/api";

export type BackendProductVariant = {
  _id: string;
  length: number;
  texture: string;
  colour: string;
  density?: number;
  price: number;
  stock: number;
};

export type BackendProduct = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  videos: string[];
  variants: BackendProductVariant[];
  isFeatured: boolean;
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  success: boolean;
  count: number;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  products: BackendProduct[];
};

export type ProductListParams = {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

export type SingleProductResponse = {
  success: boolean;
  product: BackendProduct;
};

export const productService = {
  list: (params: ProductListParams = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString();

    return apiRequest<ProductListResponse>(`/products${suffix ? `?${suffix}` : ""}`, {
      auth: false,
    });
  },

  getById: async (id: string) => {
    const response = await apiRequest<SingleProductResponse>(`/products/${id}`, { auth: false });

    return response.product;
  },
};
