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

export type AdminGalleryMedia = GalleryMedia & {
  publicId: string;
};

export type AdminGalleryUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AdminGallerySourceReview = {
  _id: string;
  rating: number;
  comment: string;
};

export type AdminGalleryEntry = {
  _id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  media: AdminGalleryMedia[];
  sourceReview: AdminGallerySourceReview | null;
  isPublished: boolean;
  createdBy: AdminGalleryUser;
  createdAt: string;
  updatedAt: string;
};

export type AdminGalleryStatus = "all" | "published" | "unpublished";

export type AdminGalleryListParams = {
  page?: number;
  limit?: number;
  status?: AdminGalleryStatus;
  category?: GalleryCategory;
};

export type AdminGalleryListResponse = {
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
  gallery: AdminGalleryEntry[];
};

export type AdminGalleryMutationResponse = {
  success: boolean;
  message: string;
  gallery?: AdminGalleryEntry;
};

const buildQuery = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

export const galleryService = {
  // Public gallery listing
  list: (params: GalleryListParams = {}) => {
    const suffix = buildQuery(params);

    return apiRequest<GalleryListResponse>(`/gallery${suffix ? `?${suffix}` : ""}`, {
      auth: false,
    });
  },

  // Admin gallery listing
  listAdmin: (params: AdminGalleryListParams = {}) => {
    const suffix = buildQuery(params);

    return apiRequest<AdminGalleryListResponse>(`/gallery/admin${suffix ? `?${suffix}` : ""}`);
  },

  // Create a gallery entry using FormData
  createAdmin: (formData: FormData) =>
    apiRequest<AdminGalleryMutationResponse>("/gallery/admin", {
      method: "POST",
      body: formData,
    }),

  // Toggle publication status
  togglePublication: (id: string) =>
    apiRequest<AdminGalleryMutationResponse>(`/gallery/admin/${id}/toggle-publication`, {
      method: "PATCH",
    }),

  // Delete a gallery entry
  deleteAdmin: (id: string) =>
    apiRequest<AdminGalleryMutationResponse>(`/gallery/admin/${id}`, { method: "DELETE" }),
};
