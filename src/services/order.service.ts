import { apiRequest } from "@/lib/api";

export type OrderStatus =
  "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUND_PENDING" | "REFUNDED";

export type PaymentMethod = "PAYSTACK" | "FLUTTERWAVE" | "BANK_TRANSFER";

export type AdminOrderItem = {
  product: string;
  productName: string;
  variantId?: string | null;
  length?: string | null;
  texture?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type AdminOrderCustomer = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type OrderStatusHistory = {
  status: OrderStatus;
  note?: string | null;
  changedBy?: string | null;
  changedAt: string;
};

export type AdminOrder = {
  _id: string;
  orderNumber: string;
  user: AdminOrderCustomer;
  items: AdminOrderItem[];

  deliveryAddress: string;
  deliveryFullName: string;
  deliveryAdditionalInfo?: string;
  deliveryPhone: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryFee: number;

  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  referralDiscount?: number;
  referralDiscountType?: "WELCOME" | "REFERRER_REWARD" | null;
  couponCode?: string | null;
  couponDiscount?: number;

  currency: string;
  totalAmount: number;

  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  paymentReceiptSubmitted: boolean;
  paymentReceiptSubmittedAt?: string | null;
  paymentConfirmedAt?: string | null;
  paymentNote?: string | null;
  paymentMethod?: PaymentMethod | null;

  refundNote?: string | null;
  refundedAt?: string | null;

  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  deliveredAt?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AdminOrderListParams = {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
};

export type AdminOrderListResponse = {
  success: boolean;
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  orders: AdminOrder[];
};

type OrderActionResponse = {
  success: boolean;
  message: string;
  order: AdminOrder;
};

export const adminOrderService = {
  list: (params: AdminOrderListParams = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.set(key, String(value));
      }
    });

    const suffix = query.toString();

    return apiRequest<AdminOrderListResponse>(`/admin/orders${suffix ? `?${suffix}` : ""}`);
  },

  updateStatus: (id: string, orderStatus: OrderStatus) =>
    apiRequest<OrderActionResponse>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: { orderStatus },
    }),

  confirmPayment: (id: string) =>
    apiRequest<OrderActionResponse>(`/admin/orders/${id}/payment/confirm`, {
      method: "PATCH",
    }),

  rejectPayment: (id: string, reason: string) =>
    apiRequest<OrderActionResponse>(`/admin/orders/${id}/payment/reject`, {
      method: "PATCH",
      body: { reason },
    }),

  confirmRefund: (id: string, refundNote?: string) =>
    apiRequest<OrderActionResponse>(`/admin/orders/${id}/refund/confirm`, {
      method: "PATCH",
      body: { refundNote },
    }),
};

export type CustomerOrder = {
  _id: string;
  orderNumber: string;
  items: AdminOrderItem[];
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod | null;
  paymentReceiptSubmitted: boolean;
  paymentReceiptSubmittedAt?: string | null;
  paymentConfirmedAt?: string | null;
  refundedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CustomerOrderListResponse = {
  success: boolean;
  count: number;
  orders: CustomerOrder[];
};

export const customerOrderService = {
  getMyOrders: () => apiRequest<CustomerOrderListResponse>("/orders"),
};
