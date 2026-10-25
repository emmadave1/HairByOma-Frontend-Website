import { createFileRoute } from "@tanstack/react-router";
import { ReferralPage } from "@/components/shared/LoyaltyPages";
export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals — HairbyOma" },
      { name: "description", content: "Preview the HairbyOma referrals customer experience." },
      { property: "og:title", content: "Referrals — HairbyOma" },
      {
        property: "og:description",
        content: "Preview the HairbyOma referrals customer experience.",
      },
    ],
  }),
  component: ReferralPage,
});
