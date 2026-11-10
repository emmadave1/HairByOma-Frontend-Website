import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackendProductCard } from "@/components/shop/BackendProductCard";
import { SectionTitle } from "@/components/shared";
import { siteConfig } from "@/data/config";
import { productService, type BackendProduct } from "@/services/product.service";
import { getSaleCountdown } from "@/lib/sale-countdown";

export function SaleSection() {
  const [now, setNow] = useState<number | null>(null);
  const [saleProducts, setSaleProducts] = useState<BackendProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    setNow(Date.now());

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await productService.list({ page: 1, limit: 50 });

        if (active) {
          const featured = response.products.filter((product) => product.isFeatured);
          setSaleProducts((featured.length ? featured : response.products).slice(0, 4));
        }
      } catch (error) {
        if (active) {
          setProductsError(error instanceof Error ? error.message : "Unable to load products.");
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  if (!siteConfig.promo.enabled) return null;

  const countdown =
    now === null ? null : getSaleCountdown(now, siteConfig.promo.startsAt, siteConfig.promo.endsAt);

  const phase = countdown?.phase;

  return (
    <section
      className="border-y bg-secondary/35 py-12 md:py-16"
      aria-label="HairbyOma holiday sale"
    >
      <div className="site-container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">30 November - 16 December 2026</p>

          <h2 className="mt-3 text-4xl md:text-5xl">{siteConfig.promo.label}</h2>

          <p className="mt-4 max-w-lg text-muted-foreground">
            {phase === "ended"
              ? "Our holiday sale has ended. Thank you for shopping with HairbyOma."
              : phase === "active"
                ? "The holiday sale is open. Find your next signature look."
                : "Your next signature look awaits. Save the dates for our holiday sale."}
          </p>

          <p className="mt-5 flex items-center gap-2 text-sm">
            <Truck className="size-4 shrink-0 text-primary" />
            Delivery: 17-20 December 2026, after the sale
          </p>

          <Button magnetic asChild className="mt-6">
            <Link to="/shop">
              {phase === "active" ? "Shop the sale" : "Explore the collection"}
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="min-w-0" data-reveal>
          <p className="mb-5 text-center text-sm font-medium uppercase">
            {phase === "ended"
              ? "Sale closed"
              : phase === "active"
                ? "Sale ends in"
                : "Sale starts in"}
          </p>

          {phase !== "ended" && (
            <div
              className="grid grid-cols-4 divide-x divide-border"
              role="timer"
              aria-label={
                phase === "active" ? "Time until the sale ends" : "Time until the sale starts"
              }
            >
              {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
                <div key={unit} className="min-w-0 text-center">
                  <span className="block font-display text-3xl tabular-nums sm:text-5xl">
                    {countdown ? String(countdown[unit]).padStart(2, "0") : "--"}
                  </span>

                  <span className="mt-3 block text-[10px] uppercase text-muted-foreground sm:text-xs">
                    {unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Lagos time - Opens 30 Nov at 12:00 am - Closes 16 Dec at 11:59 pm
          </p>
        </div>
      </div>

      <div className="site-container mt-14">
        <div className="border-t pt-12">
          <SectionTitle
            eyebrow="The sale edit"
            title="In the sale collection"
            copy="Explore selected HairbyOma products with current prices and availability."
            action={
              <Button asChild variant="outline">
                <Link to="/shop">Shop all</Link>
              </Button>
            }
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loadingProducts ? (
              <p className="col-span-full text-center text-muted-foreground">Loading products...</p>
            ) : productsError ? (
              <p className="col-span-full text-center text-destructive">{productsError}</p>
            ) : saleProducts.length ? (
              saleProducts.map((product) => (
                <BackendProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                Products coming soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
