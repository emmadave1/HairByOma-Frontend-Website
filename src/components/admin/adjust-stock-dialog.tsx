import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  inventoryService,
  type InventoryProduct,
  type InventoryAdjustmentType,
} from "@/services/inventory.service";

type AdjustStockDialogProps = {
  open: boolean;
  product: InventoryProduct | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function AdjustStockDialog({ open, product, onOpenChange, onSuccess }: AdjustStockDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<InventoryAdjustmentType>("INCREASE");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedVariant = product?.variants.find((variant) => variant._id === variantId);

  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;

  useEffect(() => {
    if (open && product) {
      setAdjustmentType("INCREASE");
      setVariantId("");
      setQuantity("");
      setReason("");
    }
  }, [open, product]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product) return;

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0 ||
      (adjustmentType !== "SET" && parsedQuantity < 1)
    ) {
      toast.error("Enter a valid whole-number quantity.");
      return;
    }

    if (product.variants.length > 0 && !variantId) {
      toast.error("Please select a product variant.");
      return;
    }

    if (reason.trim().length < 3) {
      toast.error("Please provide a reason of at least 3 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await inventoryService.adjustStock(product._id, {
        ...(product.variants.length > 0 ? { variantId } : {}),
        adjustmentType,
        quantity: parsedQuantity,
        reason: reason.trim(),
      });

      toast.success("Stock adjusted successfully.");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to adjust stock.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust inventory stock</DialogTitle>
          <DialogDescription>
            Update stock quantities and record why the adjustment was made.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-background">
                <Package className="size-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Current stock:{" "}
              <span className="font-semibold text-foreground">
                {product.variants.length > 0 && !variantId
                  ? "Select a variant"
                  : `${currentStock} units`}
              </span>
            </p>
          </div>

          {product.variants.length > 0 && (
            <div className="space-y-2">
              <Label>Product variant</Label>

              <Select value={variantId} onValueChange={setVariantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a variant" />
                </SelectTrigger>

                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant._id} value={variant._id}>
                      {variant.length} inches · {variant.texture} · {variant.colour} (
                      {variant.stock} units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Adjustment type</Label>

            <Select
              value={adjustmentType}
              onValueChange={(value) => setAdjustmentType(value as InventoryAdjustmentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose adjustment type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="INCREASE">Increase stock</SelectItem>
                <SelectItem value="DECREASE">Decrease stock</SelectItem>
                <SelectItem value="SET">Set exact stock quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-quantity">
              {adjustmentType === "SET" ? "New stock quantity" : "Quantity"}
            </Label>

            <Input
              id="adjustment-quantity"
              type="number"
              min={adjustmentType === "SET" ? 0 : 1}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Enter quantity"
              required
            />

            <p className="text-xs text-muted-foreground">
              {adjustmentType === "INCREASE"
                ? "This quantity will be added to the current stock."
                : adjustmentType === "DECREASE"
                  ? "This quantity will be removed from the current stock."
                  : "This will replace the current stock with the quantity entered."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-reason">Reason for adjustment</Label>

            <Textarea
              id="adjustment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. New stock received from supplier"
              rows={3}
              maxLength={500}
              required
            />

            <p className="text-right text-xs text-muted-foreground">{reason.length}/500</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                submitting ||
                !quantity ||
                !reason.trim() ||
                (product.variants.length > 0 && !variantId)
              }
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdjustStockDialog;
