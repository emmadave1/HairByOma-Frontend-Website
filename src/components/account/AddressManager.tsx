import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addressService, type AddressPayload, type SavedAddress } from "@/services/address.service";

const emptyForm: AddressPayload = {
  fullName: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  additionalInfo: "",
  isDefault: false,
};

export function AddressManager() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [form, setForm] = useState<AddressPayload>(emptyForm);
  const [deletingAddress, setDeletingAddress] = useState<SavedAddress | null>(null);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await addressService.list();
      setAddresses(response.addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your saved addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const openAddDialog = () => {
    setEditingAddress(null);
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const openEditDialog = (address: SavedAddress) => {
    setEditingAddress(address);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      additionalInfo: address.additionalInfo ?? "",
      isDefault: address.isDefault,
    });
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const updateField = (field: keyof AddressPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload: AddressPayload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      streetAddress: form.streetAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      additionalInfo: form.additionalInfo?.trim() ?? "",
      isDefault: form.isDefault ?? false,
    };

    if (
      !payload.fullName ||
      !payload.phone ||
      !payload.streetAddress ||
      !payload.city ||
      !payload.state
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);

    try {
      const response = editingAddress
        ? await addressService.update(editingAddress._id, payload)
        : await addressService.create(payload);

      setSuccess(response.message);
      setDialogOpen(false);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this address.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setActionId(addressId);
    setError("");
    setSuccess("");

    try {
      const response = await addressService.setDefault(addressId);
      setSuccess(response.message);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the default address.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingAddress) return;

    const addressId = deletingAddress._id;
    setActionId(addressId);
    setError("");
    setSuccess("");

    try {
      const response = await addressService.remove(addressId);
      setSuccess(response.message);
      setDeletingAddress(null);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this address.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="mt-8 border p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Delivery information</p>
          <h2 className="mt-2 text-2xl font-display">Saved addresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage where your HairbyOma orders are delivered.
          </p>
        </div>

        <Button type="button" onClick={openAddDialog} disabled={addresses.length >= 10 || loading}>
          <Plus className="mr-2 h-4 w-4" />
          Add address
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{addresses.length} of 10 saved addresses</span>
        {addresses.length >= 10 && <span>You have reached the address limit.</span>}
      </div>

      {error && !dialogOpen && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading saved addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-6 border border-dashed p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-medium">No saved addresses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a delivery address to make your next order easier.
          </p>
          <Button className="mt-5" variant="outline" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address._id}
              className={`border p-5 ${address.isDefault ? "border-primary" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{address.fullName}</h3>
                </div>
                {address.isDefault && (
                  <span className="flex shrink-0 items-center gap-1 bg-secondary px-2 py-1 text-xs">
                    <Star className="h-3 w-3" />
                    Default
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>{address.phone}</p>
                <p>{address.streetAddress}</p>
                <p>
                  {address.city}, {address.state}
                </p>
                {address.additionalInfo && <p className="pt-1">{address.additionalInfo}</p>}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(address)}>
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>

                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionId === address._id}
                    onClick={() => void handleSetDefault(address._id)}
                  >
                    {actionId === address._id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Star className="mr-1 h-3 w-3" />
                    )}
                    Set default
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={actionId === address._id}
                  onClick={() => setDeletingAddress(address)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit delivery address" : "Add delivery address"}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the person and location receiving your order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address-full-name">Full name *</Label>
                <Input
                  id="address-full-name"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-phone">Phone number *</Label>
                <Input
                  id="address-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  minLength={7}
                  maxLength={20}
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-street">Street address *</Label>
              <Input
                id="address-street"
                value={form.streetAddress}
                onChange={(event) => updateField("streetAddress", event.target.value)}
                minLength={5}
                maxLength={200}
                required
                autoComplete="street-address"
                placeholder="House number, street name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address-city">City *</Label>
                <Input
                  id="address-city"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  autoComplete="address-level2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-state">State *</Label>
                <Input
                  id="address-state"
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  autoComplete="address-level1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-additional">Additional delivery information</Label>
              <Textarea
                id="address-additional"
                value={form.additionalInfo ?? ""}
                onChange={(event) => updateField("additionalInfo", event.target.value)}
                maxLength={300}
                placeholder="Landmark, apartment number or delivery instructions (optional)"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.isDefault)}
                onChange={(event) => updateField("isDefault", event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Make this my default delivery address
            </label>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingAddress ? (
                  "Save changes"
                ) : (
                  "Save address"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingAddress)}
        onOpenChange={(open) => {
          if (!open && !actionId) setDeletingAddress(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the saved delivery address.
              {deletingAddress?.isDefault &&
                " Another saved address will automatically become your default, if one exists."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(actionId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(actionId)}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionId === deletingAddress?._id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
