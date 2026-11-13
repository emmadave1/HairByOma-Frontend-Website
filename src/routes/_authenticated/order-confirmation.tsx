import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Clock,
  Copy,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { customerOrderService, type CustomerOrder } from "@/services/order.service";

type ConfirmationSearch = {
  orderId?: string;
};

export const Route = createFileRoute("/_authenticated/order-confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmationSearch => ({
    ...(typeof search["orderId"] === "string" && /^[a-f\d]{24}$/i.test(search["orderId"])
      ? { orderId: search["orderId"] }
      : {}),
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmation - HairbyOma" },
      {
        name: "description",
        content: "Your HairbyOma order and bank transfer instructions.",
      },
    ],
  }),
  component: OrderConfirmationPage,
});

function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

function OrderConfirmationPage() {
  const { orderId } = Route.useSearch();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("We couldn't find an order ID. Please check your order history.");
      setLoading(false);
      return;
    }

    let active = true;

    const loadOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await customerOrderService.getMyOrderById(orderId);

        if (!active) return;

        setOrder(response.order);

        const savedLink = sessionStorage.getItem(`hairbyoma-order-whatsapp:${orderId}`);

        if (savedLink) {
          setWhatsappLink(savedLink);
        } else {
          const phone = response.order.paymentSnapshot?.whatsappNumber;

          if (phone) {
            const message = [
              "Hello HairbyOma, I have placed an order.",
              "",
              `Order Number: ${response.order.orderNumber}`,
              `Amount to Transfer: ${response.order.currency} ${response.order.totalAmount.toLocaleString("en-NG")}`,
              "",
              "Please find my bank transfer receipt attached for confirmation. Thank you.",
            ].join("\n");

            setWhatsappLink(
              `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
            );
          }
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "We couldn't retrieve your order. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const copyValue = async (field: string | null | undefined, value: string | null | undefined) => {
    if (!value) {
      toast.error("This information is not available.");
      return;
    }

    const safeField = field ?? "value";

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(safeField);
      toast.success("Copied to clipboard.");

      window.setTimeout(() => {
        setCopiedField((current) => (current === safeField ? "" : current));
      }, 2000);
    } catch {
      toast.error("Unable to copy. Please copy the information manually.");
    }
  };

  const handleReceiptConfirmation = async () => {
    if (!order || !whatsappLink) return;

    setReceiptSubmitting(true);

    try {
      const response = await customerOrderService.submitPaymentReceipt(order._id);
      setOrder(response.order);
      toast.success(response.message || "Receipt acknowledgement submitted.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to submit your receipt acknowledgement. Please try again.",
      );
    } finally {
      setReceiptSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="site-container flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="mx-auto size-9 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Retrieving your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="site-container py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <Package className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-display text-3xl text-primary">Order unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {error || "We couldn't retrieve this order."}
          </p>
          <Link
            to="/orders"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            View my orders <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const payment = order.paymentSnapshot;
  const isPaid = order.paymentStatus === "PAID";
  const receiptSubmitted = order.paymentReceiptSubmitted;
  const hasBankDetails = Boolean(
    payment?.bankName && payment?.accountName && payment?.accountNumber,
  );

  return (
    <div className="site-container py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10 sm:py-14">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/15">
              <CheckCircle2 className="size-9" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              HairbyOma · Order confirmation
            </p>

            <h1 className="mt-3 font-display text-3xl sm:text-5xl">
              {isPaid ? "Payment confirmed!" : "Thank you for your order!"}
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/80">
              {isPaid
                ? "Your payment has been verified. Thank you for shopping with HairbyOma."
                : "Your order has been successfully placed. Complete your bank transfer to move your order towards processing."}
            </p>

            <div className="mx-auto mt-7 inline-flex flex-wrap items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3">
              <span className="text-xs text-white/75">Order number</span>
              <span className="font-semibold tracking-wide">{order.orderNumber}</span>
              <button
                type="button"
                aria-label="Copy order number"
                onClick={() => void copyValue("order", order.orderNumber)}
                className="rounded p-1 transition hover:bg-white/15"
              >
                {copiedField === "order" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-b border-border p-5 sm:grid-cols-3 sm:p-7">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Order total</p>
              <p className="mt-2 text-xl font-semibold text-primary">
                {formatCurrency(order.totalAmount, order.currency)}
              </p>
            </div>

            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Order status</p>
              <p className="mt-2 font-semibold text-primary">{statusLabel(order.orderStatus)}</p>
            </div>

            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Payment status</p>
              <p className="mt-2 font-semibold text-primary">{statusLabel(order.paymentStatus)}</p>
            </div>
          </div>

          <div className="space-y-8 p-5 sm:p-8">
            {!isPaid && (
              <section>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-primary">Complete your payment</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Transfer the exact amount below to the HairbyOma account. Please use the order
                      number as your transfer narration where possible.
                    </p>
                  </div>
                </div>

                {hasBankDetails ? (
                  <div className="mt-5 space-y-3 rounded-xl border border-border p-5 sm:p-6">
                    {[
                      ["Bank", payment?.bankName, "bank"],
                      ["Account name", payment?.accountName, "accountName"],
                      ["Account number", payment?.accountNumber, "accountNumber"],
                    ].map(([label, value, field]) => {
                      const rawValue = typeof value === "string" ? value : "";

                      return (
                        <div
                          key={field}
                          className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="mt-1 break-words text-sm font-semibold text-primary">
                              {rawValue || "Unavailable"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void copyValue(field, rawValue || undefined)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-primary transition hover:bg-muted"
                            disabled={!rawValue}
                          >
                            {copiedField === field ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Clipboard className="size-3.5" />
                            )}
                            {copiedField === field ? "Copied" : "Copy"}
                          </button>
                        </div>
                      );
                    })}

                    <div className="mt-4 rounded-lg bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">Exact amount to transfer</p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyValue("amount", String(order.totalAmount))}
                          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-primary"
                        >
                          {copiedField === "amount" ? "Copied" : "Copy amount"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                    Bank transfer instructions are currently unavailable for this order. Please
                    contact HairbyOma before making a transfer.
                  </div>
                )}

                {receiptSubmitted ? (
                  <div className="mt-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Receipt acknowledgement received</p>
                      <p className="mt-1 leading-6">
                        Your receipt submission has been recorded. HairbyOma will verify your
                        transfer manually before confirming payment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-border p-5">
                    <h3 className="font-semibold text-primary">Send your transfer receipt</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      After making your transfer, open WhatsApp, attach your transfer receipt and
                      send it to HairbyOma. Return here afterwards to confirm that you've sent it.
                    </p>

                    <a
                      href={whatsappLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => {
                        if (!whatsappLink) {
                          event.preventDefault();
                          toast.error(
                            "The WhatsApp contact is unavailable. Please contact HairbyOma.",
                          );
                        }
                      }}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      <MessageCircle className="size-5" />
                      Open WhatsApp to send receipt
                    </a>

                    <button
                      type="button"
                      onClick={() => void handleReceiptConfirmation()}
                      disabled={receiptSubmitting || !whatsappLink}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {receiptSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      I've sent my receipt on WhatsApp
                    </button>
                  </div>
                )}
              </section>
            )}

            {isPaid && (
              <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Your payment is verified</p>
                  <p className="mt-1 leading-6">
                    Your payment has been confirmed by HairbyOma. You can track your order from your
                    orders page.
                  </p>
                </div>
              </div>
            )}

            <section>
              <div className="flex items-center gap-3">
                <Package className="size-5 text-primary" />
                <h2 className="font-display text-2xl text-primary">Order summary</h2>
              </div>

              <div className="mt-5 divide-y divide-border rounded-xl border border-border">
                {order.items.map((item, index) => (
                  <div
                    key={`${order._id}-${index}`}
                    className="flex items-start justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{item.productName}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Quantity: {item.quantity}
                        {item.length ? ` · ${item.length}` : ""}
                        {item.texture ? ` · ${item.texture}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-primary">
                      {formatCurrency(item.subtotal, order.currency)}
                    </p>
                  </div>
                ))}

                <div className="space-y-2 bg-muted p-4 sm:p-5">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(order.deliveryFee, order.currency)}
                    </span>
                  </div>

                  {Boolean(order.loyaltyDiscount) && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Loyalty discount</span>
                      <span className="font-medium text-green-700">
                        -{formatCurrency(order.loyaltyDiscount || 0, order.currency)}
                      </span>
                    </div>
                  )}

                  {Boolean(order.referralDiscount) && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Referral discount</span>
                      <span className="font-medium text-green-700">
                        -{formatCurrency(order.referralDiscount || 0, order.currency)}
                      </span>
                    </div>
                  )}

                  {Boolean(order.couponDiscount) && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Coupon discount</span>
                      <span className="font-medium text-green-700">
                        -{formatCurrency(order.couponDiscount || 0, order.currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <span className="font-semibold text-primary">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-primary" />
                <h2 className="font-display text-2xl text-primary">Delivery details</h2>
              </div>

              <div className="mt-5 rounded-xl border border-border p-5">
                <p className="font-semibold text-primary">{order.deliveryFullName}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {order.deliveryAddress}
                  <br />
                  {order.deliveryCity}, {order.deliveryState}
                  <br />
                  {order.deliveryPhone}
                </p>
                {order.deliveryAdditionalInfo && (
                  <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                    Delivery note: {order.deliveryAdditionalInfo}
                  </p>
                )}
              </div>
            </section>

            <section className="flex items-start gap-3 rounded-xl bg-muted p-5">
              <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">Manual payment verification</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Bank transfers are checked manually. Your order will only be marked as paid after
                  HairbyOma confirms receipt of the transfer. Order placed{" "}
                  {formatDate(order.createdAt)}.
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
              <Link
                to="/orders"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Package className="size-4" />
                View my orders
              </Link>

              <Link
                to="/shop"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-muted"
              >
                <ShoppingBag className="size-4" />
                Continue shopping
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
