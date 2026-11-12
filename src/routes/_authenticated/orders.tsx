import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, ShoppingBag, Loader2, RefreshCw } from "lucide-react";
import { customerOrderService, type CustomerOrder } from "@/services/order.service";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My Orders - HairbyOma" },
      { name: "description", content: "View and track your HairbyOma purchases." },
    ],
  }),
  component: OrdersPage,
});

function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

function orderStatusStyle(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-50 text-green-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700";
    case "PROCESSING":
    case "CONFIRMED":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function paymentStatusStyle(status: string) {
  if (status === "PAID") return "bg-green-50 text-green-700";
  if (status === "FAILED" || status === "REFUNDED") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await customerOrderService.getMyOrders();
      setOrders(response.orders);
    } catch {
      setError("We couldn't load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Your purchases
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-primary">My Orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View your purchases and keep track of their progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh orders
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-5 py-16 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-100 bg-card px-6 py-12 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-4 text-sm font-semibold text-primary hover:text-primary"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-2xl text-primary">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            You haven't placed an order yet. Your purchases will appear here once you shop with us.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Explore the collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-primary">Order history</h2>
            <span className="text-xs text-muted-foreground">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </span>
          </div>

          {orders.map((order) => (
            <article
              key={order._id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  <p className="text-xs text-muted-foreground">Order number</p>
                  <p className="mt-1 font-semibold text-primary">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${orderStatusStyle(order.orderStatus)}`}>
                    {statusLabel(order.orderStatus)}
                  </span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${paymentStatusStyle(order.paymentStatus)}`}>
                    Payment: {statusLabel(order.paymentStatus)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-5 py-5 sm:px-7">
                {order.items.map((item, index) => (
                  <div
                    key={`${order._id}-${index}`}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-primary">{item.productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Quantity: {item.quantity}
                        {item.length ? ` � ${item.length}` : ""}
                        {item.texture ? ` � ${item.texture}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-primary">
                      {formatCurrency(item.subtotal, order.currency)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border bg-muted px-5 py-4 sm:px-7">
                <div>
                  <p className="text-xs text-muted-foreground">Order total</p>
                  <p className="mt-1 text-lg font-semibold text-primary">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
