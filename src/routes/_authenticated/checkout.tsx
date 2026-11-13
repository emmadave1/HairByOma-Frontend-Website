import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/context/store";

import { addressService, type AddressPayload, type SavedAddress } from "@/services/address.service";
import { storeSettingsService, type StorefrontSettings } from "@/services/store-settings.service";
import { customerOrderService } from "@/services/order.service";
import { couponService, type CouponValidation } from "@/services/coupon.service";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - HairbyOma" },
      { name: "description", content: "Complete your HairbyOma order securely." },
      { property: "og:title", content: "Checkout - HairbyOma" },
      { property: "og:description", content: "Complete your HairbyOma order securely." },
    ],
  }),
  component: Page,
});

const steps = ["Delivery", "Review", "Payment"];

const initialAddress: AddressPayload = {
  fullName: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  additionalInfo: "",
  isDefault: false,
};

function formatMoney(amount: number, currency = "NGN") {
  return `${currency} ${amount.toLocaleString("en-NG")}`;
}

function Page() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [settings, setSettings] = useState<StorefrontSettings | null>(null);
  const [addressForm, setAddressForm] = useState<AddressPayload>(initialAddress);
  const [addingAddress, setAddingAddress] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [loyaltyPointsToRedeem] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const orderKeyRef = useRef<string | null>(null);
  const { cart, cartTotal, loadingCart, cartError, refreshCart } = useStore();

  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutData() {
      setLoadingData(true);
      setSettingsError("");

      try {
        const [addressResponse, settingsResponse] = await Promise.all([
          addressService.list(),
          storeSettingsService.get(),
        ]);

        if (cancelled) return;

        const savedAddresses = addressResponse.addresses || [];
        setAddresses(savedAddresses);
        setSettings(settingsResponse.settings);

        const defaultAddress = savedAddresses.find((address) => address.isDefault);
        setSelectedAddressId(defaultAddress?._id || savedAddresses[0]?._id || "");
      } catch (error) {
        if (!cancelled) {
          setSettingsError(
            error instanceof Error ? error.message : "Unable to load your checkout information.",
          );
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    void loadCheckoutData();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address._id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  const selectedState = useMemo(
    () =>
      settings?.delivery.states.find(
        (state) => state.name.toLowerCase() === selectedAddress?.state.toLowerCase(),
      ),
    [settings, selectedAddress],
  );

  const selectedCity = useMemo(
    () =>
      selectedState?.cities.find(
        (city) => city.name.toLowerCase() === selectedAddress?.city.toLowerCase(),
      ),
    [selectedState, selectedAddress],
  );

  const currency = settings?.delivery.currency || "NGN";

  const unavailableItems = cart.filter(
    (item) =>
      !item.available || (item.availableStock !== undefined && item.quantity > item.availableStock),
  );

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: AddressPayload = {
      ...addressForm,
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      streetAddress: addressForm.streetAddress.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      additionalInfo: addressForm.additionalInfo?.trim() || "",
    };

    if (
      !payload.fullName ||
      !payload.phone ||
      !payload.streetAddress ||
      !payload.city ||
      !payload.state
    ) {
      toast.error("Please complete all required delivery address fields.");
      return;
    }

    const state = settings?.delivery.states.find(
      (item) => item.name.toLowerCase() === payload.state.toLowerCase(),
    );
    const city = state?.cities.find(
      (item) => item.name.toLowerCase() === payload.city.toLowerCase(),
    );

    if (!city) {
      toast.error("This delivery location is not currently supported.");
      return;
    }

    setSavingAddress(true);

    try {
      const response = await addressService.create(payload);
      const savedAddress = response.address;

      setAddresses((current) => [
        ...current.map((item) => (savedAddress.isDefault ? { ...item, isDefault: false } : item)),
        savedAddress,
      ]);
      setSelectedAddressId(savedAddress._id);
      setAddressForm(initialAddress);
      setAddingAddress(false);
      toast.success("Delivery address saved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save delivery address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter a coupon code.");
      return;
    }

    if (applyingCoupon) return;

    setApplyingCoupon(true);

    try {
      const response = await couponService.validate(code, loyaltyPointsToRedeem);

      setAppliedCoupon(response.coupon);
      setCouponCode(response.coupon.code);

      toast.success(response.message || "Coupon applied successfully.");
    } catch (error) {
      setAppliedCoupon(null);

      toast.error(error instanceof Error ? error.message : "Unable to validate this coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  }

  function updateAddressForm(field: keyof AddressPayload, value: string | boolean) {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "state" ? { city: "" } : {}),
    }));
  }

  function validateDelivery() {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return false;
    }

    if (!selectedCity) {
      toast.error("The selected address is outside our configured delivery locations.");
      return false;
    }

    return true;
  }

  function continueToReview() {
    if (!validateDelivery()) return;
    setStep(1);
  }

  async function placeOrder() {
    if (placingOrder) return;

    if (!selectedAddress || !validateDelivery()) {
      setStep(0);
      return;
    }

    if (!cart.length || unavailableItems.length) {
      toast.error("Please resolve your cart items before placing your order.");
      setStep(1);
      return;
    }

    setPlacingOrder(true);
    setOrderError("");

    if (!orderKeyRef.current) {
      orderKeyRef.current = crypto.randomUUID();
    }

    try {
      const response = await customerOrderService.createOrder(
        {
          addressId: selectedAddress._id,
          loyaltyPointsToRedeem,
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        },
        orderKeyRef.current,
      );

      const orderId = response.order._id;

      if (!orderId) {
        throw new Error("The order was created, but its reference could not be retrieved.");
      }

      try {
        sessionStorage.setItem(`hairbyoma-order-whatsapp:${orderId}`, response.whatsappLink);
      } catch {
        // The confirmation page can reconstruct the WhatsApp link from the order snapshot.
      }

      toast.success("Your order has been placed successfully.");

      try {
        await refreshCart();
      } catch {
        // The backend has already cleared the cart as part of order creation.
      }

      await navigate({
        to: "/order-confirmation",
        search: { orderId },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to place your order.";

      setOrderError(message);
      toast.error(message);
      // Keep the same idempotency key so a retry cannot create a duplicate order.
    } finally {
      setPlacingOrder(false);
    }
  }

  const canContinue =
    !loadingData && !loadingCart && !settingsError && cart.length > 0 && !unavailableItems.length;

  return (
    <>
      <PageHero
        title="Checkout"
        copy="A few more steps and your HairbyOma order will be on its way."
      />

      <div className="site-container py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 grid grid-cols-3 gap-2">
            {steps.map((label, index) => (
              <div key={label} className="text-center">
                <span
                  className={`mx-auto grid size-9 place-items-center rounded-full transition-colors ${
                    index < step
                      ? "bg-primary text-primary-foreground"
                      : index === step
                        ? "border-2 border-primary bg-background text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < step ? <Check size={18} /> : index + 1}
                </span>
                <span
                  className={`mt-2 block text-xs sm:text-sm ${
                    index === step ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {(loadingData || loadingCart) && (
            <div className="flex items-center justify-center gap-3 border p-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Loading your checkout...
            </div>
          )}

          {!loadingData && !loadingCart && settingsError && (
            <div className="border border-destructive/30 bg-destructive/5 p-6">
              <h2 className="font-semibold">Checkout information unavailable</h2>
              <p className="mt-2 text-sm text-muted-foreground">{settingsError}</p>
              <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          )}

          {!loadingData && !loadingCart && !settingsError && cartError && (
            <div className="border border-destructive/30 bg-destructive/5 p-6">
              <p className="text-sm text-destructive">{cartError}</p>
            </div>
          )}

          {!loadingData && !loadingCart && !settingsError && !cartError && !cart.length && (
            <div className="border p-8 text-center">
              <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add something beautiful to your cart before checking out.
              </p>
              <Button className="mt-6" onClick={() => window.location.assign("/shop")}>
                Explore the shop
              </Button>
            </div>
          )}

          {!loadingData && !loadingCart && !settingsError && !cartError && cart.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
              <section className="min-w-0 border p-5 md:p-8">
                {step === 0 && (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">Step 01</p>
                        <h2 className="mt-2 text-2xl font-semibold">Delivery address</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Where should we deliver your order?
                        </p>
                      </div>
                      {!addingAddress && (
                        <Button variant="outline" size="sm" onClick={() => setAddingAddress(true)}>
                          <Plus size={16} />
                          Add new
                        </Button>
                      )}
                    </div>

                    {!addingAddress && (
                      <div className="mt-7 space-y-3">
                        {addresses.length ? (
                          addresses.map((address) => (
                            <button
                              type="button"
                              key={address._id}
                              onClick={() => setSelectedAddressId(address._id)}
                              className={`w-full border p-4 text-left transition-colors ${
                                selectedAddressId === address._id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <span className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                                    selectedAddressId === address._id
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {selectedAddressId === address._id && <Check size={12} />}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-2 font-medium">
                                    {address.fullName}
                                    {address.isDefault && (
                                      <span className="bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                        Default
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-1 block text-sm text-muted-foreground">
                                    {address.streetAddress}
                                  </span>
                                  <span className="block text-sm text-muted-foreground">
                                    {address.city}, {address.state}
                                  </span>
                                  <span className="mt-1 block text-sm text-muted-foreground">
                                    {address.phone}
                                  </span>
                                </span>
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="border border-dashed p-6 text-center">
                            <MapPin className="mx-auto size-8 text-muted-foreground" />
                            <p className="mt-3 font-medium">No saved delivery addresses</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Add an address to continue.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {addingAddress && (
                      <form onSubmit={handleAddAddress} className="mt-7 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">New delivery address</h3>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setAddingAddress(false)}
                          >
                            Cancel
                          </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <AddressField
                            label="Full name"
                            value={addressForm.fullName}
                            onChange={(value) => updateAddressForm("fullName", value)}
                            required
                          />
                          <AddressField
                            label="Phone number"
                            value={addressForm.phone}
                            onChange={(value) => updateAddressForm("phone", value)}
                            required
                          />
                        </div>

                        <AddressField
                          label="Street address"
                          value={addressForm.streetAddress}
                          onChange={(value) => updateAddressForm("streetAddress", value)}
                          required
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label>
                            <span className="form-label">State *</span>
                            <select
                              required
                              value={addressForm.state}
                              onChange={(event) => updateAddressForm("state", event.target.value)}
                              className="h-10 w-full border bg-background px-3 text-sm"
                            >
                              <option value="">Select state</option>
                              {settings?.delivery.states.map((state) => (
                                <option key={state.name} value={state.name}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span className="form-label">City *</span>
                            <select
                              required
                              value={addressForm.city}
                              onChange={(event) => updateAddressForm("city", event.target.value)}
                              disabled={!addressForm.state}
                              className="h-10 w-full border bg-background px-3 text-sm disabled:opacity-50"
                            >
                              <option value="">Select city</option>
                              {settings?.delivery.states
                                .find((state) => state.name === addressForm.state)
                                ?.cities.map((city) => (
                                  <option key={city.name} value={city.name}>
                                    {city.name} � {formatMoney(city.deliveryFee, currency)} delivery
                                  </option>
                                ))}
                            </select>
                          </label>
                        </div>

                        <label>
                          <span className="form-label">Additional directions (optional)</span>
                          <Textarea
                            value={addressForm.additionalInfo}
                            onChange={(event) =>
                              updateAddressForm("additionalInfo", event.target.value)
                            }
                            placeholder="Landmark, apartment number or delivery instructions"
                          />
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(addressForm.isDefault)}
                            onChange={(event) =>
                              updateAddressForm("isDefault", event.target.checked)
                            }
                          />
                          Save as my default address
                        </label>

                        <Button type="submit" className="w-full" disabled={savingAddress}>
                          {savingAddress && <Loader2 className="mr-2 size-4 animate-spin" />}
                          Save and select address
                        </Button>
                      </form>
                    )}

                    {!addingAddress && selectedAddress && (
                      <div className="mt-5 border-t pt-5">
                        <p className="text-sm font-medium">Delivery location</p>
                        {selectedCity ? (
                          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">
                              {selectedCity.name}, {selectedState?.name}
                            </span>
                            <span className="font-semibold">
                              {formatMoney(selectedCity.deliveryFee, currency)}
                            </span>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-destructive">
                            This address is outside our currently configured delivery locations.
                            Select another address or add one in a supported location.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {step === 1 && (
                  <>
                    <p className="eyebrow">Step 02</p>
                    <h2 className="mt-2 text-2xl font-semibold">Review your order</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Check your items and delivery details before placing your order.
                    </p>

                    <div className="mt-7 space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.itemId}
                          className="flex items-start justify-between gap-4 border-b pb-4"
                        >
                          <div className="flex min-w-0 items-start gap-3">
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
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.variant
                                  ? `${item.variant.length}" � ${item.variant.texture} � ${item.variant.colour}${item.variant.density ? ` � ${item.variant.density}% density` : ""}`
                                  : "Standard product"}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                              {(!item.available ||
                                (item.availableStock !== undefined &&
                                  item.quantity > item.availableStock)) && (
                                <p className="mt-1 text-xs text-destructive">
                                  {item.availableStock === 0
                                    ? "This item is currently out of stock."
                                    : item.availableStock !== undefined &&
                                        item.quantity > item.availableStock
                                      ? `Only ${item.availableStock} unit(s) are currently available, but you have ${item.quantity} in your cart.`
                                      : item.message || "This item is unavailable."}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-medium">
                            {formatMoney(item.subtotal, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-7 border p-4">
                      <h3 className="font-semibold">Have a discount code?</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Enter your coupon code to enjoy a discount on your order.
                      </p>

                      {appliedCoupon ? (
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-green-700">
                              {appliedCoupon.code} applied
                            </p>
                            <p className="text-sm text-muted-foreground">
                              You saved {formatMoney(appliedCoupon.discountAmount, currency)}.
                            </p>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode("");
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <Input
                            value={couponCode}
                            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            disabled={applyingCoupon}
                          />

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                          >
                            {applyingCoupon ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {unavailableItems.length > 0 && (
                      <p className="mt-4 text-sm text-destructive">
                        Some items are unavailable. Remove or resolve them before placing your
                        order.
                      </p>
                    )}

                    {selectedAddress && (
                      <div className="mt-7 border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">Delivering to</p>
                          <button
                            type="button"
                            className="text-sm text-primary underline"
                            onClick={() => setStep(0)}
                          >
                            Change
                          </button>
                        </div>
                        <p className="mt-2 text-sm">{selectedAddress.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.streetAddress}, {selectedAddress.city},{" "}
                          {selectedAddress.state}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
                      </div>
                    )}
                  </>
                )}

                {step === 2 && (
                  <div className="text-center">
                    <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck size={28} />
                    </span>
                    <p className="eyebrow mt-5">Step 03</p>
                    <h2 className="mt-2 text-2xl font-semibold">Bank transfer</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      When you place your order, we'll generate your order number and show the
                      store's bank transfer instructions. You'll then send your transfer receipt
                      through WhatsApp.
                    </p>

                    <div className="mt-7 border bg-muted/40 p-5 text-left">
                      <p className="font-medium">Payment verification</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Your payment will remain pending until HairbyOma verifies the transfer. Your
                        order will not be marked as paid just because you submit your receipt.
                      </p>
                    </div>

                    <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck size={14} />
                      Secure order creation through HairbyOma
                    </p>
                  </div>
                )}

                {orderError && (
                  <div className="mt-6 border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{orderError}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You can retry safely. The same order request key will be reused.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    disabled={step === 0 || placingOrder}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>

                  {step === 0 && (
                    <Button onClick={continueToReview} disabled={!selectedCity || addingAddress}>
                      Review order
                      <ChevronRight size={16} />
                    </Button>
                  )}

                  {step === 1 && (
                    <Button
                      onClick={() => {
                        if (!validateDelivery()) {
                          setStep(0);
                          return;
                        }
                        if (unavailableItems.length) {
                          toast.error("Resolve unavailable items before continuing.");
                          return;
                        }
                        setOrderError("");
                        setStep(2);
                      }}
                      disabled={!selectedAddress || unavailableItems.length > 0}
                    >
                      Continue to payment
                      <ChevronRight size={16} />
                    </Button>
                  )}

                  {step === 2 && (
                    <Button onClick={placeOrder} disabled={placingOrder || !canContinue}>
                      {placingOrder ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Placing order...
                        </>
                      ) : (
                        <>
                          Place order
                          <ChevronRight size={16} />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </section>

              <aside className="h-fit border p-5">
                <h2 className="font-semibold">Order summary</h2>

                <div className="mt-5 flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({cart.length})</span>
                  <span>{formatMoney(cartTotal, currency)}</span>
                </div>

                {appliedCoupon && (
                  <div className="mt-3 flex justify-between gap-3 text-sm">
                    <span className="text-green-700">Coupon discount ({appliedCoupon.code})</span>
                    <span className="font-medium text-green-700">
                      -{formatMoney(Math.min(appliedCoupon.discountAmount, cartTotal), currency)}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {selectedCity
                      ? formatMoney(selectedCity.deliveryFee, currency)
                      : "Calculated by store"}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t pt-5">
                  <span className="font-semibold">Total</span>
                  <span className="text-right text-xl font-bold">
                    {selectedCity
                      ? formatMoney(
                          cartTotal -
                            Math.min(appliedCoupon?.discountAmount || 0, cartTotal) +
                            selectedCity.deliveryFee,
                          currency,
                        )
                      : "Calculated by store"}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Your coupon discount applies to your products, not the delivery fee.
                </p>

                <div className="mt-6 flex items-start gap-2 border-t pt-5 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  Your order is protected by manual payment verification.
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AddressField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="form-label">
        {label}
        {required ? " *" : ""}
      </span>
      <Input value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
