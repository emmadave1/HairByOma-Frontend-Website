import { createFileRoute } from "@tanstack/react-router";
import { RewardsPage } from "@/components/shared/LoyaltyPages";
export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — HairbyOma" },
      { name: "description", content: "Preview the HairbyOma rewards customer experience." },
      { property: "og:title", content: "Rewards — HairbyOma" },
      { property: "og:description", content: "Preview the HairbyOma rewards customer experience." },
    ],
  }),
  component: RewardsPage,
});
