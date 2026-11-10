import { apiRequest } from "@/lib/api";

export type CustomWigOrderStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTED"
  | "APPROVED"
  | "REJECTED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "IN_PRODUCTION"
  | "QUALITY_CHECK"
  | "READY_FOR_DISPATCH"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "QUOTE_EXPIRED";

export type CustomWigReferenceImage = {
  url: string;
  publicId: string;
  format?: string | null;
};

export type CustomWigCustomer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type CustomWigLinkedOrder = {
  _id: string;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
};

export type CustomWigStatusHistory = {
  _id?: string;
  status: CustomWigOrderStatus;
  note?: string;
  changedBy?: string | null;
  isVisibleToCustomer: boolean;
  changedAt: string;
};

export type AdminCustomWigOrder = {
  _id: string;
  requestNumber: string;
  user: CustomWigCustomer;
  wigType: string;
  hairType: string;
  texture: string;
  length: number;
  density: number;
  colour: string;
  laceType?: string;
  capSize: string;
  wigStyle: string;
  partingStyle?: string;
  specialInstructions?: string;
  referenceImages: CustomWigReferenceImage[];
  quoteAmount?: number | null;
  quoteCurrency: string;
  quoteNote?: string;
  quoteExpiresAt?: string | null;
  quotedAt?: string | null;
  quotedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  customerApprovedAt?: string | null;
  customerRejectedAt?: string | null;
  customerResponseNote?: string;
  order?: CustomWigLinkedOrder | null;
  paymentMethod?: "BANK_TRANSFER" | null;
  paymentStatus: "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED" | "REFUND_PENDING" | "REFUNDED";
  paymentReference?: string | null;
  paymentReceiptSubmitted: boolean;
  paymentReceiptSubmittedAt?: string | null;
  paymentConfirmedAt?: string | null;
  paymentConfirmedBy?: string | null;
  paymentNote?: string | null;
  status: CustomWigOrderStatus;
  statusHistory: CustomWigStatusHistory[];
  createdAt: string;
  updatedAt: string;
};

export type CustomWigOrderListParams = {
  status?: CustomWigOrderStatus;
  page?: number;
  limit?: number;
};

export type CustomWigOrderListResponse = {
  success: boolean;
  totalRequests: number;
  currentPage: number;
  totalPages: number;
  requests: AdminCustomWigOrder[];
};

export type CustomWigOrderDetailsResponse = {
  success: boolean;
  request: AdminCustomWigOrder;
};

export type CustomWigOrderActionResponse = {
  success: boolean;
  message: string;
  request: AdminCustomWigOrder;
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

export const customWigOrderService = {
  list: (params: CustomWigOrderListParams = {}) => {
    const query = buildQuery(params);

    return apiRequest<CustomWigOrderListResponse>(
      `/admin/custom-wig-orders${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: string) =>
    apiRequest<CustomWigOrderDetailsResponse>(`/admin/custom-wig-orders/${id}`),

  sendQuotation: (
    id: string,
    data: {
      quoteAmount: number;
      quoteNote?: string;
      validityDays?: number;
    },
  ) =>
    apiRequest<CustomWigOrderActionResponse>(`/admin/custom-wig-orders/${id}/quotation`, {
      method: "PATCH",
      body: data,
    }),

  confirmPayment: (id: string) =>
    apiRequest<CustomWigOrderActionResponse>(`/admin/custom-wig-orders/${id}/payment/confirm`, {
      method: "PATCH",
    }),

  rejectPayment: (id: string, reason: string) =>
    apiRequest<CustomWigOrderActionResponse>(`/admin/custom-wig-orders/${id}/payment/reject`, {
      method: "PATCH",
      body: { reason },
    }),

  updateStatus: (
    id: string,
    data: {
      status: CustomWigOrderStatus;
      note?: string;
    },
  ) =>
    apiRequest<CustomWigOrderActionResponse>(`/admin/custom-wig-orders/${id}/status`, {
      method: "PATCH",
      body: data,
    }),
};
