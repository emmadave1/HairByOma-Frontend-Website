import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/shared/ContentPages";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HairbyOma — Our Story" },
      {
        name: "description",
        content: "Discover HairbyOma’s mission, values and luxury hair commitment.",
      },
      { property: "og:title", content: "About HairbyOma — Our Story" },
      {
        property: "og:description",
        content: "Discover HairbyOma’s mission, values and luxury hair commitment.",
      },
    ],
  }),
  component: AboutPage,
});
