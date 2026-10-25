import { useState } from "react";
import { Copy, Gift, MessageCircle, Trophy, Users } from "lucide-react";
import { PageHero, ProgressMeter, MockNotice } from ".";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/data/config";
const money = (n: number) => `₦${n.toLocaleString()}`;
export function RewardsPage() {
  const r = siteConfig.rewards;
  return (
    <>
      <PageHero
        eyebrow="HairbyOma loyalty"
        title="Your HairbyOma Rewards"
        copy="A premium preview of future purchase, referral and engagement rewards."
      />
      <div className="site-container py-12">
        <MockNotice />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Stat title="Annual target" value={money(r.annualTarget)} />
          <Stat title="Amount purchased" value={money(r.purchased)} />
          <Stat title="Current points" value="28 points" />
        </div>
        <div className="mt-6 border p-7">
          <ProgressMeter
            label="Annual purchase progress"
            value={Math.round((r.purchased / r.annualTarget) * 100)}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            {money(r.annualTarget - r.purchased)} remaining · Next reward: complimentary care set
          </p>
        </div>
        <h2 className="mt-12 text-3xl">How points can be earned</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Referrals", r.referralPoints],
            ["Reviews", r.reviewPoints],
            ["Birthday", r.birthdayPoints],
            ["Social follow", r.socialFollowPoints],
            ["Repeat purchase", r.repeatPurchasePoints],
          ].map(([l, v]) => (
            <div key={String(l)} className="border p-4">
              <p className="text-sm text-muted-foreground">{l}</p>
              <p className="mt-2 text-2xl font-semibold">{v} pts</p>
              {Number(v) === 0 && <small>Configurable</small>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
export function BirthdayPage() {
  const [birthday, setBirthday] = useState("1995-09-23");
  return (
    <>
      <PageHero
        eyebrow="A little something for you"
        title="Birthday Club"
        copy="A frontend preview of birthday status, rewards and future automated messaging."
      />
      <div className="site-container grid gap-7 py-12 lg:grid-cols-2">
        <div className="border p-7">
          <Gift className="text-primary" />
          <h2 className="mt-4 text-3xl">Your birthday</h2>
          <label className="mt-5 block">
            <span className="form-label">Birthday date</span>
            <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </label>
          <Button className="mt-4">Save locally</Button>
        </div>
        <div className="bg-secondary/45 p-7">
          <p className="eyebrow">Upcoming birthday</p>
          <h2 className="mt-3 text-4xl">10 days to celebrate</h2>
          <p className="mt-4 text-muted-foreground">
            Birthday reward: configured by HairbyOma
            <br />
            Birthday discount: awaiting final programme rules
          </p>
          <MockNotice>
            Automated birthday messaging and discount issuing are not implemented.
          </MockNotice>
        </div>
      </div>
    </>
  );
}
export function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const link = "https://hairbyoma.example/r/OMA123";
  return (
    <>
      <PageHero
        eyebrow="Share the beauty"
        title="Referral Program"
        copy="Invite friends and preview how future referral tracking will feel."
      />
      <div className="site-container py-12">
        <MockNotice />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Stat title="Your referral code" value="OMA123" />
          <Stat title="Successful referrals" value="6" />
          <Stat title="Referral points" value="24 pts" />
        </div>
        <div className="mt-6 border p-6">
          <p className="form-label">Referral link</p>
          <div className="flex gap-2">
            <Input value={link} readOnly />
            <Button
              onClick={() => {
                navigator.clipboard?.writeText(link);
                setCopied(true);
              }}
            >
              <Copy />
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button asChild variant="secondary">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Discover HairbyOma: ${link}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle />
                Share
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Friend</th>
                <th>Status</th>
                <th>Date</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Ada N.", "Successful", "12 Aug 2026", "4"],
                ["Tomi A.", "Successful", "04 Jul 2026", "4"],
                ["Ife C.", "Pending", "28 Jun 2026", "—"],
              ].map((r) => (
                <tr key={r[0]} className="border-b">
                  {r.map((c) => (
                    <td key={c} className="p-3">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export function ChallengePage() {
  const c = siteConfig.challenge;
  return (
    <>
      <PageHero
        eyebrow="2026 member journey"
        title="HairbyOma Annual Challenge"
        copy="A motivating snapshot of yearly purchases, referrals and future benefits."
      />
      <div className="site-container py-12">
        <MockNotice />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border p-7">
            <Trophy className="text-primary" />
            <h2 className="mt-4 text-3xl">Purchase challenge</h2>
            <p className="mt-2 text-muted-foreground">
              {money(c.purchased)} of {money(c.purchaseTarget)}
            </p>
            <div className="mt-6">
              <ProgressMeter
                label="Yearly purchase amount"
                value={Math.round((c.purchased / c.purchaseTarget) * 100)}
              />
            </div>
          </div>
          <div className="border p-7">
            <Users className="text-primary" />
            <h2 className="mt-4 text-3xl">Referral challenge</h2>
            <p className="mt-2 text-muted-foreground">
              {c.referrals} of {c.referralTarget} successful referrals
            </p>
            <div className="mt-6">
              <ProgressMeter
                label="Referral target"
                value={Math.round((c.referrals / c.referralTarget) * 100)}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat title="Reward status" value="In progress" />
          <Stat title="Free gift" value="Not yet qualified" />
          <Stat title="Free delivery" value="Qualified" />
        </div>
      </div>
    </>
  );
}
function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="border bg-background p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
