import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockNotice } from "@/components/shared";

export const Route = createFileRoute("/_authenticated/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Status - HairbyOma" },
      { name: "description", content: "HairbyOma checkout status." },
      { property: "og:title", content: "Order Status - HairbyOma" },
      { property: "og:description", content: "Information about your HairbyOma checkout." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="site-container py-20">
      <div className="mx-auto max-w-2xl border p-8 text-center">
        <Info className="mx-auto size-14 text-primary" />

        <p className="eyebrow mt-5">Checkout preview</p>

        <h1 className="mt-3 text-4xl md:text-5xl">No order placed yet</h1>

        <p className="mt-4 text-muted-foreground">
          Your checkout experience is being prepared. Your order has not been submitted or stored,
          and no payment has been made.
        </p>

        <div className="mt-8 space-y-4 bg-muted p-5 text-left">
          <div>
            <p className="font-medium">What happens next?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once checkout integration is complete, you will be able to submit your order, receive
              a unique order number, view bank transfer instructions and submit your payment
              receipt.
            </p>
          </div>

          <div>
            <p className="font-medium">Payment verification</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bank transfers will be verified manually before an order is marked as paid and
              processing begins.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <MockNotice>This is a frontend preview. No order has been created.</MockNotice>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/account">View customer account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
