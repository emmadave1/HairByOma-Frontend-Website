import { createFileRoute } from "@tanstack/react-router";
import { DeliveryPage } from "@/components/shared/ContentPages";
export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery & Pickup — HairbyOma" },
      {
        name: "description",
        content: "Review Port Harcourt pickup, dispatch and nationwide delivery information.",
      },
      { property: "og:title", content: "Delivery & Pickup — HairbyOma" },
      {
        property: "og:description",
        content: "Review Port Harcourt pickup, dispatch and nationwide delivery information.",
      },
    ],
  }),
  component: DeliveryPage,
});
