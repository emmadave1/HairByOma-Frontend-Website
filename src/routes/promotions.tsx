import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, Loader2, Tag } from "lucide-react";

import { PageHero } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { couponService, type AvailableCoupon } from "@/services/coupon.service";
import { SaleSection } from "@/components/promotions/SaleSection";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Holiday Sale & Offers - HairbyOma" },
      {
        name: "description",
        content:
          "Discover HairbyOma promotions, available discount codes and our upcoming holiday sale.",
      },
      { property: "og:title", content: "Holiday Sale & Offers - HairbyOma" },
      {
        property: "og:description",
        content: "Explore available HairbyOma discounts and our upcoming holiday sale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function CouponCard({
  coupon,
  copiedCode,
  onCopy,
}: {
  coupon: AvailableCoupon;
  copiedCode: string;
  onCopy: (code: string) => void;
}) {
  const discount =
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}% off`
      : `${formatPrice(coupon.discountValue)} off`;

  const eligibility =
    coupon.eligibility === "FIRST_TIME_CUSTOMERS"
      ? "First order"
      : coupon.eligibility === "SELECTED_CUSTOMERS"
        ? "Personal offer"
        : "Available to all";

  return (
    <article className="flex flex-col justify-between border bg-background p-6 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 text-xs font-medium">
            <Tag className="size-3.5 text-primary" />
            {eligibility}
          </span>
          <span className="text-sm font-semibold text-primary">{discount}</span>
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-wide">{coupon.code}</h2>

        {coupon.description && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{coupon.description}</p>
        )}

        {coupon.discountType === "PERCENTAGE" && coupon.maxDiscountAmount !== null && (
          <p className="mt-3 text-sm text-muted-foreground">
            Maximum discount: {formatPrice(coupon.maxDiscountAmount)}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2 border-t pt-4 text-sm text-muted-foreground">
        {coupon.minimumOrderAmount > 0 && (
          <p>Minimum order: {formatPrice(coupon.minimumOrderAmount)}</p>
        )}

        <p>{coupon.expiresAt ? `Expires: ${formatDate(coupon.expiresAt)}` : "No expiry date"}</p>

        <p>
          {coupon.remainingUses === null
            ? "Unlimited uses available"
            : `${coupon.remainingUses} uses remaining`}
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => onCopy(coupon.code)}
        >
          {copiedCode === coupon.code ? (
            <>
              <Check className="size-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy code
            </>
          )}
        </Button>
      </div>
    </article>
  );
}

function Page() {
  const { user, loading: authLoading } = useAuth();

  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      setCoupons([]);
      setCouponError("");
      return;
    }

    let cancelled = false;

    const loadCoupons = async () => {
      setLoadingCoupons(true);
      setCouponError("");

      try {
        const response = await couponService.available();

        if (!cancelled) {
          setCoupons(response.coupons ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setCouponError(
            error instanceof Error
              ? error.message
              : "Unable to load available coupons. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCoupons(false);
        }
      }
    };

    void loadCoupons();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      setCouponError("Unable to copy the code. Please copy it manually.");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Limited moments"
        title="Offers & promotions"
        copy="Discover exclusive offers and enjoy something special with every HairbyOma experience."
      />

      <SaleSection />

      <section className="site-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Exclusive savings</p>
          <h2 className="mt-3 text-3xl md:text-4xl">Your available offers</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Explore discount codes available to your account. Apply an eligible code during checkout
            to enjoy your savings.
          </p>
        </div>

        {authLoading ? (
          <div className="mt-10 flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="mx-auto mt-10 max-w-xl border p-8 text-center">
            <Tag className="mx-auto size-8 text-primary" />
            <h3 className="mt-4 text-xl">Sign in to discover your offers</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to view discount codes available to your account, including personalised
              promotions.
            </p>
            <Button asChild className="mt-6">
              <Link to="/auth" search={{ next: "/promotions" }}>
                Sign In
              </Link>
            </Button>
          </div>
        ) : loadingCoupons ? (
          <div className="mt-10 flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="sr-only">Loading available coupons</span>
          </div>
        ) : couponError ? (
          <div className="mx-auto mt-10 max-w-xl border border-destructive/30 p-6 text-center">
            <p role="alert" className="text-sm text-destructive">
              {couponError}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : coupons.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl border p-8 text-center">
            <Tag className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-4 text-xl">No available offers right now</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              There are currently no coupons available for your account. Check back soon for new
              offers.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                copiedCode={copiedCode}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
