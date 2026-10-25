import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import type { Product } from "@/types";
export function ProductCard({ product, saleBadge }: { product: Product; saleBadge?: boolean }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const liked = wishlist.includes(product.id);
  function save() {
    if (!user) {
      navigate({ to: "/auth", search: { next: "/wishlist" } });
      return;
    }
    toggleWishlist(product.id);
  }
  function buy() {
    addToCart(product);
    if (user) navigate({ to: "/checkout" });
    else navigate({ to: "/auth", search: { next: "/checkout" } });
  }
  return (
    <article className="product-card group">
      <div className="relative overflow-hidden bg-muted">
        <Link to="/shop/$slug" params={{ slug: product.slug }}>
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1280}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.045]"
          />
        </Link>
        {saleBadge && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Sale
          </span>
        )}
        {product.badge && (
          <span
            className={`absolute left-3 ${saleBadge ? "top-12" : "top-3"} rounded-full bg-background/90 px-3 py-1 text-xs font-semibold`}
          >
            {product.badge}
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
            {product.rating}
          </span>
        </div>
        <Link
          to="/shop/$slug"
          params={{ slug: product.slug }}
          className="mt-2 block font-display text-xl font-semibold hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.texture} · {product.lengths[0]}–{product.lengths.at(-1)} inches
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{product.priceLabel}</p>
            <p className="text-[11px] text-muted-foreground">Mock amount used in cart</p>
          </div>
          <Button
            size="icon"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart />
          </Button>
        </div>
        <Button variant="outline" className="mt-3 w-full" onClick={buy}>
          Buy now
        </Button>
      </div>
    </article>
  );
}
