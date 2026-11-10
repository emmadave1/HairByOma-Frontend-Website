import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Cake,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Gift,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminBirthdayService,
  type AdminBirthdayCustomer,
  type AdminBirthdayParams,
  type AdminBirthdayStatistics,
  type BirthdayPeriod,
  type BirthdayPreference,
} from "@/services/admin-birthday.service";

const PAGE_SIZE = 10;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value || 0);
}

function formatBirthday(value: string) {
  if (!value) return "Not available";

  const parts = value.split("-");

  if (parts.length !== 3) return value;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return value;
  }

  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function getDaysLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function getBirthdayBadge(days: number) {
  if (days === 0) return "default" as const;
  if (days <= 7) return "secondary" as const;
  return "outline" as const;
}

function getCustomerName(customer: AdminBirthdayCustomer) {
  return `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Unknown customer";
}

function BirthdayStatus({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <Badge variant={enabled ? "default" : "secondary"}>
      {enabled ? `${label} on` : `${label} off`}
    </Badge>
  );
}

function BirthdaysManagement() {
  const [statistics, setStatistics] = useState<AdminBirthdayStatistics | null>(null);
  const [birthdays, setBirthdays] = useState<AdminBirthdayCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [preference, setPreference] = useState<BirthdayPreference>("all");
  const [period, setPeriod] = useState<BirthdayPeriod>("all");
  const [page, setPage] = useState(1);
  const [totalBirthdays, setTotalBirthdays] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadBirthdays = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params: AdminBirthdayParams = {
          page,
          limit: PAGE_SIZE,
          period,
          preference,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        const [statsResponse, birthdayResponse] = await Promise.all([
          adminBirthdayService.getStats(),
          adminBirthdayService.getBirthdays(params),
        ]);

        setStatistics(statsResponse.statistics);
        setBirthdays(birthdayResponse.birthdays);
        setTotalBirthdays(birthdayResponse.totalBirthdays);
        setTotalPages(Math.max(1, birthdayResponse.totalPages));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load customer birthday information.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, period, preference, search],
  );

  useEffect(() => {
    void loadBirthdays();
  }, [loadBirthdays]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePeriodChange = (value: BirthdayPeriod) => {
    setPeriod(value);
    setPage(1);
  };

  const handlePreferenceChange = (value: BirthdayPreference) => {
    setPreference(value);
    setPage(1);
  };

  const summaryCards = statistics
    ? [
        {
          label: "Customers with birthdays",
          value: formatNumber(statistics.customersWithBirthdays),
          description: "Active customers with a saved birthday",
          icon: Users,
        },
        {
          label: "Birthdays this month",
          value: formatNumber(statistics.upcomingThisMonth),
          description: "Customers born in the current month",
          icon: CalendarDays,
        },
        {
          label: "Birthday email opt-ins",
          value: formatNumber(statistics.birthdayEmailOptIns),
          description: "Customers who agreed to birthday emails",
          icon: Mail,
        },
        {
          label: "Birthday wishes enabled",
          value: formatNumber(statistics.birthdayWishesEnabled),
          description: `${formatNumber(statistics.birthdayWishesDisabled)} customers have disabled wishes`,
          icon: Gift,
        },
      ]
    : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-2 text-2xl font-semibold">Customer birthdays</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor customer birthdays and birthday greeting preferences.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadBirthdays(true)}
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
          Loading birthday information...
        </div>
      ) : error && !statistics ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadBirthdays()}>
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Birthday customer list</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View upcoming birthdays and each customer's greeting preferences.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search name or email..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <select
                value={period}
                onChange={(event) => handlePeriodChange(event.target.value as BirthdayPeriod)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All birthdays</option>
                <option value="upcoming">Next 30 days</option>
                <option value="this-month">This month</option>
              </select>

              <select
                value={preference}
                onChange={(event) =>
                  handlePreferenceChange(event.target.value as BirthdayPreference)
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All preferences</option>
                <option value="email">Email enabled</option>
                <option value="no-email">Email disabled</option>
                <option value="wishes-enabled">Wishes enabled</option>
                <option value="wishes-disabled">Wishes disabled</option>
              </select>
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between gap-3 border-b p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customers found</p>
                  <p className="mt-1 text-2xl font-semibold">{formatNumber(totalBirthdays)}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Cake className="size-5 text-primary" />
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  Loading birthdays...
                </div>
              ) : birthdays.length === 0 ? (
                <div className="p-10 text-center">
                  <Cake className="mx-auto size-9 text-muted-foreground" />
                  <h3 className="mt-4 font-medium">No birthdays found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No customers match the selected search and filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="border-b bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Date of birth</th>
                          <th className="px-4 py-3 font-medium">Next birthday</th>
                          <th className="px-4 py-3 font-medium">Email wishes</th>
                          <th className="px-4 py-3 font-medium">In-app wishes</th>
                          <th className="px-4 py-3 font-medium">Last sent</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {birthdays.map((customer) => (
                          <tr key={customer._id}>
                            <td className="px-4 py-4">
                              <p className="font-medium">{getCustomerName(customer)}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{customer.email}</p>
                            </td>

                            <td className="px-4 py-4">{formatBirthday(customer.dateOfBirth)}</td>

                            <td className="px-4 py-4">
                              <p className="font-medium">{formatBirthday(customer.nextBirthday)}</p>
                              <Badge
                                variant={getBirthdayBadge(customer.daysUntilBirthday)}
                                className="mt-1"
                              >
                                {getDaysLabel(customer.daysUntilBirthday)}
                              </Badge>
                            </td>

                            <td className="px-4 py-4">
                              <BirthdayStatus
                                enabled={customer.birthdayEmailsEnabled}
                                label="Email"
                              />
                            </td>

                            <td className="px-4 py-4">
                              <BirthdayStatus
                                enabled={customer.birthdayWishesEnabled}
                                label="In-app"
                              />
                            </td>

                            <td className="px-4 py-4 text-muted-foreground">
                              {customer.birthdayWishLastSentYear ?? "Never"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col justify-between gap-3 border-t p-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} • {formatNumber(totalBirthdays)} customers
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

export default BirthdaysManagement;
