import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/StorefrontMotion";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, AlertCircle, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/context/store";
import { PageHero, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/config";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart - HairbyOma" },
      { name: "description", content: "Review your selected HairbyOma products and options." },
      { property: "og:title", content: "Your Cart - HairbyOma" },
      { property: "og:description", content: "Review your HairbyOma selection." },
    ],
  }),
  component: Page,
});

function Page() {
  const reduced = useReducedMotion();
  const { cart, loadingCart, cartError, cartTotal, removeFromCart, updateQuantity, refreshCart } =
    useStore();

  const [actionError, setActionError] = useState("");
  const [busyItem, setBusyItem] = useState<string | null>(null);

  async function handleRemove(itemId: string) {
    setActionError("");
    setBusyItem(itemId);

    try {
      await removeFromCart(itemId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to remove this item.");
    } finally {
      setBusyItem(null);
    }
  }

  async function handleQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;

    setActionError("");
    setBusyItem(itemId);

    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update quantity.");
    } finally {
      setBusyItem(null);
    }
  }

  if (loadingCart) {
    return (
      <>
        <PageHero title="Your cart" copy="Review your HairbyOma selection." />
        <div className="site-container grid min-h-64 place-items-center">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (cartError) {
    return (
      <>
        <PageHero title="Your cart" copy="Review your HairbyOma selection." />
        <div className="site-container py-16 text-center">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h2 className="mt-4 text-2xl font-semibold">Unable to load your cart</h2>
          <p className="mt-2 text-sm text-muted-foreground">{cartError}</p>
          <Button className="mt-5" onClick={() => void refreshCart()}>
            Try again
          </Button>
        </div>
      </>
    );
  }

  if (!cart.length) {
    return (
      <>
        <PageHero title="Your cart" copy="Your considered HairbyOma selection lives here." />
        <EmptyState
          title="Your cart is waiting"
          copy="Explore our luxury hair collection and add a piece you love."
        />
      </>
    );
  }

  const deliveryFee = siteConfig.deliveryFee;
  const total = cartTotal + deliveryFee;

  return (
    <>
      <PageHero title="Your cart" copy="Review your selected products, variants and quantities." />

      <div className="site-container grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {actionError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 p-3 text-sm text-destructive"
            >
              {actionError}
            </div>
          )}

          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.article
                layout
                transition={{ duration: reduced ? 0 : 0.3 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, paddingBottom: 0 }}
                key={item.itemId}
                className="grid grid-cols-[6rem_1fr] gap-4 border-b pb-4"
              >
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name || "HairbyOma product"}
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[4/5] place-items-center bg-muted text-center text-xs text-muted-foreground">
                    Image unavailable
                  </div>
                )}

                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div>
                      <h2 className="truncate text-xl">{item.name || "Unavailable product"}</h2>
                      <p className="text-sm text-muted-foreground">
                        {item.variant
                          ? `${item.variant.length} inches - ${item.variant.texture} - ${item.variant.colour}`
                          : item.category || "Standard product"}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => void handleRemove(item.itemId)}
                      disabled={busyItem === item.itemId}
                      aria-label={`Remove ${item.name || "item"} from cart`}
                    >
                      {busyItem === item.itemId ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Trash2 />
                      )}
                    </Button>
                  </div>

                  {!item.available && (
                    <p className="mt-2 text-xs text-destructive">
                      {item.message || "This product is currently unavailable."}
                    </p>
                  )}

                  {item.available && item.availableStock !== undefined && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.availableStock} available
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center border">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => void handleQuantity(item.itemId, item.quantity - 1)}
                        disabled={busyItem === item.itemId || item.quantity <= 1 || !item.available}
                        aria-label="Decrease quantity"
                      >
                        <Minus />
                      </Button>

                      <span className="w-8 text-center">{item.quantity}</span>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => void handleQuantity(item.itemId, item.quantity + 1)}
                        disabled={busyItem === item.itemId || !item.available}
                        aria-label="Increase quantity"
                      >
                        <Plus />
                      </Button>
                    </div>

                    <strong>
                      ₦<AnimatedNumber value={item.subtotal} />
                    </strong>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <aside className="h-fit border p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl">Order summary</h2>

          <Summary label="Subtotal" value={cartTotal} />
          <Summary label="Delivery" value={deliveryFee} />
          <Summary label="Discount" value={0} />

          <div className="mt-4 flex justify-between border-t pt-4 text-lg">
            <strong>Total</strong>
            <strong>
              ₦<AnimatedNumber value={total} />
            </strong>
          </div>

          {cart.some((item) => !item.available) && (
            <p className="mt-4 text-sm text-destructive">
              Remove unavailable products before continuing to checkout.
            </p>
          )}

          <Button
            asChild
            className="mt-5 w-full"
            size="lg"
            disabled={cart.some((item) => !item.available)}
          >
            <Link to="/checkout">Continue to checkout</Link>
          </Button>
        </aside>
      </div>
    </>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4 flex justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span>
        ₦<AnimatedNumber value={value} />
      </span>
    </div>
  );
}
