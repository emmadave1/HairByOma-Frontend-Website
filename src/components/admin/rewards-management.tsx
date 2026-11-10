import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Coins,
  Loader2,
  RefreshCw,
  RotateCcw,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminLoyaltyService,
  type AdminLoyaltyStatistics,
  type AdminLoyaltyTransaction,
  type AdminLoyaltyTransactionParams,
  type LoyaltyTransactionType,
} from "@/services/admin-loyalty.service";

const PAGE_SIZE = 10;

type TransactionFilter = "all" | LoyaltyTransactionType;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value || 0);
}

function formatDate(value: string) {
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

function getTransactionLabel(type: LoyaltyTransactionType) {
  switch (type) {
    case "EARN":
      return "Earned";
    case "REDEEM":
      return "Redeemed";
    case "REVERSAL":
      return "Reversed";
  }
}

function getTransactionVariant(type: LoyaltyTransactionType) {
  switch (type) {
    case "EARN":
      return "default" as const;
    case "REDEEM":
      return "secondary" as const;
    case "REVERSAL":
      return "destructive" as const;
  }
}

function RewardsManagement() {
  const [statistics, setStatistics] = useState<AdminLoyaltyStatistics | null>(null);
  const [transactions, setTransactions] = useState<AdminLoyaltyTransaction[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRewards = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const transactionParams: AdminLoyaltyTransactionParams = {
          page,
          limit: PAGE_SIZE,
        };

        if (filter !== "all") {
          transactionParams.type = filter;
        }

        const [statsResponse, transactionResponse] = await Promise.all([
          adminLoyaltyService.getStats(),
          adminLoyaltyService.getTransactions(transactionParams),
        ]);

        setStatistics(statsResponse.statistics);
        setTransactions(transactionResponse.transactions);
        setTotalTransactions(transactionResponse.totalTransactions);
        setTotalPages(Math.max(1, transactionResponse.totalPages));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load loyalty programme information.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, page],
  );

  useEffect(() => {
    void loadRewards();
  }, [loadRewards]);

  const handleFilterChange = (nextFilter: TransactionFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const filters: { label: string; value: TransactionFilter }[] = [
    { label: "All transactions", value: "all" },
    { label: "Earned", value: "EARN" },
    { label: "Redeemed", value: "REDEEM" },
    { label: "Reversed", value: "REVERSAL" },
  ];

  const summaryCards = statistics
    ? [
        {
          label: "Total customers",
          value: formatNumber(statistics.totalCustomers),
          description: "Registered customers",
          icon: Users,
        },
        {
          label: "Customers with points",
          value: formatNumber(statistics.customersWithPoints),
          description: "Customers with a positive balance",
          icon: Coins,
        },
        {
          label: "Total points held",
          value: formatNumber(statistics.totalPointsHeld),
          description: "Current outstanding points",
          icon: Wallet,
        },
        {
          label: "Total points earned",
          value: formatNumber(statistics.totalPointsEarned),
          description: `${formatNumber(statistics.transactions.EARN.transactionCount)} earning transactions`,
          icon: ArrowUpRight,
        },
      ]
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-2 text-2xl font-semibold">Rewards & loyalty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor customer loyalty points and transaction activity.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadRewards(true)}
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
          Loading loyalty programme...
        </div>
      ) : error && !statistics ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadRewards()}>
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
                  <ArrowUpRight className="size-4 text-green-600" />
                  Points earned
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(statistics.totalPointsEarned)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(statistics.transactions.EARN.transactionCount)} transactions
                </p>
              </article>

              <article className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowDownLeft className="size-4" />
                  Points redeemed
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(statistics.totalPointsRedeemed)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(statistics.transactions.REDEEM.transactionCount)} transactions
                </p>
              </article>

              <article className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RotateCcw className="size-4" />
                  Points reversed
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(statistics.totalPointsReversed)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(statistics.transactions.REVERSAL.transactionCount)} transactions
                </p>
              </article>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Transaction history</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View loyalty points activity across customer accounts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  variant={filter === item.value ? "default" : "outline"}
                  onClick={() => handleFilterChange(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between gap-3 border-b p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions found</p>
                  <p className="mt-1 text-2xl font-semibold">{formatNumber(totalTransactions)}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Coins className="size-5 text-primary" />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-10 text-center">
                  <Coins className="mx-auto size-9 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No transactions found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    There are no loyalty transactions in this category yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="border-b bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Transaction</th>
                          <th className="px-4 py-3 font-medium">Points</th>
                          <th className="px-4 py-3 font-medium">Order</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {transactions.map((transaction) => {
                          const customerName = transaction.user
                            ? `${transaction.user.firstName || ""} ${transaction.user.lastName || ""}`.trim()
                            : "Unknown customer";

                          return (
                            <tr key={transaction._id}>
                              <td className="px-4 py-4">
                                <p className="font-medium">{customerName || "Unknown customer"}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {transaction.user?.email || "No email available"}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <Badge variant={getTransactionVariant(transaction.type)}>
                                  {getTransactionLabel(transaction.type)}
                                </Badge>
                                {transaction.description && (
                                  <p className="mt-1 max-w-48 text-xs text-muted-foreground">
                                    {transaction.description}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4 font-semibold">
                                {transaction.type === "EARN" ? "+" : "-"}
                                {formatNumber(transaction.points)}
                              </td>

                              <td className="px-4 py-4">
                                {transaction.order?.orderNumber || "Unavailable"}
                              </td>

                              <td className="px-4 py-4 text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col justify-between gap-3 border-t p-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} • {formatNumber(totalTransactions)} transactions
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

export default RewardsManagement;
