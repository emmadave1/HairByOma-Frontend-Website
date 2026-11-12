import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Gift,
  Loader2,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Trophy,
  Users,
} from "lucide-react";
import { PageHero, ProgressMeter, MockNotice } from ".";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/auth";
import { siteConfig } from "@/data/config";
import { loyaltyService, type LoyaltyTransaction } from "@/services/loyalty.service";
import {
  referralService,
  type CustomerReferral,
  type CustomerReferralResponse,
} from "@/services/referral.service";
const money = (n: number) => `₦${n.toLocaleString()}`;
export function RewardsPage() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "EARN" | "REDEEM" | "REVERSAL">("all");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await loyaltyService.getMyTransactions({
          page,
          limit: 10,
          ...(filter !== "all" ? { type: filter } : {}),
        });

        if (!active) return;

        setTransactions(response.loyalty.transactions);
        setPointsBalance(response.loyalty.pointsBalance);
        setTotalTransactions(response.loyalty.totalTransactions);
        setTotalPages(Math.max(1, response.loyalty.totalPages));
      } catch (err) {
        if (!active) return;

        setError(err instanceof Error ? err.message : "Unable to load your rewards information.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTransactions();

    return () => {
      active = false;
    };
  }, [page, filter, refreshKey]);

  const formatNumber = (value: number) => new Intl.NumberFormat("en-NG").format(value || 0);

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Earned", value: "EARN" },
    { label: "Redeemed", value: "REDEEM" },
    { label: "Reversed", value: "REVERSAL" },
  ] as const;

  const transactionDetails = {
    EARN: {
      label: "Points earned",
      icon: ArrowUpRight,
      className: "text-green-700 bg-green-50",
      sign: "+",
    },
    REDEEM: {
      label: "Points redeemed",
      icon: ArrowDownLeft,
      className: "text-primary bg-secondary",
      sign: "-",
    },
    REVERSAL: {
      label: "Points reversed",
      icon: RotateCcw,
      className: "text-red-700 bg-red-50",
      sign: "-",
    },
  };

  return (
    <>
      <PageHero
        eyebrow="HairbyOma loyalty"
        title="Your HairbyOma Rewards"
        copy="Every eligible purchase brings you closer to your next HairbyOma reward."
      />

      <div className="site-container py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          <Stat title="Available points" value={`${formatNumber(pointsBalance)} pts`} />
          <Stat title="Total transactions" value={formatNumber(totalTransactions)} />
        </div>

        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">Points history</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track points earned, redeemed and reversed on your account.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setRefreshKey((current) => current + 1)}
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => {
                  setFilter(option.value);
                  setPage(1);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setRefreshKey((current) => current + 1)}
              >
                Try again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your rewards...
            </div>
          ) : !error && transactions.length === 0 ? (
            <div className="mt-6 border p-10 text-center">
              <Gift className="mx-auto h-9 w-9 text-primary" />
              <h3 className="mt-4 font-display text-xl">No transactions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your eligible purchase points will appear here once they are awarded.
              </p>
            </div>
          ) : !error ? (
            <>
              <div className="mt-6 divide-y border">
                {transactions.map((transaction) => {
                  const details = transactionDetails[transaction.type];
                  const Icon = details.icon;

                  return (
                    <div
                      key={transaction._id}
                      className="flex flex-wrap items-center justify-between gap-4 p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${details.className}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium">{details.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                          {transaction.order?.orderNumber && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Order: {transaction.order.orderNumber}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 font-semibold">
                        {details.sign}
                        {formatNumber(transaction.points)} pts
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
export function BirthdayPage() {
  const { user, setUser } = useAuth();

  const [birthday, setBirthday] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    const dob = user.dateOfBirth ? new Date(user.dateOfBirth) : null;

    setBirthday(dob && !Number.isNaN(dob.getTime()) ? dob.toISOString().slice(0, 10) : "");
  }, [user]);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (birthday) {
      const selectedDate = new Date(`${birthday}T00:00:00`);

      if (Number.isNaN(selectedDate.getTime()) || selectedDate > new Date()) {
        setError("Please enter a valid birthday that is not in the future.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await userService.updateProfile({
        dateOfBirth: birthday || null,
      });

      setUser(response.user);
      setSuccess("Your birthday information has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save your birthday. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getDaysUntilBirthday = () => {
    if (!birthday) return null;

    const [yearValue, monthValue, dayValue] = birthday.split("-");
    const month = monthValue ? Number(monthValue) : NaN;
    const day = dayValue ? Number(dayValue) : NaN;

    if (!monthValue || !dayValue || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }

    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), month - 1, day);

    today.setHours(0, 0, 0, 0);

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return Math.round((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysUntilBirthday = getDaysUntilBirthday();

  return (
    <>
      <PageHero
        eyebrow="A little something for you"
        title="Birthday Club"
        copy="Keep your birthday information up to date so HairbyOma can celebrate you."
      />

      <div className="site-container grid gap-7 py-12 lg:grid-cols-2">
        <div className="border p-7">
          <Gift className="h-8 w-8 text-primary" />
          <h2 className="mt-4 font-display text-3xl">Your birthday</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us when your birthday is so we can celebrate with you.
          </p>

          <label className="mt-6 block">
            <span className="form-label">Birthday date</span>
            <Input
              type="date"
              value={birthday}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => {
                setBirthday(event.target.value);
                setError("");
                setSuccess("");
              }}
            />
          </label>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {success && <p className="mt-3 text-sm text-green-700">{success}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save birthday"}
            </Button>

            {birthday && (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setBirthday("");
                  setError("");
                  setSuccess("");
                }}
              >
                Clear date
              </Button>
            )}
          </div>
        </div>

        <div className="bg-secondary/45 p-7">
          <p className="eyebrow">Your birthday celebration</p>

          {daysUntilBirthday === null ? (
            <>
              <h2 className="mt-3 font-display text-3xl">Let's get your birthday!</h2>
              <p className="mt-4 text-muted-foreground">
                Add your birthday to your profile to keep your celebration information up to date.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-display text-4xl">
                {daysUntilBirthday === 0
                  ? "It's your birthday!"
                  : `${daysUntilBirthday} ${daysUntilBirthday === 1 ? "day" : "days"} to go`}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {daysUntilBirthday === 0
                  ? "Happy birthday! The HairbyOma team wishes you a beautiful year ahead."
                  : "Your next birthday is on its way. We look forward to celebrating you!"}
              </p>
            </>
          )}

          <div className="mt-6 border-t border-primary/10 pt-5">
            <p className="text-sm font-medium">Birthday rewards</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Birthday benefits and automated birthday messages will be announced once the programme
              rules are configured.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
export function ReferralPage() {
  const [referral, setReferral] = useState<CustomerReferralResponse["referral"] | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadReferrals = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await referralService.getMyReferrals();

        if (active) {
          setReferral(response.referral);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load your referral information.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadReferrals();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const referralLink = referral?.referralCode
    ? `${window.location.origin}/auth?ref=${encodeURIComponent(referral.referralCode)}`
    : "";

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the referral link. Please copy it manually.");
    }
  };

  const rewardStatusLabel = (status: CustomerReferral["referrerRewardStatus"]) => {
    switch (status) {
      case "AVAILABLE":
        return "Reward available";
      case "REDEEMED":
        return "Reward redeemed";
      default:
        return "Reward pending";
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Share the beauty"
        title="Your Referral Program"
        copy="Invite friends to HairbyOma and enjoy rewards when they make their first qualifying purchase."
      />

      <div className="site-container py-12">
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              Try again
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your referral information...
          </div>
        ) : referral ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Stat title="Your referral code" value={referral.referralCode} />
              <Stat title="Total referrals" value={String(referral.totalReferrals)} />
              <Stat title="Successful referrals" value={String(referral.successfulReferrals)} />
              <Stat title="Pending referrals" value={String(referral.pendingReferrals)} />
              <Stat title="Available rewards" value={String(referral.availableRewards)} />
              <Stat title="Redeemed rewards" value={String(referral.redeemedRewards)} />
            </div>

            <div className="mt-8 border p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Your referral benefit</p>
                  <h2 className="mt-2 font-display text-3xl">
                    Earn {referral.referrerRewardPercentage}% rewards
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Share your referral link with friends. When a friend signs up using your code
                    and completes a qualifying purchase, your referral reward becomes available.
                  </p>
                </div>
                <Gift className="h-9 w-9 text-primary" />
              </div>

              {referral.welcomeDiscountAvailable && (
                <p className="mt-5 border border-primary/20 bg-secondary/40 p-4 text-sm">
                  Your welcome discount of {referral.welcomeDiscountPercentage}% is still available
                  on your account.
                </p>
              )}

              <div className="mt-6">
                <p className="form-label">Your personal referral link</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input value={referralLink} readOnly />
                  <Button type="button" onClick={copyReferralLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied!" : "Copy link"}
                  </Button>
                  <Button asChild variant="secondary">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Discover HairbyOma! Sign up using my referral link: ${referralLink}`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Share
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl">Your referral history</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep track of friends who joined using your referral code.
              </p>

              {referral.referrals.length === 0 ? (
                <div className="mt-5 border p-10 text-center">
                  <Users className="mx-auto h-9 w-9 text-primary" />
                  <h3 className="mt-4 font-display text-xl">No referrals yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share your referral link with friends to get started.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/40">
                      <tr>
                        <th className="p-4">Friend</th>
                        <th className="p-4">Referral status</th>
                        <th className="p-4">Reward status</th>
                        <th className="p-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referral.referrals.map((item) => (
                        <tr key={item._id} className="border-t">
                          <td className="p-4 font-medium">
                            {item.referredUser
                              ? `${item.referredUser.firstName} ${item.referredUser.lastName}`
                              : "Customer"}
                          </td>
                          <td className="p-4">
                            <span
                              className={
                                item.status === "SUCCESSFUL" ? "text-green-700" : "text-amber-700"
                              }
                            >
                              {item.status === "SUCCESSFUL" ? "Successful" : "Pending"}
                            </span>
                          </td>
                          <td className="p-4">{rewardStatusLabel(item.referrerRewardStatus)}</td>
                          <td className="p-4 text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
export function ChallengePage() {
  const c = siteConfig.challenge;
  return (
    <>
      <PageHero
        eyebrow="2026 member journey"
        title="HairbyOma Annual Challenge"
        copy="A motivating snapshot of yearly purchases, referrals and future benefits."
      />
      <div className="site-container py-12">
        <MockNotice />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border p-7">
            <Trophy className="text-primary" />
            <h2 className="mt-4 text-3xl">Purchase challenge</h2>
            <p className="mt-2 text-muted-foreground">
              {money(c.purchased)} of {money(c.purchaseTarget)}
            </p>
            <div className="mt-6">
              <ProgressMeter
                label="Yearly purchase amount"
                value={Math.round((c.purchased / c.purchaseTarget) * 100)}
              />
            </div>
          </div>
          <div className="border p-7">
            <Users className="text-primary" />
            <h2 className="mt-4 text-3xl">Referral challenge</h2>
            <p className="mt-2 text-muted-foreground">
              {c.referrals} of {c.referralTarget} successful referrals
            </p>
            <div className="mt-6">
              <ProgressMeter
                label="Referral target"
                value={Math.round((c.referrals / c.referralTarget) * 100)}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat title="Reward status" value="In progress" />
          <Stat title="Free gift" value="Not yet qualified" />
          <Stat title="Free delivery" value="Qualified" />
        </div>
      </div>
    </>
  );
}
function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="border bg-background p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
