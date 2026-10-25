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
      { title: "Checkout — HairbyOma" },
      { name: "description", content: "Preview the secure HairbyOma checkout experience." },
      { property: "og:title", content: "Checkout — HairbyOma" },
      { property: "og:description", content: "Review customer, delivery and order details." },
    ],
  }),
  component: Page,
});
const steps = ["Information", "Delivery", "Review", "Payment", "Confirmation"];
function Page() {
  const [step, setStep] = useState(0);
  const { cart } = useStore();
  const navigate = useNavigate();
  function next() {
    if (step === 3) {
      setStep(4);
      setTimeout(() => navigate({ to: "/order-confirmation" }), 500);
    } else setStep(Math.min(4, step + 1));
  }
  return (
    <>
      <PageHero
        title="Checkout"
        copy="A polished frontend preview. No payment or order is submitted."
      />
      <div className="site-container py-10">
        <div className="mb-8 grid grid-cols-5 gap-1">
          {steps.map((s, i) => (
            <div key={s} className="text-center">
              <span
                className={`mx-auto grid size-8 place-items-center rounded-full ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted"}`}
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
                  <option>Port Harcourt dispatch — ₦4,000</option>
                  <option>Studio pickup</option>
                  <option>Nationwide — fee pending</option>
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
              {cart.length ? (
                cart.map((i) => (
                  <div key={i.product.id} className="mt-4 flex justify-between border-b pb-3">
                    <span>
                      {i.product.name} × {i.quantity}
                    </span>
                    <span>₦{(i.product.mockPrice * i.quantity).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="mt-4 text-muted-foreground">
                  No cart items. This step remains available for interface review.
                </p>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="mt-6 text-center">
              <LockKeyhole className="mx-auto size-10 text-primary" />
              <h2 className="mt-4 text-2xl">Payment</h2>
              <p className="mt-3 text-muted-foreground">
                Payment gateway will be connected during backend integration.
              </p>
            </div>
          )}
          {step === 4 && <p className="mt-6 text-center">Preparing the confirmation preview…</p>}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ChevronLeft />
              Back
            </Button>
            <Button onClick={next} disabled={step === 4}>
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
