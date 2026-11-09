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

export const reviewService = {
  list: (page = 1, limit = 12) =>
    apiRequest<ReviewListResponse>(
      `/reviews?page=${page}&limit=${limit}`,
      { auth: false },
    ),

  create: (formData: FormData) =>
    apiRequest<CreateReviewResponse>("/reviews", {
      method: "POST",
      body: formData,
    }),
};
