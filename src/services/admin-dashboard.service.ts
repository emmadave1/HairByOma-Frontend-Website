import { apiRequest } from "@/lib/api";

export type FinancialSummary = {
  currency: string;
  grossCollected: number;
  refundsProcessed: number;
  netCollected: number;
  paidOrders: number;
  refundedOrders: number;
};

export type DashboardOverview = {
  success: boolean;
  message: string;
  statistics: {
    orders: {
      total: number;
      pending: number;
      awaitingPayment: number;
      completedDeliveries: number;
      cancelled: number;
      refundPending: number;
      refunded: number;
      paymentRejected: number;
      recentOrders: Array<{
        _id: string;
        orderNumber: string;
        user: {
          firstName: string;
          lastName: string;
          email: string;
        } | null;
        totalAmount: number;
        currency: string;
        paymentStatus: string;
        orderStatus: string;
        createdAt: string;
      }>;
    };
    customers: {
      total: number;
      active: number;
      inactive: number;
    };
    revenue: {
      collectedByCurrency: FinancialSummary[];
    };
    salesAnalytics: {
      today: FinancialSummary[];
      thisWeek: FinancialSummary[];
      thisMonth: FinancialSummary[];
      thisYear: FinancialSummary[];
      dailyTrend: Array<{
        date: string;
        collectedByCurrency: FinancialSummary[];
      }>;
      bestSellingProducts: Array<{
        productId: string;
        productName: string;
        currency: string;
        quantitySold: number;
        productSubtotal: number;
      }>;
    };
    products: {
      totalProducts: number;
      activeProducts: number;
      inactiveProducts: number;
      featuredProducts: number;
      totalAvailableStock: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      lowStockThreshold: number;
    };
    appointments: {
      total: number;
      pending: number;
      confirmed: number;
      rejected: number;
      completed: number;
      cancelled: number;
      noShow: number;
      recentAppointments: Array<{
        bookingNumber: string;
        serviceName: string;
        startAt: string;
        price: number;
        currency: string;
        status: string;
        user: {
          firstName: string;
          lastName: string;
          email: string;
        } | null;
      }>;
    };
    customWigOrders: {
      total: number;
      submitted: number;
      underReview: number;
      awaitingCustomerApproval: number;
      approved: number;
      awaitingPayment: number;
      paid: number;
      inProduction: number;
      qualityCheck: number;
      readyForDispatch: number;
      shipped: number;
      delivered: number;
      rejected: number;
      cancelled: number;
      quoteExpired: number;
      recentCustomWigOrders: Array<{
        requestNumber: string;
        wigType: string;
        hairType: string;
        texture: string;
        length: string;
        quoteAmount: number;
        quoteCurrency: string;
        status: string;
        createdAt: string;
        user: {
          firstName: string;
          lastName: string;
          email: string;
        } | null;
      }>;
    };
    campaigns: {
      total: number;
      draft: number;
      scheduled: number;
      active: number;
      ended: number;
      cancelled: number;
      announcements: {
        notSent: number;
        sending: number;
        sent: number;
        failed: number;
        campaignsWithFailedOrUnresolvedAnnouncements: number;
        recentCampaigns: Array<{
          name: string;
          slug: string;
          status: string;
          startsAt: string;
          endsAt: string;
          announcementStatus: string;
          announcementSentAt: string | null;
          createdAt: string;
        }>;
      };
    };
  };
  generatedAt: string;
};

export const adminDashboardService = {
  overview: () => apiRequest<DashboardOverview>("/admin/dashboard/overview"),
};
