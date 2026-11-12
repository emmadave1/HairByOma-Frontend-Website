import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProgressMeter } from "@/components/shared";
import { customerOrderService } from "@/services/order.service";
import { useAuth } from "@/context/auth";
import { DashboardOverview } from "@/components/account/DashboardOverview";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account - HairbyOma" },
      {
        name: "description",
        content: "Manage your HairbyOma customer account and profile.",
      },
      { property: "og:title", content: "HairbyOma Customer Account" },
      {
        property: "og:description",
        content: "Manage your HairbyOma customer account.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { user, loading: authLoading } = useAuth();

  const [yearlySpent, setYearlySpent] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const currentYear = new Date().getFullYear();
  const annualTarget = 1_000_000;

  const annualProgress = Math.min(
    Math.round((yearlySpent / annualTarget) * 100),
    100,
  );

  const remainingAmount = Math.max(annualTarget - yearlySpent, 0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrdersLoading(false);
      return;
    }

    let active = true;

    customerOrderService
      .getMyOrders()
      .then(({ orders }) => {
        const total = orders.reduce((sum, order) => {
          const orderYear = new Date(order.createdAt).getFullYear();

          const isEligible =
            order.paymentStatus === "PAID" &&
            !order.refundedAt &&
            order.orderStatus !== "CANCELLED" &&
            orderYear === currentYear;

          return isEligible ? sum + Number(order.totalAmount || 0) : sum;
        }, 0);

        if (active) setYearlySpent(total);
      })
      .catch(() => {
        if (active) {
          setOrdersError("Unable to load your yearly purchase progress.");
        }
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading, currentYear]);

  return (
    <>
      <DashboardOverview />

      <div className="site-container py-10">
        <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
          <div className="border p-7">
            <p className="eyebrow">{currentYear} purchase progress</p>
            <h2 className="mt-2 text-3xl">
              {ordersLoading
                ? "Loading..."
                : `₦${yearlySpent.toLocaleString("en-NG")} purchased`}
            </h2>

            <div className="mt-6">
              <ProgressMeter
                label="Annual target"
                value={ordersLoading ? 0 : annualProgress}
              />
            </div>

            {ordersError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {ordersError}
              </p>
            )}
          </div>

          <div className="bg-secondary/45 p-7">
            <p className="text-sm text-muted-foreground">
              Remaining to reach your target
            </p>

            <p className="mt-2 text-2xl font-display">
              {ordersLoading
                ? "Loading..."
                : `₦${remainingAmount.toLocaleString("en-NG")}`}
            </p>

            <p className="mt-4 text-sm">
              Annual target: ₦{annualTarget.toLocaleString("en-NG")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
