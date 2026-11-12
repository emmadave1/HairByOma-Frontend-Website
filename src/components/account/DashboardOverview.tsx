import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Gift, Heart, Loader2, Package, Share2, ShoppingBag } from "lucide-react";
import { customerOrderService, type CustomerOrder } from "@/services/order.service";
import { loyaltyService } from "@/services/loyalty.service";
import { useAuth } from "@/context/auth";
import { useStore } from "@/context/store";

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
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function DashboardOverview() {
  const { user } = useAuth();
  const { wishlist } = useStore();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [points, setPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;

    customerOrderService
      .getMyOrders()
      .then(({ orders: customerOrders }) => {
        if (active) setOrders(customerOrders);
      })
      .catch(() => {
        if (active) setOrdersError("We couldn't load your orders. Please try again later.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    loyaltyService
      .getMyTransactions()
      .then(({ loyalty }) => {
        if (active) setPoints(loyalty.pointsBalance);
      })
      .catch(() => {
        if (active) setPoints(null);
      })
      .finally(() => {
        if (active) setPointsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const recentOrders = orders.slice(0, 4);

  const summaryCards = [
    {
      label: "Total orders",
      value: ordersLoading ? null : String(orders.length),
      description: "Your purchases",
      icon: Package,
      to: null,
    },
    {
      label: "Reward points",
      value: pointsLoading ? null : points === null ? "Unavailable" : points.toLocaleString("en-NG"),
      description: "Your loyalty balance",
      icon: Gift,
      to: "/rewards" as const,
    },
    {
      label: "Wishlist",
      value: String(wishlist.length),
      description: "Your saved pieces",
      icon: Heart,
      to: "/wishlist" as const,
    },
    {
      label: "Referrals",
      value: null,
      description: "Invite friends and earn rewards",
      icon: Share2,
      to: "/referrals" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-9">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary-foreground/60">
            Your personal space
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-primary-foreground/70">
            Keep track of your orders, discover your benefits and enjoy your HairbyOma experience.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-card px-5 py-3 text-sm font-semibold text-primary transition hover:bg-accent"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account summary
          </p>
          <h2 className="mt-1 font-display text-2xl text-primary">Your activity</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, description, icon: Icon, to }) => {
            const content = (
              <div className="flex h-full min-h-[145px] items-start justify-between rounded-xl border border-border bg-card p-5 transition hover:border-primary/40">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {value === null ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <p className="font-display text-3xl text-primary">{value}</p>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{description}</p>
                </div>

                <div className="rounded-xl bg-muted p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );

            return to ? (
              <Link key={label} to={to} className="block">
                {content}
              </Link>
            ) : (
              <div key={label}>{content}</div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Order activity
            </p>
            <h2 className="mt-1 font-display text-2xl text-primary">Recent orders</h2>
          </div>
          <div className="text-xs text-muted-foreground">
            {ordersLoading
              ? "Loading orders..."
              : `${orders.length} order${orders.length === 1 ? "" : "s"} found`}
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center gap-3 px-5 py-14 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your orders...
          </div>
        ) : ordersError ? (
          <p role="alert" className="px-6 py-10 text-center text-sm text-red-600">
            {ordersError}
          </p>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl text-primary">No orders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your purchases will appear here when you place an order.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary"
            >
              Explore the collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"} • {formatDate(order.createdAt)}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {order.items.map((item) => `${item.productName} • ${item.quantity}`).join(", ")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{statusLabel(order.orderStatus)}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-50 text-green-700"
                        : order.paymentStatus === "FAILED" || order.paymentStatus === "REFUNDED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Payment: {statusLabel(order.paymentStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-muted p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-card p-3 text-primary">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Share the experience
            </p>
            <h2 className="mt-1 font-display text-lg text-primary">
              Good hair is worth sharing.
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInviteDialogOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Invite friends
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary">
              <Gift className="h-6 w-6" />
            </div>
            <DialogTitle className="font-display text-2xl text-primary">
              Good hair is worth sharing.
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6">
              Invite your friends to discover HairbyOma and enjoy the benefits of our referral
              programme. Share the experience and earn rewards when your referrals qualify.
            </DialogDescription>
          </DialogHeader>

          <Link
            to="/referrals"
            onClick={() => setInviteDialogOpen(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Explore referral programme
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
