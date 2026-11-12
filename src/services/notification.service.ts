import { apiRequest } from "@/lib/api";

export type NotificationType =
  | "BIRTHDAY_WISH"
  | "PASSWORD_RESET_SUCCESS"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_REACTIVATED"
  | "ORDER_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_REJECTED"
  | "PAYMENT_RECEIPT_SUBMITTED"
  | "ORDER_STATUS_CHANGED"
  | "ORDER_CANCELLED"
  | "REFUND_CONFIRMED"
  | "LOYALTY_POINTS_EARNED"
  | "REFERRAL_REWARD_EARNED"
  | "NEW_PRODUCT"
  | "BACK_IN_STOCK"
  | "CUSTOM_WIG_REQUEST_SUBMITTED"
  | "CUSTOM_WIG_QUOTATION_READY"
  | "CUSTOM_WIG_STATUS_CHANGED"
  | "APPOINTMENT_BOOKING_SUBMITTED"
  | "APPOINTMENT_BOOKING_CONFIRMED"
  | "APPOINTMENT_BOOKING_CANCELLED"
  | "APPOINTMENT_BOOKING_RESCHEDULED"
  | "APPOINTMENT_BOOKING_REMINDER"
  | "APPOINTMENT_BOOKING_REJECTED"
  | "APPOINTMENT_BOOKING_STATUS_CHANGED"
  | "ADMIN_ANNOUNCEMENT"
  | "PROMOTIONAL_CAMPAIGN_ANNOUNCEMENT"
  | "HAIR_REVAMPING_REMINDER"
  | "PRODUCT_REVIEW_REQUEST";

export type CustomerNotification = {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: string | null;
  product?: string | null;
  customWigOrder?: string | null;
  appointment?: string | null;
};

export type NotificationsResponse = {
  success: boolean;
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
  notifications: CustomerNotification[];
};

export type UnreadCountResponse = {
  success: boolean;
  unreadCount: number;
};

export const notificationService = {
  getMyNotifications: (page = 1, limit = 20) =>
    apiRequest<NotificationsResponse>(
      `/notifications?page=${page}&limit=${limit}`,
    ),

  getUnreadCount: () =>
    apiRequest<UnreadCountResponse>("/notifications/unread-count"),

  markAsRead: (id: string) =>
    apiRequest<{
      success: boolean;
      message: string;
      notification: CustomerNotification;
    }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiRequest<{ success: boolean; message: string }>(
      "/notifications/read-all",
      {
        method: "PATCH",
      },
    ),
};
