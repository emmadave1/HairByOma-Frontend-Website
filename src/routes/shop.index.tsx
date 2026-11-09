import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BackendProductCard } from "@/components/shop/BackendProductCard";
import { PageHero, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { productService, type BackendProduct } from "@/services/product.service";

type SearchState = {
  category?: string;
  q?: string;
};

const categories = [
  "Bone Straight",
  "Bouncy(Vietnam and Chinese)",
  "Deep Wave",
  "Pixie Curls",
  "Raw donors",
  "Babytin",
  "Burmese curls",
  "Custom Wigs",
];

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>): SearchState => ({
    ...(typeof s["category"] === "string" ? { category: s["category"] } : {}),
    ...(typeof s["q"] === "string" ? { q: s["q"] } : {}),
  }),

  head: () => ({
    meta: [
      { title: "Shop Luxury Hair - HairbyOma" },
      {
        name: "description",
        content: "Browse HairbyOma wigs, bundles and premium hair textures.",
      },
      {
        property: "og:title",
        content: "Shop Luxury Hair - HairbyOma",
      },
      {
        property: "og:description",
        content: "Browse premium HairbyOma wigs and bundles.",
      },
    ],
  }),

  component: Shop,
});

function AnimatedProductCount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    previousValue.current = value;

    if (startValue === value) return;

    const startTime = performance.now();
    const duration = 450;
    let frame = 0;

    function animate(currentTime: number) {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const nextValue = Math.round(startValue + (value - startValue) * easedProgress);

      setDisplayValue(nextValue);

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    }

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return <>{new Intl.NumberFormat().format(displayValue)}</>;
}

function Shop() {
  const search = Route.useSearch();

  const [q, setQ] = useState(search.q || "");
  const [cat, setCat] = useState(search.category || "All");
  const [sort, setSort] = useState("popular");

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Keep the filters synchronized with URL search parameters.
  useEffect(() => {
    setQ(search.q || "");
    setCat(search.category || "All");
  }, [search.q, search.category]);

  // Fetch products from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await productService.list({
          ...(cat !== "All" ? { category: cat } : {}),
          ...(q.trim() ? { search: q.trim() } : {}),

          page: 1,
          limit: 50,

          sort: sort === "low" ? "price_asc" : sort === "high" ? "price_desc" : "newest",
        });

        if (cancelled) return;

        let result = response.products;

        // Popularity is calculated using ratings from the returned products.
        if (sort === "popular") {
          result = [...result].sort((a, b) => b.rating.average - a.rating.average);
        }

        setProducts(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load products. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Debounce search requests to avoid unnecessary API calls.
    const timer = window.setTimeout(loadProducts, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, cat, sort, retryCount]);

  return (
    <>
      <PageHero
        eyebrow="The collection"
        title="Shop HairbyOma"
        copy="Explore our premium textures, carefully selected wigs and luxurious hair collections."
      />

      <div className="site-container py-10">
        {/* Search, category and sorting filters */}
        <div className="mt-2 grid gap-4 border-y py-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,auto)_auto]">
          {/* Search */}
          <label htmlFor="shop-search" className="relative min-w-0">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

            <Input
              id="shop-search"
              className="pl-10"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search products by name"
              autoComplete="off"
            />
          </label>

          {/* Category filter */}
          <label className="flex min-w-0 items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />

            <select
              className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm"
              value={cat}
              onChange={(event) => setCat(event.target.value)}
              aria-label="Filter products by category"
            >
              <option value="All">All categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          {/* Sorting */}
          <select
            className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:col-span-2 lg:col-span-1"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
          >
            <option value="popular">Top rated</option>
            <option value="new">Newest</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>

        {/* Product count and loading indicator */}
        <div className="mb-5 mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
            {loading ? (
              "Loading products..."
            ) : (
              <>
                <AnimatedProductCount value={products.length} />{" "}
                {products.length === 1 ? "product" : "products"} found
              </>
            )}
          </p>

          {loading && (
            <LoaderCircle
              className="size-5 animate-spin text-primary"
              aria-label="Loading products"
            />
          )}
        </div>

        {/* Error state */}
        {error ? (
          <div className="rounded-lg border border-destructive/30 p-8 text-center" role="alert">
            <h2 className="text-xl font-semibold">Couldn't load products</h2>

            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        ) : loading && products.length === 0 ? (
          /* Loading skeletons */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-[4/6] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <EmptyState
            title="No products found"
            copy="We couldn't find products matching your search. Try another search term or category."
          />
        ) : (
          /* Backend products */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <BackendProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
