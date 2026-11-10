import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Loader2,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminReferralService,
  type AdminReferral,
  type AdminReferralStatistics,
  type AdminReferralParams,
  type ReferralStatus,
  type ReferralRewardStatus,
} from "@/services/admin-referral.service";

const PAGE_SIZE = 10;

type ReferralFilter = "all" | ReferralStatus;
type RewardFilter = "all" | ReferralRewardStatus;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value || 0);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getCustomerName(customer: AdminReferral["referrer"] | null | undefined) {
  if (!customer) return "Unknown customer";

  return `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Unknown customer";
}

function getReferralVariant(status: ReferralStatus) {
  return status === "SUCCESSFUL" ? ("default" as const) : ("secondary" as const);
}

function getRewardVariant(status: ReferralRewardStatus) {
  switch (status) {
    case "AVAILABLE":
      return "default" as const;
    case "REDEEMED":
      return "secondary" as const;
    case "PENDING":
      return "outline" as const;
  }
}

function ReferralsManagement() {
  const [statistics, setStatistics] = useState<AdminReferralStatistics | null>(null);
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReferralFilter>("all");
  const [rewardFilter, setRewardFilter] = useState<RewardFilter>("all");
  const [page, setPage] = useState(1);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReferrals = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params: AdminReferralParams = {
          page,
          limit: PAGE_SIZE,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (rewardFilter !== "all") {
          params.rewardStatus = rewardFilter;
        }

        const [statsResponse, referralResponse] = await Promise.all([
          adminReferralService.getStats(),
          adminReferralService.getReferrals(params),
        ]);

        setStatistics(statsResponse.statistics);
        setReferrals(referralResponse.referrals);
        setTotalReferrals(referralResponse.totalReferrals);
        setTotalPages(Math.max(1, referralResponse.totalPages));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load referral information.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, rewardFilter],
  );

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  const handleStatusChange = (value: ReferralFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleRewardChange = (value: RewardFilter) => {
    setRewardFilter(value);
    setPage(1);
  };

  const statusFilters: { label: string; value: ReferralFilter }[] = [
    { label: "All referrals", value: "all" },
    { label: "Pending", value: "PENDING" },
    { label: "Successful", value: "SUCCESSFUL" },
  ];

  const rewardFilters: { label: string; value: RewardFilter }[] = [
    { label: "All rewards", value: "all" },
    { label: "Pending", value: "PENDING" },
    { label: "Available", value: "AVAILABLE" },
    { label: "Redeemed", value: "REDEEMED" },
  ];

  const summaryCards = statistics
    ? [
        {
          label: "Total referrals",
          value: formatNumber(statistics.totalReferrals),
          description: "All customer referrals",
          icon: Users,
        },
        {
          label: "Successful referrals",
          value: formatNumber(statistics.successfulReferrals),
          description: "Referrals that qualified",
          icon: CheckCircle,
        },
        {
          label: "Pending referrals",
          value: formatNumber(statistics.pendingReferrals),
          description: "Awaiting qualification",
          icon: Clock,
        },
        {
          label: "Unique referrers",
          value: formatNumber(statistics.uniqueReferrers),
          description: "Customers who referred others",
          icon: Gift,
        },
      ]
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-2 text-2xl font-semibold">Referral programme</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor customer referrals, successful conversions and reward redemptions.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadReferrals(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Refresh
        </Button>
      </div>

      {loading && !statistics ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading referral programme...
        </div>
      ) : error && !statistics ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadReferrals()}>
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
            {summaryCards.map((card) => (
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

          {statistics && (
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  Pending rewards
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(statistics.pendingRewards)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Awaiting qualification or release
                </p>
              </article>

              <article className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="size-4 text-green-600" />
                  Available rewards
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(statistics.availableRewards)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Ready to be redeemed</p>
              </article>

              <article className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4" />
                  Redeemed rewards
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(statistics.redeemedRewards)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Rewards already used</p>
              </article>
            </div>
          )}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Gift className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Customer referral reward</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Successful referrals unlock a 5% reward for the referring customer on a separate
                  order.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Referral history</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review who referred each customer and track their reward status.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Referral status
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((item) => (
                    <Button
                      key={item.value}
                      size="sm"
                      variant={statusFilter === item.value ? "default" : "outline"}
                      onClick={() => handleStatusChange(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reward status
                </p>
                <div className="flex flex-wrap gap-2">
                  {rewardFilters.map((item) => (
                    <Button
                      key={item.value}
                      size="sm"
                      variant={rewardFilter === item.value ? "default" : "outline"}
                      onClick={() => handleRewardChange(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between gap-3 border-b p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Referrals found</p>
                  <p className="mt-1 text-2xl font-semibold">{formatNumber(totalReferrals)}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="size-5 text-primary" />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  Loading referrals...
                </div>
              ) : referrals.length === 0 ? (
                <div className="p-10 text-center">
                  <Gift className="mx-auto size-9 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No referrals found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    There are no referrals matching these filters yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left text-sm">
                      <thead className="border-b bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Referrer</th>
                          <th className="px-4 py-3 font-medium">Referred customer</th>
                          <th className="px-4 py-3 font-medium">Referral status</th>
                          <th className="px-4 py-3 font-medium">Qualifying order</th>
                          <th className="px-4 py-3 font-medium">Reward</th>
                          <th className="px-4 py-3 font-medium">Reward order</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {referrals.map((referral) => (
                          <tr key={referral._id}>
                            <td className="px-4 py-4">
                              <p className="font-medium">{getCustomerName(referral.referrer)}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {referral.referrer?.email || "No email available"}
                              </p>
                              {referral.referrer?.referralCode && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Code: {referral.referrer.referralCode}
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-medium">
                                {getCustomerName(referral.referredUser)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {referral.referredUser?.email || "No email available"}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <Badge variant={getReferralVariant(referral.status)}>
                                {referral.status}
                              </Badge>
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-medium">
                                {referral.qualifyingOrder?.orderNumber || "Not qualified"}
                              </p>
                              {referral.qualifyingOrder && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  ?{formatNumber(referral.qualifyingOrder.totalAmount)}
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <Badge variant={getRewardVariant(referral.referrerRewardStatus)}>
                                {referral.referrerRewardStatus}
                              </Badge>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {referral.discountPercentage}% discount
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              {referral.rewardOrder?.orderNumber || "Not redeemed"}
                            </td>

                            <td className="px-4 py-4 text-muted-foreground">
                              {formatDate(referral.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col justify-between gap-3 border-t p-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} • {formatNumber(totalReferrals)} referrals
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
    </section>
  );
}

export default ReferralsManagement;
