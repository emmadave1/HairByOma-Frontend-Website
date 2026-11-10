import { useEffect, useState, type FormEvent } from "react";
import { CreditCard, Loader2, MapPin, Plus, RefreshCw, Save, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  adminSettingsService,
  type AdminStoreSettings,
  type AdminDeliveryState,
} from "@/services/admin-settings.service";

function SettingsManagement() {
  const [settings, setSettings] = useState<AdminStoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [error, setError] = useState("");

  const loadSettings = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await adminSettingsService.get();
      setSettings(response.settings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load store settings.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const updatePaymentField = (field: keyof AdminStoreSettings["payment"], value: string) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            payment: { ...current.payment, [field]: value },
          }
        : current,
    );
  };

  const updateDelivery = (
    updater: (delivery: AdminStoreSettings["delivery"]) => AdminStoreSettings["delivery"],
  ) => {
    setSettings((current) =>
      current ? { ...current, delivery: updater(current.delivery) } : current,
    );
  };

  const savePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;

    setSavingPayment(true);

    try {
      const response = await adminSettingsService.update({
        payment: settings.payment,
      });

      setSettings(response.settings);
      toast.success("Payment settings saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save payment settings.");
    } finally {
      setSavingPayment(false);
    }
  };

  const saveDelivery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;

    setSavingDelivery(true);

    try {
      const response = await adminSettingsService.update({
        delivery: settings.delivery,
      });

      setSettings(response.settings);
      toast.success("Delivery settings saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save delivery settings.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const updateStateName = (index: number, name: string) => {
    updateDelivery((delivery) => ({
      ...delivery,
      states: delivery.states.map((state, stateIndex) =>
        stateIndex === index ? { ...state, name } : state,
      ),
    }));
  };

  const updateCity = (
    stateIndex: number,
    cityIndex: number,
    field: "name" | "deliveryFee",
    value: string,
  ) => {
    updateDelivery((delivery) => ({
      ...delivery,
      states: delivery.states.map((state, currentStateIndex) =>
        currentStateIndex === stateIndex
          ? {
              ...state,
              cities: state.cities.map((city, currentCityIndex) =>
                currentCityIndex === cityIndex
                  ? {
                      ...city,
                      [field]: field === "deliveryFee" ? Number(value) : value,
                    }
                  : city,
              ),
            }
          : state,
      ),
    }));
  };

  const addState = () => {
    updateDelivery((delivery) => ({
      ...delivery,
      states: [...delivery.states, { name: "", cities: [] }],
    }));
  };

  const removeState = (index: number) => {
    updateDelivery((delivery) => ({
      ...delivery,
      states: delivery.states.filter((_, stateIndex) => stateIndex !== index),
    }));
  };

  const addCity = (stateIndex: number) => {
    updateDelivery((delivery) => ({
      ...delivery,
      states: delivery.states.map((state, index) =>
        index === stateIndex
          ? {
              ...state,
              cities: [...state.cities, { name: "", deliveryFee: 4000 }],
            }
          : state,
      ),
    }));
  };

  const removeCity = (stateIndex: number, cityIndex: number) => {
    updateDelivery((delivery) => ({
      ...delivery,
      states: delivery.states.map((state, index) =>
        index === stateIndex
          ? {
              ...state,
              cities: state.cities.filter((_, currentCityIndex) => currentCityIndex !== cityIndex),
            }
          : state,
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading store settings...</span>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button className="mt-4" onClick={() => void loadSettings()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Store Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage payment information and delivery locations for your store.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadSettings(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <form onSubmit={savePayment} className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Payment Details</h3>
            <p className="text-sm text-muted-foreground">
              Bank account and WhatsApp information customers use for payments.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Bank Name
            <Input
              required
              maxLength={120}
              value={settings.payment.bankName}
              onChange={(event) => updatePaymentField("bankName", event.target.value)}
              placeholder="Enter bank name"
            />
          </label>

          <label className="space-y-2 text-sm font-medium">
            Account Name
            <Input
              required
              maxLength={120}
              value={settings.payment.accountName}
              onChange={(event) => updatePaymentField("accountName", event.target.value)}
              placeholder="Enter account name"
            />
          </label>

          <label className="space-y-2 text-sm font-medium">
            Account Number
            <Input
              required
              maxLength={30}
              value={settings.payment.accountNumber}
              onChange={(event) => updatePaymentField("accountNumber", event.target.value)}
              placeholder="Enter account number"
            />
          </label>

          <label className="space-y-2 text-sm font-medium">
            WhatsApp Number
            <Input
              required
              maxLength={30}
              value={settings.payment.whatsappNumber}
              onChange={(event) => updatePaymentField("whatsappNumber", event.target.value)}
              placeholder="Include country code"
            />
          </label>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={savingPayment}>
            {savingPayment ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Payment Details
          </Button>
        </div>
      </form>

      <form onSubmit={saveDelivery} className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Delivery Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage supported states, cities and delivery fees.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={addState}>
            <Plus className="mr-2 h-4 w-4" />
            Add State
          </Button>
        </div>

        <label className="block max-w-xs space-y-2 text-sm font-medium">
          Delivery Currency
          <Input
            required
            minLength={3}
            maxLength={3}
            value={settings.delivery.currency}
            onChange={(event) =>
              updateDelivery((delivery) => ({
                ...delivery,
                currency: event.target.value.toUpperCase(),
              }))
            }
            placeholder="NGN"
          />
        </label>

        {settings.delivery.states.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <MapPin className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No delivery states configured yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {settings.delivery.states.map((state: AdminDeliveryState, stateIndex) => (
            <div key={stateIndex} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-end gap-3">
                <label className="flex-1 space-y-2 text-sm font-medium">
                  State Name
                  <Input
                    required
                    minLength={2}
                    maxLength={100}
                    value={state.name}
                    onChange={(event) => updateStateName(stateIndex, event.target.value)}
                    placeholder="e.g. Rivers"
                  />
                </label>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove state"
                  onClick={() => removeState(stateIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {state.cities.map((city, cityIndex) => (
                  <div
                    key={cityIndex}
                    className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <label className="space-y-2 text-sm font-medium">
                      City
                      <Input
                        required
                        minLength={2}
                        maxLength={100}
                        value={city.name}
                        onChange={(event) =>
                          updateCity(stateIndex, cityIndex, "name", event.target.value)
                        }
                        placeholder="e.g. Port Harcourt"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium">
                      Delivery Fee ({settings.delivery.currency})
                      <Input
                        required
                        type="number"
                        min="0"
                        step="any"
                        value={city.deliveryFee}
                        onChange={(event) =>
                          updateCity(stateIndex, cityIndex, "deliveryFee", event.target.value)
                        }
                        placeholder="4000"
                      />
                    </label>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Remove city"
                      onClick={() => removeCity(stateIndex, cityIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" size="sm" onClick={() => addCity(stateIndex)}>
                <Plus className="mr-2 h-4 w-4" />
                Add City
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={savingDelivery}>
            {savingDelivery ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Delivery Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SettingsManagement;
