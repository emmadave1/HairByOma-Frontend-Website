import { apiRequest } from "@/lib/api";

export type BackendReviewMedia = {
  url: string;
  resourceType: "image" | "video";
  format: string;
};

export type BackendReview = {
  _id: string;
  rating: number;
  comment: string;
  reviewer: string;
  media: BackendReviewMedia[];
  product: {
    _id: string;
    name: string;
    images: string[];
  } | null;
  createdAt: string;
};

export type ReviewListResponse = {
  success: boolean;
  reviews: BackendReview[];
  pagination: {
    page: number;
    limit: number;
    totalReviews: number;
    totalPages: number;
  };
};

export type CreateReviewResponse = {
  success: boolean;
  message: string;
  review: BackendReview;
};

export type AdminReviewUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AdminReview = {
  _id: string;
  rating: number;
  comment: string;
  media: BackendReviewMedia[];
  user: AdminReviewUser | null;
  product: {
    _id: string;
    name: string;
    images: string[];
  } | null;
  isApproved: boolean;
  createdAt: string;
};

export type AdminReviewStatus = "all" | "pending" | "approved";

export type AdminReviewListParams = {
  status?: AdminReviewStatus;
  page?: number;
  limit?: number;
};

export type AdminReviewListResponse = {
  success: boolean;
  reviews: AdminReview[];
  pagination: {
    page: number;
    limit: number;
    totalReviews: number;
    totalPages: number;
  };
};

export type AdminReviewMutationResponse = {
  success: boolean;
  message: string;
  review?: AdminReview;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export const reviewService = {
  list: (page = 1, limit = 12) =>
    apiRequest<ReviewListResponse>(`/reviews?page=${page}&limit=${limit}`, { auth: false }),

  create: (formData: FormData) =>
    apiRequest<CreateReviewResponse>("/reviews", {
      method: "POST",
      body: formData,
    }),

  listAdmin: (params: AdminReviewListParams = {}) => {
    const query = buildQuery(params);
    return apiRequest<AdminReviewListResponse>(`/admin/reviews${query ? `?${query}` : ""}`);
  },

  approve: (id: string) =>
    apiRequest<AdminReviewMutationResponse>(`/admin/reviews/${id}/approve`, { method: "PATCH" }),

  reject: (id: string) =>
    apiRequest<AdminReviewMutationResponse>(`/admin/reviews/${id}`, { method: "DELETE" }),
};
