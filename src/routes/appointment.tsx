import { createFileRoute } from "@tanstack/react-router";
import { BookingPage } from "@/components/booking/BookingPage";
export const Route = createFileRoute("/appointment")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — HairbyOma" },
      {
        name: "description",
        content:
          "Book a HairbyOma hair consultation, custom wig fitting, install or revamp. Pick your service, date and time and confirm on WhatsApp.",
      },
      { property: "og:title", content: "Book an Appointment — HairbyOma" },
      {
        property: "og:description",
        content:
          "Book a HairbyOma hair consultation, custom wig fitting, install or revamp. Pick your service, date and time and confirm on WhatsApp.",
      },
    ],
  }),
  component: BookingPage,
});
