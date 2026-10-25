import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/shared/ContentPages";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact HairbyOma — Port Harcourt" },
      {
        name: "description",
        content: "Contact HairbyOma by WhatsApp, phone or the frontend enquiry form.",
      },
      { property: "og:title", content: "Contact HairbyOma — Port Harcourt" },
      {
        property: "og:description",
        content: "Contact HairbyOma by WhatsApp, phone or the frontend enquiry form.",
      },
    ],
  }),
  component: ContactPage,
});
