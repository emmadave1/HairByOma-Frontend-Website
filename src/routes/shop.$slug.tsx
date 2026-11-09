import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  ZoomIn,
  ImageOff,
  LoaderCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/shared";
import { BackendProductCard } from "@/components/shop/BackendProductCard";
import { productService, type BackendProduct } from "@/services/product.service";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    const response = await productService.list({
      page: 1,
      limit: 50,
    });

    const products = response.products;

    const product = products.find((item) => slugify(item.name) === params.slug);

    if (!product) {
      throw notFound();
    }

    return {
      product,
      related: products.filter((item) => item._id !== product._id).slice(0, 4),
    };
  },

  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.product.name} - HairbyOma` : "Product - HairbyOma",
      },
      {
        name: "description",
        content: loaderData?.product.description || "HairbyOma luxury hair product.",
      },
      {
        property: "og:title",
        content: loaderData?.product.name || "HairbyOma product",
      },
      {
        property: "og:description",
        content: loaderData?.product.description || "Luxury hair from HairbyOma.",
      },
    ],
  }),

  component: ProductDetail,
});

function ProductDetail() {
  const { product: p, related } = Route.useLoaderData();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(p.variants[0]?._id || "");
  const [qty, setQty] = useState(1);

  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const images = p.images || [];
  const image = images[selectedImage];

  const selectedVariant = p.variants.find((variant) => variant._id === selectedVariantId);

  const currentPrice = selectedVariant?.price ?? p.price;
  const currentStock = selectedVariant?.stock ?? p.stock;

  const isOutOfStock = currentStock <= 0;
  const hasVariants = p.variants.length > 0;
  const hasSelectedVariant = !hasVariants || Boolean(selectedVariant);

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(currentPrice);

  // Keep the quantity within the available stock.
  useEffect(() => {
    setQty((currentQty) => {
      if (currentStock <= 0) return 1;

      return Math.min(Math.max(1, currentQty), currentStock);
    });
  }, [currentStock]);

  // Handle keyboard controls when the image lightbox is open.
  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowRight") {
        setSelectedImage((current) => (current < images.length - 1 ? current + 1 : 0));
      }

      if (event.key === "ArrowLeft") {
        setSelectedImage((current) => (current > 0 ? current - 1 : images.length - 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, images.length]);

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    setQty(1);
    setMessage("");
  }

  function validatePurchase() {
    if (!hasSelectedVariant) {
      setMessage("Please select a product variant.");
      return false;
    }

    if (isOutOfStock) {
      setMessage("This product is currently out of stock.");
      return false;
    }

    if (qty > currentStock) {
      setMessage(`Only ${currentStock} item(s) are available.`);
      return false;
    }

    return true;
  }

  async function add() {
    if (!validatePurchase()) return;

    setAdding(true);
    setMessage("");

    try {
      await addToCart({
        productId: p._id,
        ...(selectedVariant ? { variantId: selectedVariant._id } : {}),
        quantity: qty,
      });

      setMessage("Added to your cart successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add this product.");
    } finally {
      setAdding(false);
    }
  }

  async function buy() {
    if (!validatePurchase()) return;

    setAdding(true);
    setMessage("");

    try {
      await addToCart({
        productId: p._id,
        ...(selectedVariant ? { variantId: selectedVariant._id } : {}),
        quantity: qty,
      });

      if (user) {
        navigate({ to: "/checkout" });
      } else {
        navigate({
          to: "/auth",
          search: { next: "/checkout" },
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue to checkout.");

      setAdding(false);
    }
  }

  function save() {
    if (!user) {
      navigate({
        to: "/auth",
        search: { next: `/shop/${slugify(p.name)}` },
      });

      return;
    }

    toggleWishlist(p._id);
  }

  function previousImage() {
    setSelectedImage((current) => (current > 0 ? current - 1 : images.length - 1));
  }

  function nextImage() {
    setSelectedImage((current) => (current < images.length - 1 ? current + 1 : 0));
  }

  return (
    <div className="site-container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product image gallery */}
        <div className="grid min-w-0 gap-3 sm:grid-cols-[64px_minmax(0,1fr)]">
          {/* Image thumbnails */}
          {images.length > 0 && (
            <div className="order-2 grid grid-cols-4 content-start gap-2 sm:order-1 sm:grid-cols-1">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden border transition-colors ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                >
                  <img
                    src={src}
                    alt={`${p.name} view ${index + 1}`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main product image */}
          <div className="group relative order-1 min-w-0 overflow-hidden bg-muted sm:order-2">
            {image ? (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="block w-full cursor-zoom-in"
                  aria-label="Open product image preview"
                >
                  <img
                    src={image}
                    alt={p.name}
                    className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                  />

                  <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-background shadow-sm">
                    <ZoomIn className="size-5" />
                  </span>
                </button>
              </>
            ) : (
              <div className="grid aspect-[4/5] place-items-center text-muted-foreground">
                <div className="text-center">
                  <ImageOff className="mx-auto size-10 opacity-50" />
                  <p className="mt-2 text-sm">Product image coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product information */}
        <div className="min-w-0 lg:py-5">
          <p className="eyebrow">{p.category}</p>

          <h1 className="mt-3 break-words text-4xl md:text-5xl">{p.name}</h1>

          {/* Product rating */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span
              className="tracking-wide text-primary"
              aria-label={`${p.rating.average} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>{index < Math.round(p.rating.average) ? "★" : "☆"}</span>
              ))}
            </span>

            <span className="text-muted-foreground">
              {p.rating.average.toFixed(1)} ({p.rating.count}{" "}
              {p.rating.count === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Price */}
          <p className="mt-5 text-2xl font-semibold">{formattedPrice}</p>

          {/* Stock information */}
          <p
            className={`mt-2 text-xs ${
              isOutOfStock ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {isOutOfStock ? "Currently out of stock" : `${currentStock} available in stock`}
          </p>

          {/* Description */}
          <p className="mt-6 whitespace-pre-line leading-7 text-muted-foreground">
            {p.description}
          </p>

          {/* Variant selection */}
          {hasVariants ? (
            <div className="mt-6 border-y py-5">
              <label className="block">
                <span className="form-label">Choose product variant</span>

                <select
                  className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm"
                  value={selectedVariantId}
                  onChange={(event) => selectVariant(event.target.value)}
                >
                  <option value="" disabled>
                    Select a variant
                  </option>

                  {p.variants.map((variant) => (
                    <option key={variant._id} value={variant._id}>
                      {variant.length} inches · {variant.texture} · {variant.colour}
                      {variant.density ? ` · ${variant.density}% density` : ""}
                      {" · "}
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      }).format(variant.price)}
                      {variant.stock <= 0 ? " (Out of stock)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {selectedVariant && (
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Spec label="Length" value={`${selectedVariant.length} inches`} />

                  <Spec label="Texture" value={selectedVariant.texture} />

                  <Spec label="Colour" value={selectedVariant.colour} />

                  <Spec
                    label="Density"
                    value={
                      selectedVariant.density ? `${selectedVariant.density}%` : "Not specified"
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 border-y py-5 text-sm">
              <Spec label="Category" value={p.category} />

              <Spec label="Availability" value={isOutOfStock ? "Out of stock" : "In stock"} />
            </div>
          )}

          {/* Quantity and cart actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-11 shrink-0 items-center border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                disabled={qty <= 1 || adding}
                aria-label="Decrease quantity"
              >
                <Minus />
              </Button>

              <span className="w-9 text-center text-sm" aria-live="polite">
                {qty}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQty((current) => Math.min(currentStock, current + 1))}
                disabled={qty >= currentStock || adding}
                aria-label="Increase quantity"
              >
                <Plus />
              </Button>
            </div>

            <Button
              magnetic
              className="min-w-0 flex-1"
              size="lg"
              onClick={() => void add()}
              disabled={adding || isOutOfStock || !hasSelectedVariant}
            >
              {adding ? <LoaderCircle className="animate-spin" /> : <ShoppingCart />}
              Add to cart
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              onClick={save}
              aria-label={user ? "Save to wishlist" : "Sign in to save to wishlist"}
            >
              <Heart className={wishlist.includes(p._id) ? "fill-primary text-primary" : ""} />
            </Button>
          </div>

          {/* Buy now */}
          <Button
            className="mt-3 w-full"
            variant="secondary"
            size="lg"
            onClick={() => void buy()}
            disabled={adding || isOutOfStock || !hasSelectedVariant}
          >
            {adding && <LoaderCircle className="animate-spin" />}
            Buy now
          </Button>

          {/* Cart feedback */}
          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`mt-3 text-sm ${
                message.includes("successfully") ? "text-primary" : "text-destructive"
              }`}
            >
              {message}
            </p>
          )}

          {/* WhatsApp ordering */}
          <Button asChild className="mt-3 w-full" variant="outline" size="lg">
            <a href="https://wa.me/2348102968799" target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              Order via WhatsApp
            </a>
          </Button>

          {/* Custom wig link */}
          <div className="mt-6 border-l-2 border-primary pl-4">
            <p className="font-semibold">Need a custom version?</p>

            <Link to="/custom-wig" className="text-sm text-primary hover:underline">
              Customize your wig →
            </Link>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-16">
          <SectionTitle title="You may also love" />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((product) => (
              <BackendProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Image lightbox */}
      {lightboxOpen && image && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${p.name} image preview`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLightboxOpen(false);
            }
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close image preview"
          >
            <X className="size-6" />
          </button>

          {/* Previous image */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={previousImage}
              className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Preview image */}
          <div className="flex max-h-full max-w-5xl flex-col items-center">
            <img
              src={image}
              alt={`${p.name} preview ${selectedImage + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />

            <p className="mt-4 text-sm text-white/80">
              {selectedImage + 1} of {images.length}
            </p>
          </div>

          {/* Next image */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="text-muted-foreground">{label}</span>
      <p className="break-words font-medium">{value}</p>
    </div>
  );
}
