import { createFileRoute } from "@tanstack/react-router";
import { PoliciesPage } from "@/components/shared/ContentPages";
export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Customer Policies — HairbyOma" },
      {
        name: "description",
        content:
          "Read HairbyOma payment, delivery, refund, exchange and custom order policy placeholders.",
      },
      { property: "og:title", content: "Customer Policies — HairbyOma" },
      {
        property: "og:description",
        content:
          "Read HairbyOma payment, delivery, refund, exchange and custom order policy placeholders.",
      },
    ],
  }),
  component: PoliciesPage,
});
