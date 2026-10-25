import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/StorefrontMotion";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/context/store";
import { PageHero, EmptyState, MockNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/config";
export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — HairbyOma" },
      { name: "description", content: "Review your selected HairbyOma products and options." },
      { property: "og:title", content: "Your Cart — HairbyOma" },
      { property: "og:description", content: "Review your HairbyOma selection." },
    ],
  }),
  component: Page,
});
function Page() {
  const reduced = useReducedMotion();
  const { cart, removeFromCart, updateQuantity } = useStore();
  if (!cart.length)
    return (
      <>
        <PageHero title="Your cart" copy="Your considered HairbyOma selection lives here." />
        <EmptyState
          title="Your cart is waiting"
          copy="Explore our luxury hair collection and add a piece you love."
        />
      </>
    );
  const sub = cart.reduce((a, i) => a + i.product.mockPrice * i.quantity, 0);
  const total = sub + siteConfig.deliveryFee;
  return (
    <>
      <PageHero
        title="Your cart"
        copy="Review lengths, quantities and mock totals before checkout."
      />
      <div className="site-container grid gap-8 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {cart.map((i) => (
              <motion.article
                layout
                transition={{ duration: reduced ? 0 : 0.3 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, paddingBottom: 0 }}
                key={`${i.product.id}-${i.length}`}
                className="grid grid-cols-[6rem_1fr] gap-4 border-b pb-4"
              >
                <img
                  src={i.product.image}
                  alt={i.product.name}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <div>
                      <h2 className="truncate text-xl">{i.product.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {i.length} inches · {i.product.texture}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(i.product.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(i.product.id, i.quantity - 1)}
                      >
                        <Minus />
                      </Button>
                      <span className="w-8 text-center">
                        <AnimatedNumber value={i.quantity} />
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(i.product.id, i.quantity + 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                    <strong>
                      ₦<AnimatedNumber value={i.product.mockPrice * i.quantity} />
                    </strong>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        <aside className="h-fit border p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl">Order summary</h2>
          <Summary label="Subtotal" value={sub} />
          <Summary label="Delivery" value={siteConfig.deliveryFee} />
          <Summary label="Discount" value={0} />
          <div className="mt-4 flex justify-between border-t pt-4 text-lg">
            <strong>Total</strong>
            <strong>
              ₦<AnimatedNumber value={total} />
            </strong>
          </div>
          <MockNotice>All amounts shown are mock calculations.</MockNotice>
          <Button asChild className="mt-5 w-full" size="lg">
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
