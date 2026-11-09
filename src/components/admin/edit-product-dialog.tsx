import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Upload, Video, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { adminProductService, type ProductPayload } from "@/services/admin-product.service";
import type { BackendProduct, BackendProductVariant } from "@/services/product.service";

const CATEGORIES = [
  "Bone Straight",
  "Bouncy(Vietnam and Chinese)",
  "Deep Wave",
  "Pixie Curls",
  "Raw donors",
  "Babytin",
  "Burmese curls",
  "Custom Wigs",
] as const;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "video/mp4",
  "video/webm",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const UPLOAD_BATCH_SIZE = 5;

type VariantForm = {
  length: string;
  texture: string;
  colour: string;
  density: string;
  price: string;
  stock: string;
};

type MediaItem = {
  url: string;
  type: "image" | "video";
};

type EditProductDialogProps = {
  open: boolean;
  product: BackendProduct | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const emptyVariant = (): VariantForm => ({
  length: "",
  texture: "",
  colour: "Natural Black",
  density: "",
  price: "",
  stock: "0",
});

function mapVariant(variant: BackendProductVariant): VariantForm {
  return {
    length: String(variant.length),
    texture: variant.texture,
    colour: variant.colour || "Natural Black",
    density: variant.density === undefined ? "" : String(variant.density),
    price: String(variant.price),
    stock: String(variant.stock),
  };
}

export default function EditProductDialog({
  open,
  product,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !product) return;

    setName(product.name);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setIsFeatured(product.isFeatured);
    setVariants(product.variants.map(mapVariant));
    setMedia([
      ...product.images.map((url) => ({ url, type: "image" as const })),
      ...product.videos.map((url) => ({ url, type: "video" as const })),
    ]);
    setNewFiles([]);
  }, [open, product]);

  const resetNewFiles = () => setNewFiles([]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving) return;

    if (!nextOpen) {
      resetNewFiles();
    }

    onOpenChange(nextOpen);
  };

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const accepted: File[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported file type.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: file size must not exceed 20 MB.`);
        return;
      }

      accepted.push(file);
    });

    if (accepted.length > 0) {
      setNewFiles((current) => [...current, ...accepted]);
    }
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const validateForm = () => {
    if (!product) return false;

    if (!name.trim() || !description.trim()) {
      toast.error("Enter the product name and description.");
      return false;
    }

    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) {
      toast.error("Enter a valid product price.");
      return false;
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      toast.error("Product stock must be a whole number of zero or more.");
      return false;
    }

    for (let index = 0; index < variants.length; index += 1) {
      const variant = variants[index];

      if (!variant) {
        toast.error(`Variant ${index + 1} is incomplete.`);
        return false;
      }

      if (
        !variant.length ||
        !Number.isFinite(Number(variant.length)) ||
        Number(variant.length) < 1 ||
        !variant.texture.trim() ||
        !variant.price ||
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0 ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        toast.error(`Check the required fields in variant ${index + 1}.`);
        return false;
      }

      if (
        variant.density &&
        (!Number.isFinite(Number(variant.density)) || Number(variant.density) < 1)
      ) {
        toast.error(`Variant ${index + 1} has an invalid density.`);
        return false;
      }
    }

    return true;
  };

  const uploadNewMedia = async () => {
    const uploaded: MediaItem[] = [];

    for (let index = 0; index < newFiles.length; index += UPLOAD_BATCH_SIZE) {
      const batch = newFiles.slice(index, index + UPLOAD_BATCH_SIZE);
      const response = await adminProductService.uploadMedia(batch);

      uploaded.push(
        ...response.files.map((file) => ({
          url: file.url,
          type: file.resourceType,
        })),
      );
    }

    return uploaded;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product || saving || !validateForm()) return;

    setSaving(true);

    try {
      const uploadedMedia = await uploadNewMedia();
      const allMedia = [...media, ...uploadedMedia];

      const payload: ProductPayload = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        images: allMedia.filter((item) => item.type === "image").map((item) => item.url),
        videos: allMedia.filter((item) => item.type === "video").map((item) => item.url),
        variants: variants.map((variant) => ({
          length: Number(variant.length),
          texture: variant.texture.trim(),
          colour: variant.colour.trim() || "Natural Black",
          ...(variant.density ? { density: Number(variant.density) } : {}),
          price: Number(variant.price),
          stock: Number(variant.stock),
        })),
        isFeatured,
      };

      await adminProductService.update(product._id, payload);

      toast.success("Product updated successfully.");
      resetNewFiles();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update the product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>Update product information, variants and media.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Product information</h3>

            <div className="space-y-2">
              <Label htmlFor="edit-product-name">Product name</Label>
              <Input
                id="edit-product-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-product-description">Description</Label>
              <Textarea
                id="edit-product-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-product-category">Category</Label>
                <select
                  id="edit-product-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-price">Base price (?)</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-stock">Base stock</Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="edit-product-featured">Featured product</Label>
                  <p className="text-xs text-muted-foreground">
                    Highlight this product in the store.
                  </p>
                </div>
                <Switch
                  id="edit-product-featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Hair variants</h3>
                <p className="text-xs text-muted-foreground">
                  Update existing variants or add new ones.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVariants((current) => [...current, emptyVariant()])}
              >
                <Plus />
                Add variant
              </Button>
            </div>

            {variants.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No variants. This product uses its base price and stock.
              </p>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Variant {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove variant ${index + 1}`}
                        onClick={() =>
                          setVariants((current) =>
                            current.filter((_, variantIndex) => variantIndex !== index),
                          )
                        }
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label>Length (inches)</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={variant.length}
                          onChange={(event) => updateVariant(index, "length", event.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Texture</Label>
                        <Input
                          value={variant.texture}
                          onChange={(event) => updateVariant(index, "texture", event.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Colour</Label>
                        <Input
                          value={variant.colour}
                          onChange={(event) => updateVariant(index, "colour", event.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Density (%)</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={variant.density}
                          onChange={(event) => updateVariant(index, "density", event.target.value)}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Variant price (?)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(event) => updateVariant(index, "price", event.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Variant stock</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock}
                          onChange={(event) => updateVariant(index, "stock", event.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="text-sm font-semibold">Product media</h3>
              <p className="text-xs text-muted-foreground">
                Remove existing media or upload additional images and videos. Maximum 20 MB per new
                file.
              </p>
            </div>

            {media.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="relative overflow-hidden rounded-lg border"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={`Product media ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-28 flex-col items-center justify-center gap-2 bg-muted">
                        <Video className="size-7 text-muted-foreground" />
                        <span className="text-xs">Existing video</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="truncate text-xs">
                        {item.type === "image" ? "Image" : "Video"} {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        aria-label={`Remove media ${index + 1}`}
                        onClick={() =>
                          setMedia((current) =>
                            current.filter((_, mediaIndex) => mediaIndex !== index),
                          )
                        }
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label
              htmlFor="edit-product-media"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50"
            >
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm font-medium">Choose additional images or videos</span>
              <span className="text-xs text-muted-foreground">JPEG, PNG, WEBP, MP4 and WEBM.</span>
            </label>

            <input
              id="edit-product-media"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm"
              className="hidden"
              onChange={(event) => {
                handleFileSelection(event.target.files);
                event.target.value = "";
              }}
            />

            {newFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">New files selected ({newFiles.length})</p>
                {newFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border p-2"
                  >
                    <span className="truncate text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setNewFiles((current) =>
                          current.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  {newFiles.length > 0 ? "Uploading and saving..." : "Saving..."}
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
