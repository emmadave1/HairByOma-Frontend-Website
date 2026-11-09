import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/context/store";
import { productService, type BackendProduct } from "@/services/product.service";
import { BackendProductCard } from "@/components/shop/BackendProductCard";
import { PageHero, EmptyState } from "@/components/shared";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist - HairbyOma" },
      { name: "description", content: "Save and revisit your favourite HairbyOma pieces." },
      { property: "og:title", content: "HairbyOma Wishlist" },
      { property: "og:description", content: "Your saved HairbyOma pieces." },
    ],
  }),
  component: Page,
});

function Page() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await productService.list({ page: 1, limit: 50 });

        if (active) {
          setProducts(response.products);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load your wishlist. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const list = products.filter((product) => wishlist.includes(product._id));

  return (
    <>
      <PageHero title="Your wishlist" copy="A considered edit of the HairbyOma pieces you love." />

      <div className="site-container py-10">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading your wishlist...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((product) => (
              <BackendProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No favourites yet"
            copy="Tap the heart on any product to save it here."
          />
        )}
      </div>
    </>
  );
}
