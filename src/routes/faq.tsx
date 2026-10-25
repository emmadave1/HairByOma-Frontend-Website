import { createFileRoute } from "@tanstack/react-router";
import { FaqPage } from "@/components/shared/ContentPages";
export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — HairbyOma" },
      {
        name: "description",
        content: "Answers about HairbyOma quality, ordering, delivery, rewards and custom wigs.",
      },
      { property: "og:title", content: "Frequently Asked Questions — HairbyOma" },
      {
        property: "og:description",
        content: "Answers about HairbyOma quality, ordering, delivery, rewards and custom wigs.",
      },
    ],
  }),
  component: FaqPage,
});
