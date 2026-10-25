import { AnimatedNumber } from "@/components/motion/StorefrontMotion";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { PageHero, MockNotice } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { categories, products } from "@/data/products";
type SearchState = { category?: string; q?: string };
export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): SearchState => ({
    ...(typeof s["category"] === "string" ? { category: s["category"] } : {}),
    ...(typeof s["q"] === "string" ? { q: s["q"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Shop Luxury Hair — HairbyOma" },
      { name: "description", content: "Browse HairbyOma wigs, bundles and premium hair textures." },
      { property: "og:title", content: "Shop Luxury Hair — HairbyOma" },
      { property: "og:description", content: "Browse premium HairbyOma wigs and bundles." },
    ],
  }),
  component: Shop,
});
function Shop() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q || "");
  const [cat, setCat] = useState(search.category || "All");
  const [sort, setSort] = useState("popular");
  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.mockPrice - b.mockPrice
            : sort === "high"
              ? b.mockPrice - a.mockPrice
              : b.rating - a.rating,
        ),
    [q, cat, sort],
  );
  return (
    <>
      <PageHero
        eyebrow="The collection"
        title="Shop HairbyOma"
        copy="Explore premium textures and ready-to-wear pieces. Displayed amounts are mock calculations, not official prices."
      />
      <div className="site-container py-10">
        <MockNotice>
          Official prices are pending the client price list. Product cards are clearly marked and
          cart totals are demonstration amounts.
        </MockNotice>
        <div className="mt-8 grid gap-4 border-y py-5 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              className="pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products by name"
            />
          </label>
          <label className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <select
            className="h-10 rounded-md border bg-background px-3"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="popular">Popular</option>
            <option value="new">Newest</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          <AnimatedNumber value={visible.length} /> products · Filter options: category, texture,
          length, availability and mock price
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </div>
    </>
  );
}
