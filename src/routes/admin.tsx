import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Cake,
  Gift,
  Image,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Percent,
  RefreshCw,
  Settings,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import ProductsManagement from "@/components/admin/products-management";
import { useAuth } from "@/context/auth";
import {
  adminDashboardService,
  type DashboardOverview,
  type FinancialSummary,
} from "@/services/admin-dashboard.service";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | HairbyOma" },
      { name: "description", content: "HairbyOma store administration dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

const menu = [
  [LayoutDashboard, "Overview"],
  [ShoppingBag, "Products"],
  [Package, "Orders"],
  [Users, "Customers"],
  [MessageSquare, "Custom orders"],
  [Star, "Reviews"],
  [Image, "Gallery"],
  [Gift, "Rewards"],
  [Cake, "Birthdays"],
  [Users, "Referrals"],
  [Percent, "Promotions"],
  [Settings, "Settings"],
] as const;

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Page() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError("");

    try {
      const response = await adminDashboardService.overview();
      setDashboard(response);
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard information. Please try again.",
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      void loadDashboard();
    }
  }, [authLoading, user, loadDashboard]);

  if (authLoading) {
    return <AccessLoading />;
  }

  if (!user) {
    return (
      <AccessMessage
        title="Admin sign-in required"
        message="Please sign in with your administrator account to access the dashboard."
      >
        <Button asChild>
          <Link to="/auth" search={{ next: "/admin" }}>
            Sign in
          </Link>
        </Button>
      </AccessMessage>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <AccessMessage
        title="Access denied"
        message="You do not have permission to access the HairbyOma administration dashboard."
      >
        <Button asChild variant="outline">
          <Link to="/">Return to store</Link>
        </Button>
      </AccessMessage>
    );
  }

  return (
    <div className="min-h-screen bg-muted/35">
      <div className="site-container py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Store management</p>
            <h1 className="mt-2 text-3xl md:text-4xl">HairbyOma Admin</h1>
            <p className="mt-2 text-sm text-muted-foreground">Welcome back, {user.firstName}.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/">Preview store</Link>
            </Button>
            <Button variant="ghost" onClick={() => void signOut()} className="gap-2">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </header>

        <div className="mt-7 grid gap-6 lg:grid-cols-[14rem_1fr]">
          <aside className="h-fit border bg-background p-2">
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
              {menu.map(([Icon, label]) => (
                <Button
                  key={label}
                  variant={tab === label ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setTab(label)}
                >
                  <Icon className="size-4" />
                  <span className="truncate">{label}</span>
                </Button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            {tab === "Overview" ? (
              <Overview
                dashboard={dashboard}
                loading={loadingDashboard}
                error={dashboardError}
                onRetry={() => void loadDashboard()}
              />
            ) : tab === "Products" ? (
              <ProductsManagement />
            ) : (
              <ModulePlaceholder title={tab} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function AccessLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

function AccessMessage({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[65vh] place-items-center px-4">
      <section className="max-w-md border bg-background p-8 text-center">
        <AlertCircle className="mx-auto size-9 text-primary" />
        <h1 className="mt-4 text-2xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}

function Overview({
  dashboard,
  loading,
  error,
  onRetry,
}: {
  dashboard: DashboardOverview | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading && !dashboard) {
    return (
      <div className="grid min-h-80 place-items-center border bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading your store statistics...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="border bg-background p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-destructive" />
        <h2 className="mt-4 text-xl">Dashboard unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button onClick={onRetry} className="mt-5 gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = dashboard.statistics;
  const currencies = stats.revenue.collectedByCurrency;
  const primaryCurrency = currencies.find((item) => item.currency === "NGN") ?? currencies[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Store performance</p>
          <h2 className="mt-1 text-2xl">Overview</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} disabled={loading} className="gap-2">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh data
        </Button>
      </div>

      {error && (
        <div className="border border-destructive/30 bg-background p-3 text-sm text-destructive">
          {error} Showing the last successfully loaded data.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total orders"
          value={stats.orders.total.toLocaleString()}
          detail={`${stats.orders.pending} pending`}
          icon={ShoppingBag}
        />
        <Metric
          label="Awaiting payment"
          value={stats.orders.awaitingPayment.toLocaleString()}
          detail="Orders awaiting payment"
          icon={Activity}
        />
        <Metric
          label="Total customers"
          value={stats.customers.total.toLocaleString()}
          detail={`${stats.customers.active} active customers`}
          icon={Users}
        />
        <Metric
          label="Products"
          value={stats.products.totalProducts.toLocaleString()}
          detail={`${stats.products.activeProducts} active products`}
          icon={Package}
        />
      </div>

      <section className="border bg-background p-5 md:p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <h3 className="text-xl">Revenue collected</h3>
        </div>
        {currencies.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No collected revenue to display yet.</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {currencies.map((item) => (
              <RevenueCard key={item.currency} item={item} />
            ))}
          </div>
        )}
        {primaryCurrency && (
          <p className="mt-4 text-xs text-muted-foreground">
            Revenue is displayed separately by currency. Different currencies are not combined.
          </p>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <SalesTrend currencies={stats.salesAnalytics.dailyTrend} />
        <TopProducts products={stats.salesAnalytics.bestSellingProducts} />
      </div>

      <section className="border bg-background p-5 md:p-6">
        <h3 className="text-xl">Recent orders</h3>
        {stats.orders.recentOrders.length === 0 ? (
          <EmptyMessage message="No orders have been placed yet." />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="p-3 font-medium">Order</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Payment</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.orders.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{order.orderNumber}</td>
                    <td className="p-3">
                      {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Guest"}
                    </td>
                    <td className="p-3">{formatCurrency(order.totalAmount, order.currency)}</td>
                    <td className="p-3">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Appointments"
          icon={Cake}
          total={stats.appointments.total}
          items={[
            ["Pending", stats.appointments.pending],
            ["Confirmed", stats.appointments.confirmed],
            ["Completed", stats.appointments.completed],
          ]}
        />
        <SummaryCard
          title="Custom wig orders"
          icon={Package}
          total={stats.customWigOrders.total}
          items={[
            ["Under review", stats.customWigOrders.underReview],
            ["In production", stats.customWigOrders.inProduction],
            ["Delivered", stats.customWigOrders.delivered],
          ]}
        />
        <SummaryCard
          title="Campaigns"
          icon={Percent}
          total={stats.campaigns.total}
          items={[
            ["Draft", stats.campaigns.draft],
            ["Active", stats.campaigns.active],
            ["Ended", stats.campaigns.ended],
          ]}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Metric
          label="Low-stock products"
          value={stats.products.lowStockProducts.toLocaleString()}
          detail={`${stats.products.outOfStockProducts} out of stock`}
          icon={ArrowDownRight}
        />
        <Metric
          label="Net collected"
          value={
            primaryCurrency
              ? formatCurrency(primaryCurrency.netCollected, primaryCurrency.currency)
              : "�"
          }
          detail={
            primaryCurrency ? `${primaryCurrency.paidOrders} paid orders` : "No revenue recorded"
          }
          icon={ArrowUpRight}
        />
      </section>

      <p className="text-right text-xs text-muted-foreground">
        Last updated: {formatDate(dashboard.generatedAt)}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof ShoppingBag;
}) {
  return (
    <div className="border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-5 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function RevenueCard({ item }: { item: FinancialSummary }) {
  return (
    <div className="border p-4">
      <p className="text-sm text-muted-foreground">{item.currency} net revenue</p>
      <p className="mt-2 text-2xl font-semibold">
        {formatCurrency(item.netCollected, item.currency)}
      </p>
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <p>Gross: {formatCurrency(item.grossCollected, item.currency)}</p>
        <p>Refunds: {formatCurrency(item.refundsProcessed, item.currency)}</p>
        <p>{item.paidOrders} paid orders</p>
      </div>
    </div>
  );
}

function SalesTrend({
  currencies,
}: {
  currencies: DashboardOverview["statistics"]["salesAnalytics"]["dailyTrend"];
}) {
  const availableCurrencies = Array.from(
    new Set(currencies.flatMap((day) => day.collectedByCurrency.map((item) => item.currency))),
  );

  const [selectedCurrency, setSelectedCurrency] = useState("NGN");

  useEffect(() => {
    const firstCurrency = availableCurrencies[0];

    if (firstCurrency && !availableCurrencies.includes(selectedCurrency)) {
      setSelectedCurrency(firstCurrency);
    }
  }, [availableCurrencies, selectedCurrency]);

  const chartData = currencies.map((day) => ({
    date: new Date(`${day.date}T12:00:00`).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    }),
    revenue:
      day.collectedByCurrency.find((item) => item.currency === selectedCurrency)?.netCollected ?? 0,
  }));

  return (
    <section className="min-w-0 border bg-background p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl">Sales trend</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Net revenue collected over the last seven days
          </p>
        </div>
        {availableCurrencies.length > 1 && (
          <select
            value={selectedCurrency}
            onChange={(event) => setSelectedCurrency(event.target.value)}
            className="border bg-background px-3 py-2 text-sm"
            aria-label="Sales chart currency"
          >
            {availableCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        )}
      </div>

      {availableCurrencies.length === 0 ? (
        <EmptyMessage message="No sales data available yet." />
      ) : (
        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={65}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value), selectedCurrency),
                  "Net revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function TopProducts({
  products,
}: {
  products: DashboardOverview["statistics"]["salesAnalytics"]["bestSellingProducts"];
}) {
  return (
    <section className="border bg-background p-5 md:p-6">
      <h3 className="text-xl">Best-selling products</h3>
      <p className="mt-1 text-xs text-muted-foreground">Products ranked by units sold</p>

      {products.length === 0 ? (
        <EmptyMessage message="No product sales recorded yet." />
      ) : (
        <div className="mt-4 space-y-4">
          {products.slice(0, 6).map((product) => (
            <div
              key={`${product.productId}-${product.currency}`}
              className="flex items-center justify-between gap-4 border-b pb-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.productName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(product.productSubtotal, product.currency)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold">{product.quantitySold} sold</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  title,
  icon: Icon,
  total,
  items,
}: {
  title: string;
  icon: typeof Cake;
  total: number;
  items: [string, number][];
}) {
  return (
    <section className="border bg-background p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">{title}</h3>
        <Icon className="size-5 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl">{total}</p>
      <div className="mt-4 space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm text-muted-foreground">
            <span>{label}</span>
            <strong className="text-foreground">{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs">
      {status.replace(/_/g, " ")}
    </span>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>;
}

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <section className="border bg-background p-6 md:p-8">
      <p className="eyebrow">Management</p>
      <h2 className="mt-2 text-3xl">{title}</h2>
      <div className="mt-8 grid min-h-64 place-items-center border border-dashed p-6 text-center">
        <div>
          <Package className="mx-auto size-8 text-primary" />
          <h3 className="mt-4 text-lg">{title} management</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            This section has not been connected to its backend management endpoints yet. The
            dashboard overview is live; this module will be implemented next.
          </p>
        </div>
      </div>
    </section>
  );
}
