import { createFileRoute } from "@tanstack/react-router";
import { HowToOrderPage } from "@/components/shared/ContentPages";
export const Route = createFileRoute("/how-to-order")({
  head: () => ({
    meta: [
      { title: "How to Order — HairbyOma" },
      {
        name: "description",
        content: "Follow seven simple steps to choose and order HairbyOma hair.",
      },
      { property: "og:title", content: "How to Order — HairbyOma" },
      {
        property: "og:description",
        content: "Follow seven simple steps to choose and order HairbyOma hair.",
      },
    ],
  }),
  component: HowToOrderPage,
});
