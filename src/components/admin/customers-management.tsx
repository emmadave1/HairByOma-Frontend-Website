import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  UserX,
  ShoppingBag,
  Gift,
  Mail,
  Phone,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  adminCustomerService,
  type AdminCustomer,
  type AdminLoyaltyTransaction,
  type CustomerStatus,
} from "@/services/admin-customer.service";
import type { AdminOrder } from "@/services/order.service";

const PAGE_SIZE = 10;

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

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

function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-green-500/30 bg-green-500/10 text-green-600"
          : "border-red-500/30 bg-red-500/10 text-red-600"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function TransactionBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    EARN: "border-green-500/30 bg-green-500/10 text-green-600",
    REDEEM: "border-blue-500/30 bg-blue-500/10 text-blue-600",
    REVERSAL: "border-red-500/30 bg-red-500/10 text-red-600",
  };

  return (
    <Badge variant="outline" className={styles[type] || ""}>
      {type}
    </Badge>
  );
}

function CustomersManagement() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("profile");

  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [transactions, setTransactions] = useState<AdminLoyaltyTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPages, setTransactionsPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [statusTarget, setStatusTarget] = useState<AdminCustomer | null>(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  const loadCustomers = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await adminCustomerService.list({
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(statusFilter !== "all" ? { status: statusFilter as CustomerStatus } : {}),
          page,
          limit: PAGE_SIZE,
        });

        setCustomers(response.customers);
        setTotalCustomers(response.totalCustomers);
        setTotalPages(Math.max(response.totalPages, 1));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load customers. Please try again.";

        setError(message);

        if (showRefresh) toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, page],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadCustomers();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [loadCustomers]);

  const openCustomerDetails = async (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setCustomerDialogOpen(true);
    setDetailsLoading(true);
    setActiveDetailTab("profile");

    setCustomerOrders([]);
    setTransactions([]);
    setOrdersPage(1);
    setTransactionsPage(1);

    try {
      const response = await adminCustomerService.getById(customer._id);
      setSelectedCustomer(response.customer);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load customer details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadCustomerOrders = useCallback(async () => {
    if (!selectedCustomer) return;

    setOrdersLoading(true);

    try {
      const response = await adminCustomerService.getOrders(
        selectedCustomer._id,
        ordersPage,
        PAGE_SIZE,
      );

      setCustomerOrders(response.orders);
      setTotalOrders(response.totalOrders);
      setOrdersPages(Math.max(response.totalPages, 1));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load customer orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, [selectedCustomer?._id, ordersPage]);

  const loadCustomerTransactions = useCallback(async () => {
    if (!selectedCustomer) return;

    setTransactionsLoading(true);

    try {
      const response = await adminCustomerService.getLoyaltyTransactions(selectedCustomer._id, {
        page: transactionsPage,
        limit: PAGE_SIZE,
      });

      setTransactions(response.transactions);
      setTotalTransactions(response.totalTransactions);
      setTransactionsPages(Math.max(response.totalPages, 1));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load loyalty transactions.");
    } finally {
      setTransactionsLoading(false);
    }
  }, [selectedCustomer?._id, transactionsPage]);

  useEffect(() => {
    if (customerDialogOpen && activeDetailTab === "orders") {
      void loadCustomerOrders();
    }
  }, [customerDialogOpen, activeDetailTab, loadCustomerOrders]);

  useEffect(() => {
    if (customerDialogOpen && activeDetailTab === "loyalty") {
      void loadCustomerTransactions();
    }
  }, [customerDialogOpen, activeDetailTab, loadCustomerTransactions]);

  const handleStatusChange = async () => {
    if (!statusTarget) return;

    const customer = statusTarget;
    const nextStatus = !customer.isActive;

    setStatusActionLoading(true);

    try {
      const response = await adminCustomerService.updateStatus(customer._id, nextStatus);

      toast.success(response.message);

      setCustomers((previous) =>
        previous.map((item) =>
          item._id === customer._id ? { ...item, isActive: nextStatus } : item,
        ),
      );

      setSelectedCustomer((previous) =>
        previous?._id === customer._id ? { ...previous, isActive: nextStatus } : previous,
      );

      setStatusTarget(null);
      void loadCustomers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update customer status.");
    } finally {
      setStatusActionLoading(false);
    }
  };

  const startIndex = totalCustomers === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalCustomers);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Customers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View customer profiles, purchase history and loyalty activity.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadCustomers(true)}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total customers</p>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{totalCustomers.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Current page</p>
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{customers.length}</p>
          <p className="text-xs text-muted-foreground">Customers displayed</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pages</p>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{totalPages}</p>
          <p className="text-xs text-muted-foreground">Customer list pages</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or phone..."
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All customers</option>
          <option value="ACTIVE">Active customers</option>
          <option value="INACTIVE">Inactive customers</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        {error && (
          <div className="flex items-center gap-2 border-b bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => void loadCustomers(true)}
            >
              Retry
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Loyalty points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Users className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="font-medium">No customers found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try changing your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </TableCell>

                  <TableCell>{customer.phone || "Not provided"}</TableCell>

                  <TableCell>
                    <span className="font-medium">
                      {(customer.loyaltyPoints ?? 0).toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell>
                    <CustomerStatusBadge isActive={customer.isActive} />
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDate(customer.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void openCustomerDetails(customer)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex} to {endIndex} of {totalCustomers} customers
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm">
              {page} / {totalPages}
            </span>

            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer details</DialogTitle>
            <DialogDescription>Customer profile, orders and loyalty activity.</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading customer details...</p>
            </div>
          ) : selectedCustomer ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className="break-all text-sm text-muted-foreground">
                    {selectedCustomer.email}
                  </p>
                  <div className="mt-2">
                    <CustomerStatusBadge isActive={selectedCustomer.isActive} />
                  </div>
                </div>

                <Button
                  variant={selectedCustomer.isActive ? "destructive" : "default"}
                  onClick={() => setStatusTarget(selectedCustomer)}
                  disabled={statusActionLoading}
                >
                  {selectedCustomer.isActive ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Suspend customer
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Reactivate customer
                    </>
                  )}
                </Button>
              </div>

              <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Email address
                      </div>
                      <p className="mt-2 break-all text-sm font-medium">{selectedCustomer.email}</p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        Phone number
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {selectedCustomer.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        Date of birth
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {selectedCustomer.dateOfBirth
                          ? formatDate(selectedCustomer.dateOfBirth)
                          : "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        Customer since
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {formatDate(selectedCustomer.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="h-4 w-4" />
                        Loyalty points
                      </div>
                      <p className="mt-2 text-lg font-semibold">
                        {(selectedCustomer.loyaltyPoints ?? 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Referral code
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {selectedCustomer.referralCode || "No referral code"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 font-medium">Referral information</h4>

                    {selectedCustomer.referredBy ? (
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Referred by: </span>
                          {selectedCustomer.referredBy.firstName}{" "}
                          {selectedCustomer.referredBy.lastName}
                        </p>
                        <p className="break-all text-muted-foreground">
                          {selectedCustomer.referredBy.email}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This customer was not referred by another customer.
                      </p>
                    )}

                    <p className="mt-3 text-sm">
                      Welcome referral discount used:{" "}
                      <span className="font-medium">
                        {selectedCustomer.hasUsedReferralDiscount ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 font-medium">Notification preferences</h4>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        Birthday emails:{" "}
                        <span className="font-medium">
                          {selectedCustomer.birthdayEmailsEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                      <p>
                        Birthday wishes:{" "}
                        <span className="font-medium">
                          {selectedCustomer.birthdayWishesEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                      <p>
                        Promotional emails:{" "}
                        <span className="font-medium">
                          {selectedCustomer.promotionalEmailsEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                      <p>
                        Promotional in-app:{" "}
                        <span className="font-medium">
                          {selectedCustomer.promotionalInAppEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                      <p>
                        Abandoned cart emails:{" "}
                        <span className="font-medium">
                          {selectedCustomer.abandonedCartEmailsEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                      <p>
                        New product emails:{" "}
                        <span className="font-medium">
                          {selectedCustomer.newProductEmailsEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                      <p>
                        New product in-app:{" "}
                        <span className="font-medium">
                          {selectedCustomer.newProductInAppEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order history</h4>
                      <p className="text-sm text-muted-foreground">{totalOrders} total orders</p>
                    </div>
                  </div>

                  {ordersLoading ? (
                    <div className="flex min-h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="rounded-lg border p-8 text-center">
                      <ShoppingBag className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                      <p className="font-medium">No orders found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This customer has not placed an order yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Order status</TableHead>
                            <TableHead>Payment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerOrders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">{order.orderNumber}</TableCell>
                              <TableCell className="whitespace-nowrap text-sm">
                                {formatDate(order.createdAt)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatCurrency(order.totalAmount, order.currency)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {order.orderStatus.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {order.paymentStatus.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {ordersPages > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Page {ordersPage} of {ordersPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={ordersPage <= 1 || ordersLoading}
                          onClick={() => setOrdersPage((current) => current - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={ordersPage >= ordersPages || ordersLoading}
                          onClick={() => setOrdersPage((current) => current + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="loyalty" className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium">Loyalty transactions</h4>
                    <p className="text-sm text-muted-foreground">
                      {totalTransactions} total transactions
                    </p>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex min-h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="rounded-lg border p-8 text-center">
                      <Gift className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                      <p className="font-medium">No loyalty transactions</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This customer has no recorded loyalty activity.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                              <TableCell>
                                <TransactionBadge type={transaction.type} />
                              </TableCell>
                              <TableCell className="font-medium">
                                {transaction.type === "REDEEM" ? "-" : "+"}
                                {transaction.points}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {transaction.order?.orderNumber || "Unavailable"}
                              </TableCell>
                              <TableCell className="max-w-48 text-sm">
                                {transaction.description || "No description"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm">
                                {formatDate(transaction.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {transactionsPages > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Page {transactionsPage} of {transactionsPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={transactionsPage <= 1 || transactionsLoading}
                          onClick={() => setTransactionsPage((current) => current - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={transactionsPage >= transactionsPages || transactionsLoading}
                          onClick={() => setTransactionsPage((current) => current + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Customer details are unavailable.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open && !statusActionLoading) setStatusTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.isActive ? "Suspend customer?" : "Reactivate customer?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.isActive
                ? "This will deactivate the customer's account and invalidate their existing login sessions. They will no longer be able to access their account until reactivated."
                : "This will reactivate the customer's account so they can log in and use the store again."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={statusActionLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleStatusChange();
              }}
              className={
                statusTarget?.isActive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {statusActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : statusTarget?.isActive ? (
                "Yes, suspend customer"
              ) : (
                "Yes, reactivate customer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CustomersManagement;
