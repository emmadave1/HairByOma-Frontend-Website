import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Heart, Package, Settings, Share2, Trophy, Cake, UserRound } from "lucide-react";
import { PageHero, MockNotice, ProgressMeter } from "@/components/shared";
import { siteConfig } from "@/data/config";
export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Customer Account Preview — HairbyOma" },
      {
        name: "description",
        content: "Preview HairbyOma orders, wishlist, birthday, rewards and referrals.",
      },
      { property: "og:title", content: "HairbyOma Customer Account" },
      { property: "og:description", content: "A frontend customer dashboard preview." },
    ],
  }),
  component: Page,
});
const sections = [
  [Package, "Orders", "2 mock orders", "/order-confirmation"],
  [Heart, "Wishlist", "Saved locally", "/wishlist"],
  [Cake, "Birthday", "23 September", "/birthday-club"],
  [Gift, "Rewards", "28 points", "/rewards"],
  [Share2, "Referrals", "6 successful", "/referrals"],
  [Trophy, "Annual Challenge", "65% complete", "/annual-challenge"],
  [UserRound, "Saved details", "Frontend placeholder", "/contact"],
  [Settings, "Profile settings", "API integration point", "/contact"],
] as const;
function Page() {
  return (
    <>
      <PageHero
        eyebrow="Welcome back"
        title="Your account"
        copy="View your orders, saved pieces and HairbyOma benefits."
      />
      <div className="site-container py-10">
        <MockNotice>
          Order history, points and benefit values remain demonstration data until their customer
          services are connected.
        </MockNotice>
        <div className="mt-8 grid gap-5 md:grid-cols-[1.6fr_1fr]">
          <div className="border p-7">
            <p className="eyebrow">2026 progress</p>
            <h2 className="mt-2 text-3xl">
              ₦{siteConfig.rewards.purchased.toLocaleString()} purchased
            </h2>
            <div className="mt-6">
              <ProgressMeter label="Annual target" value={65} />
            </div>
          </div>
          <div className="bg-secondary/45 p-7">
            <p className="text-sm text-muted-foreground">Next reward</p>
            <p className="mt-2 text-2xl font-display">Complimentary care set</p>
            <p className="mt-4 text-sm">₦350,000 remaining</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map(([I, title, copy, to]) => (
            <Link
              key={title}
              to={to}
              className="border p-5 transition hover:border-primary hover:bg-muted"
            >
              <I className="text-primary" />
              <h2 className="mt-4 text-xl">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
