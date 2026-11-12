import { Heart, ImageOff, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import type { BackendProduct } from "@/services/product.service";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function BackendProductCard({
  product,
}: {
  product: BackendProduct;
}) {
  const { toggleWishlist, wishlist } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const liked = wishlist.includes(product._id);
  const slug = slugify(product.name);
  const image = product.images?.[0];

  const prices = product.variants.length
    ? product.variants.map((variant) => variant.price)
    : [product.price];

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  const availableStock = product.variants.length
    ? product.variants.reduce((total, variant) => total + variant.stock, 0)
    : product.stock;

  const lengths = product.variants
    .map((variant) => variant.length)
    .sort((a, b) => a - b);

  const priceLabel =
    lowestPrice === highestPrice
      ? `₦${lowestPrice.toLocaleString()}`
      : `₦${lowestPrice.toLocaleString()} - ?${highestPrice.toLocaleString()}`;

  function save() {
    if (!user) {
      navigate({ to: "/auth", search: { next: "/wishlist" } });
      return;
    }

    toggleWishlist(product._id);
  }

  function viewProduct() {
    navigate({
      to: "/shop/$slug",
      params: { slug },
    });
  }

  return (
    <article className="product-card group">
      <div className="relative overflow-hidden bg-muted">
        <Link to="/shop/$slug" params={{ slug }}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              width={1024}
              height={1280}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.045]"
            />
          ) : (
            <div className="grid aspect-[4/5] w-full place-items-center bg-secondary/40 text-muted-foreground">
              <div className="text-center">
                <ImageOff className="mx-auto size-10 opacity-50" />
                <p className="mt-2 text-xs">Image coming soon</p>
              </div>
            </div>
          )}
        </Link>

        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Featured
          </span>
        )}

        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3"
          onClick={save}
          aria-label={
            user
              ? liked
                ? "Remove from wishlist"
                : "Add to wishlist"
              : "Sign in to save to wishlist"
          }
        >
          <Heart className={liked ? "fill-primary text-primary" : ""} />
        </Button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{product.category}</span>
          <span className="flex items-center gap-1">
            <Star className="size-3 fill-primary text-primary" />
            {product.rating.average.toFixed(1)}
            <span>({product.rating.count})</span>
          </span>
        </div>

        <Link
          to="/shop/$slug"
          params={{ slug }}
          className="mt-2 block font-display text-xl font-semibold hover:text-primary"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-sm text-muted-foreground">
          {lengths.length
            ? `${lengths[0]}-${lengths[lengths.length - 1]} inches`
            : "Available for purchase"}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{priceLabel}</p>
            <p className="text-[11px] text-muted-foreground">
              {availableStock > 0
                ? `₦${availableStock} in stock`
                : "Out of stock"}
            </p>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={viewProduct}
            disabled={availableStock <= 0}
            aria-label={`View ₦${product.name} options`}
          >
            <ShoppingCart />
          </Button>
        </div>

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={viewProduct}
        >
          View product
        </Button>
      </div>
    </article>
  );
}
