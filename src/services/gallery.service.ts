import { apiRequest } from "@/lib/api";

export type GalleryCategory =
  "customer-installation" | "before-and-after" | "packaging" | "testimonials" | "other";

export type GalleryMedia = {
  url: string;
  resourceType: "image" | "video";
  format: string;
};

export type BackendGalleryEntry = {
  _id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  media: GalleryMedia[];
  createdAt: string;
};

export type GalleryListResponse = {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  gallery: BackendGalleryEntry[];
};

export type GalleryListParams = {
  page?: number;
  limit?: number;
  category?: GalleryCategory;
};

export const galleryService = {
  list: (params: GalleryListParams = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString();

    return apiRequest<GalleryListResponse>(`/gallery${suffix ? `?${suffix}` : ""}`, {
      auth: false,
    });
  },
};
