import { createFileRoute } from "@tanstack/react-router";
import { Gift, Tag } from "lucide-react";
import { PageHero, MockNotice } from "@/components/shared";
import { siteConfig } from "@/data/config";
import { SaleSection } from "@/components/promotions/SaleSection";
export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Holiday Sale & Offers — HairbyOma" },
      {
        name: "description",
        content:
          "HairbyOma holiday sale runs 30 November–16 December 2026. Delivery follows 17–20 December.",
      },
      { property: "og:title", content: "Holiday Sale & Offers — HairbyOma" },
      {
        property: "og:description",
        content:
          "Count down to the HairbyOma sale, 30 November–16 December, with delivery 17–20 December 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <>
      <PageHero
        eyebrow="Limited moments"
        title="Offers & promotions"
        copy="Holiday sale: 30 November–16 December 2026. Delivery: 17–20 December."
      />
      <SaleSection />
      <div className="site-container py-12">
        <MockNotice>
          Sale and delivery dates are confirmed. Discount codes, gifts and qualifying terms below
          remain previews awaiting approval.
        </MockNotice>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="border p-6">
            <Tag className="text-primary" />
            <p className="eyebrow mt-5">Code preview</p>
            <h2 className="mt-2 text-3xl">Offer details</h2>
            <p className="mt-3 text-muted-foreground">
              Use mock code <strong>{siteConfig.promo.code}</strong> during interface testing.
            </p>
          </article>
          <article className="border p-6">
            <Gift className="text-primary" />
            <p className="eyebrow mt-5">Gift with purchase</p>
            <h2 className="mt-2 text-3xl">Luxury care set</h2>
            <p className="mt-3 text-muted-foreground">
              Future qualifying-order gift. Threshold awaits approval.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
