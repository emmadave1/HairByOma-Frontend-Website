import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, MessageCircle, Minus, Plus, ShoppingCart, ZoomIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MockNotice, SectionTitle } from "@/components/shared";
import { ProductCard } from "@/components/shop/ProductCard";
import { products } from "@/data/products";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const p = products.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData: p }) => ({
    meta: [
      { title: p ? `${p.name} — HairbyOma` : "Product — HairbyOma" },
      { name: "description", content: p?.description || "HairbyOma luxury hair product." },
      { property: "og:title", content: p?.name || "HairbyOma product" },
      { property: "og:description", content: p?.description || "Luxury hair from HairbyOma." },
    ],
  }),
  component: ProductDetail,
});
function ProductDetail() {
  const p = Route.useLoaderData();
  const [length, setLength] = useState(p.lengths[0] ?? 10);
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  function add() {
    for (let i = 0; i < qty; i++) addToCart(p, length);
  }
  function save() {
    if (!user) {
      navigate({ to: "/auth", search: { next: `/shop/${p.slug}` } });
      return;
    }
    toggleWishlist(p.id);
  }
  function buy() {
    add();
    if (user) navigate({ to: "/checkout" });
    else navigate({ to: "/auth", search: { next: "/checkout" } });
  }
  return (
    <div className="site-container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid grid-cols-[70px_1fr] gap-3">
          <div className="grid content-start gap-2">
            {[1, 2, 3].map((n) => (
              <img key={n} src={p.image} alt="" className="aspect-square w-full object-cover" />
            ))}
          </div>
          <button
            className="group relative overflow-hidden"
            aria-label="Open product image lightbox"
          >
            <img
              src={p.image}
              alt={`${p.name}, ${p.texture} hair`}
              className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
            />
            <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-background">
              <ZoomIn />
            </span>
          </button>
        </div>
        <div className="lg:py-5">
          <p className="eyebrow">{p.category}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-3 text-sm">
            ★★★★★ <span className="text-muted-foreground">{p.rating} · Mock reviews</span>
          </p>
          <p className="mt-5 text-xl font-semibold">{p.priceLabel}</p>
          <p className="text-xs text-muted-foreground">
            A mock amount of ₦{p.mockPrice.toLocaleString()} is used for cart demonstrations.
          </p>
          <p className="mt-6 leading-7 text-muted-foreground">{p.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-y py-5 text-sm">
            <Spec label="Texture" value={p.texture} />
            <Spec label="Colour" value={p.color} />
            <Spec label="Weight" value={p.weight} />
            <Spec label="Density" value={p.density || "Varies"} />
          </div>
          <label className="mt-6 block">
            <span className="form-label">Choose length</span>
            <select
              className="h-11 w-full rounded-md border bg-background px-3"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            >
              {p.lengths.map((l) => (
                <option key={l} value={l}>
                  {l} inches
                </option>
              ))}
            </select>
          </label>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-11 items-center border">
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus />
              </Button>
              <span className="w-10 text-center">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}>
                <Plus />
              </Button>
            </div>
            <Button magnetic className="flex-1" size="lg" onClick={add}>
              <ShoppingCart />
              Add to cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-11"
              onClick={save}
              aria-label={user ? "Save to wishlist" : "Sign in to save to wishlist"}
            >
              <Heart className={wishlist.includes(p.id) ? "fill-primary text-primary" : ""} />
            </Button>
          </div>
          <Button className="mt-3 w-full" variant="secondary" size="lg" onClick={buy}>
            Buy now
          </Button>
          <Button asChild className="mt-3 w-full" variant="outline" size="lg">
            <a href="https://wa.me/2348102968799" target="_blank" rel="noreferrer">
              <MessageCircle />
              Order via WhatsApp
            </a>
          </Button>
          <MockNotice>
            Selections stay in this browser only. No order or payment is submitted.
          </MockNotice>
          <div className="mt-6 border-l-2 border-primary pl-4">
            <p className="font-semibold">Need a custom version?</p>
            <Link to="/custom-wig" className="text-sm text-primary">
              Customize your wig →
            </Link>
          </div>
        </div>
      </div>
      <section className="py-16">
        <SectionTitle title="You may also love" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}
