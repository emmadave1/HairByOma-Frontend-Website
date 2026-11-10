import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminOrderService,
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/services/order.service";

const PAGE_SIZE = 10;

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
];

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function formatCurrency(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "ï¿½";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className="whitespace-nowrap">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function OrdersManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await adminOrderService.list({
          ...(orderFilter !== "all" ? { orderStatus: orderFilter as OrderStatus } : {}),
          ...(paymentFilter !== "all" ? { paymentStatus: paymentFilter as PaymentStatus } : {}),
          page,
          limit: PAGE_SIZE,
        });

        setOrders(response.orders);
        setTotalOrders(response.totalOrders);
        setTotalPages(Math.max(response.totalPages, 1));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load orders. Please try again.";

        setError(message);
        if (showRefresh) toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderFilter, paymentFilter, page],
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const refreshOrders = async () => {
    await loadOrders(true);
  };

  const updateOrderStatus = async (order: AdminOrder, newStatus: OrderStatus) => {
    if (
      !window.confirm(
        `Change order ${order.orderNumber} from ${order.orderStatus} to ${newStatus}?`,
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await adminOrderService.updateStatus(order._id, newStatus);
      toast.success(`Order ${order.orderNumber} updated successfully.`);
      setSelectedOrder(null);
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update order status.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmPayment = async (order: AdminOrder) => {
    if (
      !window.confirm(
        `Have you verified the bank transfer for ${order.orderNumber} in the business bank account? Only confirm if the funds have been received.`,
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await adminOrderService.confirmPayment(order._id);
      toast.success("Payment confirmed successfully.");
      setSelectedOrder(null);
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to confirm payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectPayment = async (order: AdminOrder) => {
    const reason = window.prompt(
      `Enter the reason for rejecting payment for ${order.orderNumber}:`,
    );

    if (reason === null) return;

    if (!reason.trim()) {
      toast.error("A rejection reason is required.");
      return;
    }

    if (reason.trim().length > 500) {
      toast.error("The rejection reason cannot exceed 500 characters.");
      return;
    }

    setActionLoading(true);

    try {
      await adminOrderService.rejectPayment(order._id, reason.trim());
      toast.success("Payment rejected.");
      setSelectedOrder(null);
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reject payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmRefund = async (order: AdminOrder) => {
    if (
      !window.confirm(
        `Confirm that the refund for ${order.orderNumber} has actually been sent to the customer?`,
      )
    ) {
      return;
    }

    const refundNote = window.prompt("Add an optional refund note:");

    if (refundNote === null) return;

    if (refundNote.trim().length > 500) {
      toast.error("The refund note cannot exceed 500 characters.");
      return;
    }

    setActionLoading(true);

    try {
      await adminOrderService.confirmRefund(order._id, refundNote.trim());
      toast.success("Refund marked as completed.");
      setSelectedOrder(null);
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to confirm refund.");
    } finally {
      setActionLoading(false);
    }
  };

  const customerName = (order: AdminOrder) => {
    const name = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ");
    return name || order.deliveryFullName || "Customer";
  };

  if (loading) {
    return (
      <div className="grid min-h-80 place-items-center border bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-1 text-2xl">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View orders, verify payments, and manage fulfilment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshOrders()}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Order status</span>
          <select
            value={orderFilter}
            onChange={(event) => {
              setOrderFilter(event.target.value);
              setPage(1);
            }}
            className="h-10 w-full border bg-background px-3"
          >
            <option value="all">All order statuses</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Payment status</span>
          <select
            value={paymentFilter}
            onChange={(event) => {
              setPaymentFilter(event.target.value);
              setPage(1);
            }}
            className="h-10 w-full border bg-background px-3"
          >
            <option value="all">All payment statuses</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-background p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void refreshOrders()}
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="border bg-background p-10 text-center">
          <p className="text-lg font-medium">No orders found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders matching your selected filters will appear here.
          </p>
        </div>
      ) : (
        !error && (
          <section className="border bg-background">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
              <p className="text-sm text-muted-foreground">
                {totalOrders.toLocaleString()} order{totalOrders === 1 ? "" : "s"} found
              </p>
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground">
                    <th className="p-3 font-medium">Order</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Payment</th>
                    <th className="p-3 font-medium">Order status</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{order.orderNumber}</td>
                      <td className="p-3">{customerName(order)}</td>
                      <td className="p-3 whitespace-nowrap">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="p-3">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="size-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 border-t p-3">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalOrders)} of{" "}
                {totalOrders}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </section>
        )
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 py-8 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !actionLoading) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="my-auto w-full max-w-3xl space-y-6 border bg-background p-5 shadow-xl sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
              <div>
                <p className="eyebrow">Order details</p>
                <h3 id="order-details-title" className="mt-1 text-2xl">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Order status</h4>
                <StatusBadge status={selectedOrder.orderStatus} />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Payment status</h4>
                <StatusBadge status={selectedOrder.paymentStatus} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Customer information</h4>
              <div className="grid gap-2 border p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Name:</span> {customerName(selectedOrder)}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {selectedOrder.user?.email || "ï¿½"}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {selectedOrder.user?.phone || selectedOrder.deliveryPhone}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Items ordered</h4>
              <div className="divide-y border">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex flex-wrap justify-between gap-3 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[item.length, item.texture, item.quantity ? `Qty: ${item.quantity}` : ""]
                          .filter(Boolean)
                          .join(" ï¿½ ")}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.subtotal, selectedOrder.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Delivery information</h4>
              <div className="space-y-1 border p-4 text-sm">
                <p className="font-medium">{selectedOrder.deliveryFullName}</p>
                <p>{selectedOrder.deliveryAddress}</p>
                <p>
                  {[selectedOrder.deliveryCity, selectedOrder.deliveryState]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{selectedOrder.deliveryPhone}</p>
                {selectedOrder.deliveryAdditionalInfo && (
                  <p className="pt-2 text-muted-foreground">
                    Additional information: {selectedOrder.deliveryAdditionalInfo}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Payment information</h4>
              <div className="space-y-2 border p-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Method:</span>{" "}
                  {selectedOrder.paymentMethod || "ï¿½"}
                </p>
                <p>
                  <span className="text-muted-foreground">Reference:</span>{" "}
                  {selectedOrder.paymentReference || "ï¿½"}
                </p>
                <p>
                  <span className="text-muted-foreground">Receipt submitted:</span>{" "}
                  {selectedOrder.paymentReceiptSubmitted ? "Yes" : "No"}
                </p>
                {selectedOrder.paymentReceiptSubmittedAt && (
                  <p>
                    <span className="text-muted-foreground">Receipt submitted at:</span>{" "}
                    {formatDate(selectedOrder.paymentReceiptSubmittedAt)}
                  </p>
                )}
                {selectedOrder.paymentConfirmedAt && (
                  <p>
                    <span className="text-muted-foreground">Payment confirmed at:</span>{" "}
                    {formatDate(selectedOrder.paymentConfirmedAt)}
                  </p>
                )}
                {selectedOrder.paymentNote && (
                  <p>
                    <span className="text-muted-foreground">Payment note:</span>{" "}
                    {selectedOrder.paymentNote}
                  </p>
                )}
                {selectedOrder.paymentMethod === "BANK_TRANSFER" &&
                  selectedOrder.paymentStatus === "PENDING" && (
                    <p className="border border-amber-500/30 bg-amber-500/5 p-3 text-amber-700">
                      Verify the transfer directly in the business bank account and check the
                      customer's WhatsApp submission. The receipt itself is not stored in the order
                      record.
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Order summary</h4>
              <div className="space-y-2 border p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee, selectedOrder.currency)}</span>
                </div>
                {Boolean(selectedOrder.couponDiscount) && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      Coupon {selectedOrder.couponCode || ""}
                    </span>
                    <span>
                      -{formatCurrency(selectedOrder.couponDiscount || 0, selectedOrder.currency)}
                    </span>
                  </div>
                )}
                {Boolean(selectedOrder.loyaltyDiscount) && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Loyalty discount</span>
                    <span>
                      -{formatCurrency(selectedOrder.loyaltyDiscount || 0, selectedOrder.currency)}
                    </span>
                  </div>
                )}
                {Boolean(selectedOrder.referralDiscount) && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Referral discount</span>
                    <span>
                      -{formatCurrency(selectedOrder.referralDiscount || 0, selectedOrder.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-3 border-t pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Order history</h4>
              {selectedOrder.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status history available.</p>
              ) : (
                <div className="space-y-3 border-l-2 pl-4">
                  {selectedOrder.statusHistory.map((entry, index) => (
                    <div
                      key={`${entry.status}-${entry.changedAt}-${index}`}
                      className="relative text-sm"
                    >
                      <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                      <p className="font-medium">{entry.status.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.changedAt)}</p>
                      {entry.note && <p className="mt-1 text-muted-foreground">{entry.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t pt-5">
              <h4 className="font-semibold">Order actions</h4>

              {selectedOrder.paymentMethod === "BANK_TRANSFER" &&
                selectedOrder.paymentStatus === "PENDING" &&
                selectedOrder.orderStatus !== "CANCELLED" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={actionLoading || !selectedOrder.paymentReceiptSubmitted}
                      onClick={() => void confirmPayment(selectedOrder)}
                    >
                      {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Confirm payment
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={actionLoading}
                      onClick={() => void rejectPayment(selectedOrder)}
                    >
                      Reject payment
                    </Button>
                  </div>
                )}

              {selectedOrder.paymentMethod === "BANK_TRANSFER" &&
                selectedOrder.paymentStatus === "PENDING" &&
                !selectedOrder.paymentReceiptSubmitted && (
                  <p className="text-xs text-muted-foreground">
                    Payment actions are unavailable until the customer submits their transfer
                    receipt.
                  </p>
                )}

              {selectedOrder.orderStatus === "CANCELLED" &&
                selectedOrder.paymentStatus === "REFUND_PENDING" && (
                  <Button
                    disabled={actionLoading}
                    onClick={() => void confirmRefund(selectedOrder)}
                  >
                    {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Confirm refund sent
                  </Button>
                )}

              {nextStatuses[selectedOrder.orderStatus].filter(
                (status) => status === "CANCELLED" || selectedOrder.paymentStatus === "PAID",
              ).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Available order-status transitions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses[selectedOrder.orderStatus]
                      .filter(
                        (status) =>
                          status === "CANCELLED" || selectedOrder.paymentStatus === "PAID",
                      )
                      .map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={status === "CANCELLED" ? "destructive" : "outline"}
                          disabled={actionLoading}
                          onClick={() => void updateOrderStatus(selectedOrder, status)}
                        >
                          {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                          {status === "CANCELLED" ? "Cancel order" : `Mark ${status.toLowerCase()}`}
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              {selectedOrder.orderStatus === "DELIVERED" && (
                <p className="text-sm text-muted-foreground">
                  This order has been delivered. No further status changes are available.
                </p>
              )}

              {selectedOrder.orderStatus === "CANCELLED" &&
                selectedOrder.paymentStatus !== "REFUND_PENDING" && (
                  <p className="text-sm text-muted-foreground">
                    This order has been cancelled. No further status changes are available.
                  </p>
                )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default OrdersManagement;
