import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  Cake,
  Gift,
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MockNotice } from "@/components/shared";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard Preview — HairbyOma" },
      { name: "description", content: "Frontend-only HairbyOma admin interface demonstration." },
      { property: "og:title", content: "HairbyOma Admin Preview" },
      { property: "og:description", content: "A frontend-only commerce management interface." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
const menu = [
  [LayoutDashboard, "Overview"],
  [ShoppingBag, "Products"],
  [Package, "Orders"],
  [Users, "Customers"],
  [MessageSquare, "Custom orders"],
  [Star, "Reviews"],
  [Image, "Gallery"],
  [Gift, "Rewards"],
  [Cake, "Birthdays"],
  [Users, "Referrals"],
  [Percent, "Promotions"],
  [Settings, "Settings"],
] as const;
const orders = [
  ["OMA-1048", "Amaka N.", "₦334,000", "Processing"],
  ["OMA-1047", "Boma E.", "₦185,000", "Ready"],
  ["OMA-1046", "Lola A.", "₦246,000", "Delivered"],
  ["OMA-1045", "Kelechi O.", "₦128,000", "Pending"],
];
function Page() {
  const [tab, setTab] = useState("Overview");
  return (
    <div className="min-h-screen bg-muted/35">
      <div className="site-container py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Frontend demonstration</p>
            <h1 className="mt-2 text-4xl">HairbyOma Admin</h1>
          </div>
          <Button variant="outline">Preview store</Button>
        </div>
        <div className="mt-6">
          <MockNotice>
            No staff login, persistence, uploads or business actions are connected.
          </MockNotice>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[14rem_1fr]">
          <aside className="border bg-background p-2">
            <nav className="grid gap-1">
              {menu.map(([Icon, label]) => (
                <Button
                  key={label}
                  variant={tab === label ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setTab(label)}
                >
                  <Icon />
                  {label}
                </Button>
              ))}
            </nav>
          </aside>
          <main className="min-w-0">
            {tab === "Overview" ? <Overview /> : <Module title={tab} />}
          </main>
        </div>
      </div>
    </div>
  );
}
function Overview() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Mock revenue" value="₦2.48M" detail="+12% this month" />
        <Metric label="Orders" value="48" detail="8 need attention" />
        <Metric label="Customers" value="326" detail="21 new" />
        <Metric label="Rewards issued" value="184" detail="Mock points" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="border bg-background p-6">
          <div className="flex justify-between">
            <h2 className="text-2xl">Recent orders</h2>
            <BarChart3 className="text-primary" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((r) => (
                  <tr className="border-b" key={r[0]}>
                    {r.map((c) => (
                      <td className="p-3" key={c}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="border bg-background p-6">
          <h2 className="text-2xl">Top products</h2>
          {["Signature Deep Wave", "Layered Bounce Wig", "Luxe Blunt Bob"].map((p, i) => (
            <div key={p} className="mt-5 flex justify-between border-b pb-3">
              <span>{p}</span>
              <strong>{18 - i * 4} sold</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      <p className="mt-2 text-xs text-primary">{detail}</p>
    </div>
  );
}
function Module({ title }: { title: string }) {
  return (
    <section className="border bg-background p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Management preview</p>
          <h2 className="mt-2 text-3xl">{title}</h2>
        </div>
        <Button>Add new</Button>
      </div>
      <div className="mt-6 flex gap-3">
        <Input placeholder={`Search ${title.toLowerCase()}`} className="max-w-sm" />
        <Button variant="outline">Filter</Button>
      </div>
      <div className="mt-6 grid min-h-72 place-items-center border border-dashed text-center text-muted-foreground">
        <div>
          <Package className="mx-auto mb-3" />
          <p>Mock {title.toLowerCase()} management workspace</p>
          <p className="mt-1 text-sm">Forms, tables and API actions connect here later.</p>
        </div>
      </div>
    </section>
  );
}
