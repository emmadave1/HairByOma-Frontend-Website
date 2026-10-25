import { createFileRoute } from "@tanstack/react-router";
import { ChallengePage } from "@/components/shared/LoyaltyPages";
export const Route = createFileRoute("/_authenticated/annual-challenge")({
  head: () => ({
    meta: [
      { title: "Annual Challenge — HairbyOma" },
      {
        name: "description",
        content: "Preview the HairbyOma annual challenge customer experience.",
      },
      { property: "og:title", content: "Annual Challenge — HairbyOma" },
      {
        property: "og:description",
        content: "Preview the HairbyOma annual challenge customer experience.",
      },
    ],
  }),
  component: ChallengePage,
});
