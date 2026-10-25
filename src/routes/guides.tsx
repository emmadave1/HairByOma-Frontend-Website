import { createFileRoute } from "@tanstack/react-router";
import { HairGuidePage } from "@/components/guides/HairGuidePage";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Interactive Hair Length & Colour Guide — HairbyOma" },
      {
        name: "description",
        content:
          "Preview HairbyOma colours and compare where hair lengths from 16 to 30 inches approximately fall.",
      },
      { property: "og:title", content: "Interactive Hair Length & Colour Guide — HairbyOma" },
      {
        property: "og:description",
        content:
          "Choose a hair colour and visually compare HairbyOma lengths from 16 to 30 inches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HairGuidePage,
});
