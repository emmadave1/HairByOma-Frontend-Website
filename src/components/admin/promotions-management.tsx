import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  adminCouponService,
  type AdminCoupon,
  type AdminCouponPayload,
  type AdminCouponRedemption,
  type AdminCouponStats,
  type CouponEligibility,
  type CouponRedemptionStatus,
} from "@/services/admin-coupon.service";
import { adminCustomerService, type AdminCustomer } from "@/services/admin-customer.service";

const PAGE_SIZE = 10;
const REDEMPTION_PAGE_SIZE = 10;

type CouponFilter = "all" | "active" | "inactive";

type CouponFormState = {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  maxDiscountAmount: string;
  minimumOrderAmount: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perUserLimit: string;
  eligibility: CouponEligibility;
  eligibleUsers: string[];
  isActive: boolean;
};

const emptyForm: CouponFormState = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscountAmount: "",
  minimumOrderAmount: "0",
  startsAt: new Date().toISOString().slice(0, 16),
  expiresAt: "",
  usageLimit: "",
  perUserLimit: "1",
  eligibility: "EVERYONE",
  eligibleUsers: [],
  isActive: true,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value || 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "No expiry";

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

function getCouponStatus(coupon: AdminCoupon) {
  if (!coupon.isActive) return "Inactive";

  const now = Date.now();

  if (new Date(coupon.startsAt).getTime() > now) return "Scheduled";

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
    return "Expired";
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return "Used up";
  }

  return "Active";
}

function StatusBadge({ coupon }: { coupon: AdminCoupon }) {
  const status = getCouponStatus(coupon);

  const styles: Record<string, string> = {
    Active: "border-green-500/30 bg-green-500/10 text-green-600",
    Scheduled: "border-blue-500/30 bg-blue-500/10 text-blue-600",
    Expired: "border-orange-500/30 bg-orange-500/10 text-orange-600",
    "Used up": "border-orange-500/30 bg-orange-500/10 text-orange-600",
    Inactive: "border-red-500/30 bg-red-500/10 text-red-600",
  };

  return (
    <Badge variant="outline" className={styles[status] || ""}>
      {status}
    </Badge>
  );
}

function formatDiscount(coupon: AdminCoupon) {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue}%`
    : formatCurrency(coupon.discountValue);
}

function getEligibilityLabel(eligibility: CouponEligibility) {
  switch (eligibility) {
    case "EVERYONE":
      return "Everyone";
    case "FIRST_TIME_CUSTOMERS":
      return "First-time customers";
    case "SELECTED_CUSTOMERS":
      return "Selected customers";
    default:
      return "Everyone";
  }
}

function getRedemptionBadge(status: CouponRedemptionStatus) {
  const styles: Record<CouponRedemptionStatus, string> = {
    RESERVED: "border-blue-500/30 bg-blue-500/10 text-blue-600",
    REDEEMED: "border-green-500/30 bg-green-500/10 text-green-600",
    RELEASED: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
}

function PromotionsManagement() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CouponFilter>("all");
  const [page, setPage] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(null);
  const [couponStats, setCouponStats] = useState<AdminCouponStats | null>(null);
  const [redemptions, setRedemptions] = useState<AdminCouponRedemption[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [redemptionFilter, setRedemptionFilter] = useState<"all" | CouponRedemptionStatus>("all");
  const [redemptionPage, setRedemptionPage] = useState(1);
  const [redemptionTotal, setRedemptionTotal] = useState(0);
  const [redemptionPages, setRedemptionPages] = useState(1);

  const [actionCoupon, setActionCoupon] = useState<AdminCoupon | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCoupons = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const response = await adminCouponService.list({
          ...(filter === "all" ? {} : { isActive: filter === "active" }),
          ...(search.trim() ? { search: search.trim() } : {}),
          page,
          limit: PAGE_SIZE,
        });

        setCoupons(response.coupons);
        setTotalCoupons(response.totalCoupons);
        setTotalPages(Math.max(response.totalPages, 1));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load promotional coupons.";

        setError(message);

        if (showRefresh) toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, page, search],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadCoupons();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [loadCoupons]);

  const loadCustomers = useCallback(async () => {
    if (form.eligibility !== "SELECTED_CUSTOMERS") return;

    setCustomersLoading(true);

    try {
      const response = await adminCustomerService.list({
        status: "ACTIVE",
        ...(customerSearch.trim() ? { search: customerSearch.trim() } : {}),
        page: 1,
        limit: 50,
      });

      setCustomers(response.customers);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load active customers.");
    } finally {
      setCustomersLoading(false);
    }
  }, [customerSearch, form.eligibility]);

  useEffect(() => {
    if (formOpen && form.eligibility === "SELECTED_CUSTOMERS") {
      const timeout = window.setTimeout(() => {
        void loadCustomers();
      }, 300);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [formOpen, form.eligibility, loadCustomers]);

  const openCreateForm = () => {
    setEditingCoupon(null);
    setForm({
      ...emptyForm,
      startsAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    });
    setCustomerSearch("");
    setCustomers([]);
    setFormOpen(true);
  };

  const openEditForm = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscountAmount: coupon.maxDiscountAmount === null ? "" : String(coupon.maxDiscountAmount),
      minimumOrderAmount: String(coupon.minimumOrderAmount),
      startsAt: toDateTimeLocal(coupon.startsAt),
      expiresAt: toDateTimeLocal(coupon.expiresAt),
      usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
      perUserLimit: String(coupon.perUserLimit),
      eligibility: coupon.eligibility,
      eligibleUsers: coupon.eligibleUsers.map((user) =>
        typeof user === "string" ? user : user._id,
      ),
      isActive: coupon.isActive,
    });

    setCustomerSearch("");
    setCustomers([]);
    setFormOpen(true);
  };

  const updateForm = <K extends keyof CouponFormState>(key: K, value: CouponFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCustomer = (customerId: string) => {
    setForm((current) => ({
      ...current,
      eligibleUsers: current.eligibleUsers.includes(customerId)
        ? current.eligibleUsers.filter((id) => id !== customerId)
        : [...current.eligibleUsers, customerId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const discountValue = Number(form.discountValue);
    const minimumOrderAmount = Number(form.minimumOrderAmount);
    const maxDiscountAmount = form.maxDiscountAmount.trim() ? Number(form.maxDiscountAmount) : null;
    const usageLimit = form.usageLimit.trim() ? Number(form.usageLimit) : null;
    const perUserLimit = Number(form.perUserLimit);

    if (!form.code.trim() && !editingCoupon) {
      toast.error("Enter a coupon code.");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error("Enter a valid discount value.");
      return;
    }

    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      toast.error("Percentage discounts cannot exceed 100%.");
      return;
    }

    if (!Number.isFinite(minimumOrderAmount) || minimumOrderAmount < 0) {
      toast.error("Enter a valid minimum order amount.");
      return;
    }

    if (
      maxDiscountAmount !== null &&
      (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)
    ) {
      toast.error("Enter a valid maximum discount amount.");
      return;
    }

    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) {
      toast.error("Usage limit must be a positive whole number.");
      return;
    }

    if (!Number.isInteger(perUserLimit) || perUserLimit <= 0) {
      toast.error("Per-customer usage limit must be a positive whole number.");
      return;
    }

    if (!form.startsAt || Number.isNaN(new Date(form.startsAt).getTime())) {
      toast.error("Choose a valid start date.");
      return;
    }

    if (form.expiresAt && new Date(form.expiresAt) <= new Date(form.startsAt)) {
      toast.error("Expiry date must be later than the start date.");
      return;
    }

    if (form.eligibility === "SELECTED_CUSTOMERS" && form.eligibleUsers.length === 0) {
      toast.error("Select at least one eligible customer.");
      return;
    }

    const payload: AdminCouponPayload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue,
      maxDiscountAmount,
      minimumOrderAmount,
      startsAt: new Date(form.startsAt).toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      usageLimit,
      perUserLimit,
      eligibility: form.eligibility,
      eligibleUsers: form.eligibility === "SELECTED_CUSTOMERS" ? form.eligibleUsers : [],
      isActive: form.isActive,
    };

    setSaving(true);

    try {
      if (editingCoupon) {
        const { code: _code, ...updatePayload } = payload;
        await adminCouponService.update(editingCoupon._id, updatePayload);
        toast.success("Coupon updated successfully.");
      } else {
        await adminCouponService.create(payload);
        toast.success("Coupon created successfully.");
      }

      setFormOpen(false);
      await loadCoupons(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const openCouponDetails = async (coupon: AdminCoupon) => {
    setSelectedCoupon(coupon);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setCouponStats(null);
    setRedemptions([]);
    setRedemptionFilter("all");
    setRedemptionPage(1);

    try {
      const [statsResponse, redemptionResponse] = await Promise.all([
        adminCouponService.getStats(coupon._id),
        adminCouponService.getRedemptions(coupon._id, {
          page: 1,
          limit: REDEMPTION_PAGE_SIZE,
        }),
      ]);

      setCouponStats(statsResponse.stats);
      setRedemptions(redemptionResponse.redemptions);
      setRedemptionTotal(redemptionResponse.totalRedemptions);
      setRedemptionPages(Math.max(redemptionResponse.totalPages, 1));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load coupon details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadRedemptions = async (
    couponId: string,
    nextPage: number,
    nextFilter: "all" | CouponRedemptionStatus,
  ) => {
    setDetailsLoading(true);

    try {
      const response = await adminCouponService.getRedemptions(couponId, {
        ...(nextFilter === "all" ? {} : { status: nextFilter }),
        page: nextPage,
        limit: REDEMPTION_PAGE_SIZE,
      });

      setRedemptions(response.redemptions);
      setRedemptionTotal(response.totalRedemptions);
      setRedemptionPages(Math.max(response.totalPages, 1));
      setRedemptionPage(nextPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load redemptions.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCouponAction = async () => {
    if (!actionCoupon) return;

    setActionLoading(true);

    try {
      if (actionCoupon.isActive) {
        await adminCouponService.deactivate(actionCoupon._id);
        toast.success("Coupon deactivated.");
      } else {
        await adminCouponService.update(actionCoupon._id, { isActive: true });
        toast.success("Coupon activated.");
      }

      setActionCoupon(null);
      await loadCoupons(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update coupon status.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon code copied.");
    } catch {
      toast.error("Unable to copy coupon code.");
    }
  };

  const summary = [
    {
      label: "Coupons on this page",
      value: formatNumber(coupons.length),
      description: "Currently displayed",
      icon: TicketPercent,
    },
    {
      label: "Active coupons",
      value: formatNumber(coupons.filter((coupon) => coupon.isActive).length),
      description: "Enabled coupons on this page",
      icon: Gift,
    },
    {
      label: "Total usage",
      value: formatNumber(coupons.reduce((total, coupon) => total + coupon.usageCount, 0)),
      description: "Redemptions recorded on this page",
      icon: Users,
    },
    {
      label: "Scheduled coupons",
      value: formatNumber(
        coupons.filter((coupon) => getCouponStatus(coupon) === "Scheduled").length,
      ),
      description: "Waiting for their start date",
      icon: Clock,
    },
  ];

  const filters: { label: string; value: CouponFilter }[] = [
    { label: "All coupons", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-2 text-2xl font-semibold">Promotions & coupons</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create promotional offers, manage coupon eligibility and monitor redemptions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void loadCoupons(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Refresh
          </Button>

          <Button onClick={openCreateForm}>
            <Plus className="mr-2 size-4" />
            Create coupon
          </Button>
        </div>
      </div>

      {loading && coupons.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading promotional coupons...
        </div>
      ) : error && coupons.length === 0 ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadCoupons()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((card) => (
              <article key={card.label} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <card.icon className="size-5 text-primary" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Coupon management</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Search, edit, activate, deactivate and inspect promotional coupons.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search coupon code or description..."
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <Button
                    key={item.value}
                    size="sm"
                    variant={filter === item.value ? "default" : "outline"}
                    onClick={() => {
                      setFilter(item.value);
                      setPage(1);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between gap-3 border-b p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Coupons found</p>
                  <p className="mt-1 text-2xl font-semibold">{formatNumber(totalCoupons)}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <TicketPercent className="size-5 text-primary" />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  Loading coupons...
                </div>
              ) : coupons.length === 0 ? (
                <div className="p-10 text-center">
                  <TicketPercent className="mx-auto size-9 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No coupons found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a coupon or change your search and filters.
                  </p>
                  <Button className="mt-4" onClick={openCreateForm}>
                    <Plus className="mr-2 size-4" />
                    Create coupon
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left text-sm">
                      <thead className="border-b bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Coupon</th>
                          <th className="px-4 py-3 font-medium">Discount</th>
                          <th className="px-4 py-3 font-medium">Eligibility</th>
                          <th className="px-4 py-3 font-medium">Usage</th>
                          <th className="px-4 py-3 font-medium">Expiry</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {coupons.map((coupon) => (
                          <tr key={coupon._id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{coupon.code}</p>
                                <button
                                  type="button"
                                  onClick={() => void copyCode(coupon.code)}
                                  className="text-muted-foreground transition hover:text-primary"
                                  title="Copy coupon code"
                                >
                                  <Copy className="size-3.5" />
                                </button>
                              </div>
                              <p className="mt-1 max-w-48 truncate text-xs text-muted-foreground">
                                {coupon.description || "No description"}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-semibold">{formatDiscount(coupon)}</p>
                              {coupon.maxDiscountAmount !== null && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Max. {formatCurrency(coupon.maxDiscountAmount)}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                Min. order: {formatCurrency(coupon.minimumOrderAmount)}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              {getEligibilityLabel(coupon.eligibility)}
                              {coupon.eligibility === "SELECTED_CUSTOMERS" && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {coupon.eligibleUsers.length} selected
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-medium">
                                {formatNumber(coupon.usageCount)}
                                {coupon.usageLimit !== null
                                  ? ` / ${formatNumber(coupon.usageLimit)}`
                                  : " / Unlimited"}
                              </p>
                              {coupon.usageLimit !== null && (
                                <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{
                                      width: `${Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4 text-muted-foreground">
                              {formatDate(coupon.expiresAt)}
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge coupon={coupon} />
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="View details"
                                  onClick={() => void openCouponDetails(coupon)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Edit coupon"
                                  onClick={() => openEditForm(coupon)}
                                >
                                  <TicketPercent className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActionCoupon(coupon)}
                                >
                                  {coupon.isActive ? "Deactivate" : "Activate"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col justify-between gap-3 border-t p-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} • {formatNumber(totalCoupons)} coupons
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                      >
                        <ChevronLeft className="mr-1 size-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      >
                        Next
                        <ChevronRight className="ml-1 size-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !saving && setFormOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit coupon" : "Create promotional coupon"}</DialogTitle>
            <DialogDescription>
              Configure the discount, availability period, usage limits and customer eligibility.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon code</label>
                <Input
                  value={form.code}
                  onChange={(event) => updateForm("code", event.target.value.toUpperCase())}
                  placeholder="e.g. BLACKFRIDAY"
                  disabled={!!editingCoupon}
                  maxLength={32}
                  required={!editingCoupon}
                />
                <p className="text-xs text-muted-foreground">
                  {editingCoupon
                    ? "Coupon codes cannot be changed."
                    : "Use 3-32 letters, numbers or hyphens."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discount type</label>
                <select
                  value={form.discountType}
                  onChange={(event) =>
                    updateForm("discountType", event.target.value as "PERCENTAGE" | "FIXED")
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed amount (?)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discount value</label>
                <Input
                  type="number"
                  min="0.01"
                  max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                  step="0.01"
                  value={form.discountValue}
                  onChange={(event) => updateForm("discountValue", event.target.value)}
                  placeholder={form.discountType === "PERCENTAGE" ? "10" : "5000"}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum discount amount (?)</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.maxDiscountAmount}
                  onChange={(event) => updateForm("maxDiscountAmount", event.target.value)}
                  placeholder="Leave blank for no cap"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum order amount (?)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimumOrderAmount}
                  onChange={(event) => updateForm("minimumOrderAmount", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Total usage limit</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(event) => updateForm("usageLimit", event.target.value)}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Uses per customer</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.perUserLimit}
                  onChange={(event) => updateForm("perUserLimit", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Starts at</label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => updateForm("startsAt", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Expires at</label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => updateForm("expiresAt", event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if the coupon should not have an expiry date.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  placeholder="Describe this promotional offer..."
                  maxLength={300}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-right text-xs text-muted-foreground">
                  {form.description.length}/300
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Who can use this coupon?</label>
                <select
                  value={form.eligibility}
                  onChange={(event) => {
                    updateForm("eligibility", event.target.value as CouponEligibility);
                    updateForm("eligibleUsers", []);
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="EVERYONE">Everyone</option>
                  <option value="FIRST_TIME_CUSTOMERS">First-time customers</option>
                  <option value="SELECTED_CUSTOMERS">Selected customers only</option>
                </select>
              </div>

              {form.eligibility === "SELECTED_CUSTOMERS" && (
                <div className="space-y-3 rounded-xl border p-4 sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Select eligible customers</p>
                      <p className="text-xs text-muted-foreground">
                        {form.eligibleUsers.length} customer(s) selected
                      </p>
                    </div>
                    <Badge variant="secondary">{form.eligibleUsers.length} selected</Badge>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Search active customers..."
                      className="pl-9"
                    />
                  </div>

                  {customersLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading customers...
                    </div>
                  ) : customers.length === 0 ? (
                    <p className="py-5 text-center text-sm text-muted-foreground">
                      No active customers found.
                    </p>
                  ) : (
                    <div className="max-h-52 space-y-2 overflow-y-auto">
                      {customers.map((customer) => (
                        <label
                          key={customer._id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition hover:bg-muted/40"
                        >
                          <input
                            type="checkbox"
                            checked={form.eligibleUsers.includes(customer._id)}
                            onChange={() => toggleCustomer(customer._id)}
                            className="size-4 accent-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                              {customer.firstName} {customer.lastName}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {customer.email}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Only active customers are available for selection. Search to find specific
                    customers.
                  </p>
                </div>
              )}

              <label className="flex items-center gap-3 rounded-lg border p-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateForm("isActive", event.target.checked)}
                  className="size-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium">Enable coupon immediately</span>
                  <span className="block text-xs text-muted-foreground">
                    Disabled coupons cannot be used by customers.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse justify-end gap-2 border-t pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingCoupon ? "Save changes" : "Create coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Coupon details</DialogTitle>
            <DialogDescription>
              {selectedCoupon?.code} • Usage statistics and customer redemption history.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && !couponStats ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading coupon details...
            </div>
          ) : (
            <div className="space-y-5">
              {couponStats && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ["Total uses", formatNumber(couponStats.usageCount)],
                      [
                        "Remaining uses",
                        couponStats.remainingUses === null
                          ? "Unlimited"
                          : formatNumber(couponStats.remainingUses),
                      ],
                      ["Unique customers", formatNumber(couponStats.uniqueCustomers)],
                      ["Reserved", formatNumber(couponStats.reservedRedemptions)],
                      ["Successful", formatNumber(couponStats.successfulRedemptions)],
                      ["Released", formatNumber(couponStats.releasedRedemptions)],
                    ].map(([label, value]) => (
                      <article key={label} className="rounded-xl border bg-card p-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 text-xl font-semibold">{value}</p>
                      </article>
                    ))}
                  </div>

                  <article className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total discount given</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatCurrency(couponStats.totalDiscountGiven)}
                    </p>
                  </article>
                </>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Redemption history</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track customers and orders associated with this coupon.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["All", "all"],
                      ["Reserved", "RESERVED"],
                      ["Redeemed", "REDEEMED"],
                      ["Released", "RELEASED"],
                    ] as const
                  ).map(([label, value]) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={redemptionFilter === value ? "default" : "outline"}
                      onClick={() => {
                        if (selectedCoupon) {
                          setRedemptionFilter(value);
                          void loadRedemptions(selectedCoupon._id, 1, value);
                        }
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                <div className="rounded-xl border">
                  {detailsLoading ? (
                    <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading redemptions...
                    </div>
                  ) : redemptions.length === 0 ? (
                    <div className="p-8 text-center">
                      <Gift className="mx-auto size-8 text-muted-foreground" />
                      <p className="mt-3 font-medium">No redemptions found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No customer activity matches this filter yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                          <thead className="border-b bg-muted/40 text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-medium">Customer</th>
                              <th className="px-4 py-3 font-medium">Order</th>
                              <th className="px-4 py-3 font-medium">Discount</th>
                              <th className="px-4 py-3 font-medium">Status</th>
                              <th className="px-4 py-3 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {redemptions.map((redemption) => (
                              <tr key={redemption._id}>
                                <td className="px-4 py-3">
                                  <p className="font-medium">
                                    {redemption.user
                                      ? `${redemption.user.firstName} ${redemption.user.lastName}`
                                      : "Unknown customer"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {redemption.user?.email || "No email"}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  {redemption.order?.orderNumber || "No order"}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                  {formatCurrency(redemption.discountAmount)}
                                </td>
                                <td className="px-4 py-3">
                                  {getRedemptionBadge(redemption.status)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {formatDate(redemption.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col justify-between gap-3 border-t p-3 sm:flex-row sm:items-center">
                        <p className="text-xs text-muted-foreground">
                          Page {redemptionPage} of {redemptionPages} •{" "}
                          {formatNumber(redemptionTotal)} redemptions
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={redemptionPage <= 1 || detailsLoading}
                            onClick={() =>
                              selectedCoupon &&
                              void loadRedemptions(
                                selectedCoupon._id,
                                redemptionPage - 1,
                                redemptionFilter,
                              )
                            }
                          >
                            <ChevronLeft className="mr-1 size-4" />
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={redemptionPage >= redemptionPages || detailsLoading}
                            onClick={() =>
                              selectedCoupon &&
                              void loadRedemptions(
                                selectedCoupon._id,
                                redemptionPage + 1,
                                redemptionFilter,
                              )
                            }
                          >
                            Next
                            <ChevronRight className="ml-1 size-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!actionCoupon}
        onOpenChange={(open) => !actionLoading && !open && setActionCoupon(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionCoupon?.isActive ? "Deactivate coupon?" : "Activate coupon?"}
            </DialogTitle>
            <DialogDescription>
              {actionCoupon?.isActive
                ? `Customers will no longer be able to use ${actionCoupon.code}. Existing redemption records will remain unchanged.`
                : `This will enable ${actionCoupon?.code}. Customers can use it when its dates and eligibility conditions are valid.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setActionCoupon(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={actionCoupon?.isActive ? "destructive" : "default"}
              onClick={() => void handleCouponAction()}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {actionCoupon?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default PromotionsManagement;
