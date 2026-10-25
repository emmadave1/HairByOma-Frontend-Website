import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/context/store";
import { products } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { PageHero, EmptyState } from "@/components/shared";
export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — HairbyOma" },
      { name: "description", content: "Save and revisit your favourite HairbyOma pieces." },
      { property: "og:title", content: "HairbyOma Wishlist" },
      { property: "og:description", content: "Your saved HairbyOma pieces." },
    ],
  }),
  component: Page,
});
function Page() {
  const { wishlist } = useStore();
  const list = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <PageHero title="Your wishlist" copy="A considered edit of the HairbyOma pieces you love." />
      <div className="site-container py-10">
        {list.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
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
