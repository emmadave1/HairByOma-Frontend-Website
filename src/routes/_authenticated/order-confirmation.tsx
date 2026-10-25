import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockNotice } from "@/components/shared";
export const Route = createFileRoute("/_authenticated/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmation Preview — HairbyOma" },
      { name: "description", content: "Preview a HairbyOma order confirmation." },
      { property: "og:title", content: "Order Confirmation — HairbyOma" },
      { property: "og:description", content: "A HairbyOma order confirmation preview." },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <div className="site-container py-20">
      <div className="mx-auto max-w-2xl border p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <p className="eyebrow mt-5">Frontend preview</p>
        <h1 className="mt-3 text-5xl">Order Confirmed!</h1>
        <p className="mt-4 text-muted-foreground">Your HairbyOma order has been received.</p>
        <div className="mt-8 grid gap-3 bg-muted p-5 text-left sm:grid-cols-2">
          <Detail label="Order number" value="OMA-2026-1048" />
          <Detail label="Items" value="2 luxury hair pieces" />
          <Detail label="Total" value="Mock total: ₦334,000" />
          <Detail label="Delivery" value="Port Harcourt dispatch" />
          <Detail label="Customer" value="Demo customer" />
          <Detail label="Processing" value="Awaiting final client timeframe" />
        </div>
        <div className="mt-6">
          <MockNotice>No order was placed, stored or paid for.</MockNotice>
        </div>
        <Button asChild className="mt-7">
          <Link to="/account">View customer account</Link>
        </Button>
      </div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
