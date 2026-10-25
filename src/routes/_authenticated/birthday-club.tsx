import { createFileRoute } from "@tanstack/react-router";
import { BirthdayPage } from "@/components/shared/LoyaltyPages";
export const Route = createFileRoute("/_authenticated/birthday-club")({
  head: () => ({
    meta: [
      { title: "Birthday Club — HairbyOma" },
      { name: "description", content: "Preview the HairbyOma birthday club customer experience." },
      { property: "og:title", content: "Birthday Club — HairbyOma" },
      {
        property: "og:description",
        content: "Preview the HairbyOma birthday club customer experience.",
      },
    ],
  }),
  component: BirthdayPage,
});
