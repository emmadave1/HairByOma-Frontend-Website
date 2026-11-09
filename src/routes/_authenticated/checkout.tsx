import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { PageHero, MockNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/context/store";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - HairbyOma" },
      { name: "description", content: "Review your HairbyOma checkout details." },
      { property: "og:title", content: "Checkout - HairbyOma" },
      { property: "og:description", content: "Review customer, delivery and order details." },
    ],
  }),
  component: Page,
});

const steps = ["Information", "Delivery", "Review", "Payment", "Confirmation"];

function Page() {
  const [step, setStep] = useState(0);
  const { cart, cartTotal, loadingCart, cartError } = useStore();
  const navigate = useNavigate();

  function next() {
    if (step === 3) {
      setStep(4);
      setTimeout(() => navigate({ to: "/order-confirmation" }), 500);
    } else {
      setStep(Math.min(4, step + 1));
    }
  }

  return (
    <>
      <PageHero title="Checkout" copy="Review your order details before proceeding." />

      <div className="site-container py-10">
        <div className="mb-8 grid grid-cols-5 gap-1">
          {steps.map((s, i) => (
            <div key={s} className="text-center">
              <span
                className={`mx-auto grid size-8 place-items-center rounded-full ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {i < step ? <Check /> : i + 1}
              </span>
              <span className="mt-2 hidden text-xs sm:block">{s}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl border p-5 md:p-8">
          <MockNotice />

          {step === 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" />
              <Field label="Phone" />
              <Field label="Email" type="email" />
              <Field label="City" />
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 space-y-5">
              <Field label="Address" />
              <Field label="State" />

              <label>
                <span className="form-label">Delivery method</span>
                <select className="h-10 w-full border bg-background px-3">
                  <option>Port Harcourt dispatch - NGN 4,000</option>
                  <option>Studio pickup</option>
                  <option>Nationwide - fee pending</option>
                </select>
              </label>

              <label>
                <span className="form-label">Order notes</span>
                <Textarea />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <h2 className="text-2xl">Review your selection</h2>

              {loadingCart ? (
                <p className="mt-4 text-muted-foreground">Loading your cart...</p>
              ) : cartError ? (
                <p className="mt-4 text-sm text-destructive">{cartError}</p>
              ) : cart.length ? (
                <>
                  <div className="mt-4 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between gap-4 border-b pb-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.name || "Hair product"}
                              className="size-16 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="size-16 shrink-0 bg-muted" />
                          )}

                          <div className="min-w-0">
                            <p className="font-medium">{item.name || "Hair product"}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.variant
                                ? `${item.variant.length}" - ${item.variant.texture} - ${item.variant.colour}${item.variant.density ? ` - ${item.variant.density}% density` : ""}`
                                : "Standard product"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                            {!item.available && (
                              <p className="text-sm text-destructive">
                                {item.message || "This item is currently unavailable."}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 font-medium">
                          NGN {item.subtotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between text-lg font-semibold">
                    <span>Subtotal</span>
                    <span>NGN {cartTotal.toLocaleString()}</span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Delivery charges will be confirmed based on your delivery method and location.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-muted-foreground">
                  Your cart is empty. Add products before proceeding to checkout.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 text-center">
              <LockKeyhole className="mx-auto size-10 text-primary" />
              <h2 className="mt-4 text-2xl">Bank Transfer Payment</h2>
              <p className="mt-3 text-muted-foreground">
                Bank transfer instructions, payment receipt submission and order confirmation will
                be available when the backend order integration is completed.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                No payment or order is submitted in this preview.
              </p>
            </div>
          )}

          {step === 4 && <p className="mt-6 text-center">Preparing the confirmation preview...</p>}

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ChevronLeft />
              Back
            </Button>

            <Button
              onClick={next}
              disabled={
                step === 4 ||
                (step === 2 &&
                  (loadingCart || cart.length === 0 || cart.some((item) => !item.available)))
              }
            >
              {step === 3 ? "Preview confirmation" : "Continue"}
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label>
      <span className="form-label">{label} *</span>
      <Input required type={type} />
    </label>
  );
}
