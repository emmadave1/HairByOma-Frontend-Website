import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Plus, Trash2, Upload, Video, X } from "lucide-react";
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

type AddProductDialogProps = {
  open: boolean;
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

export default function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setPrice("");
    setStock("0");
    setIsFeatured(false);
    setVariants([]);
    setFiles([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving) return;

    if (!nextOpen) {
      resetForm();
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
      setFiles((current) => [...current, ...accepted]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const validateForm = () => {
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

  const uploadSelectedMedia = async () => {
    const uploadedFiles: {
      url: string;
      resourceType: "image" | "video";
    }[] = [];

    for (let index = 0; index < files.length; index += UPLOAD_BATCH_SIZE) {
      const batch = files.slice(index, index + UPLOAD_BATCH_SIZE);
      const response = await adminProductService.uploadMedia(batch);

      uploadedFiles.push(
        ...response.files.map((file) => ({
          url: file.url,
          resourceType: file.resourceType,
        })),
      );
    }

    return {
      images: uploadedFiles.filter((file) => file.resourceType === "image").map((file) => file.url),
      videos: uploadedFiles.filter((file) => file.resourceType === "video").map((file) => file.url),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || !validateForm()) return;

    setSaving(true);

    try {
      const media = await uploadSelectedMedia();

      const payload: ProductPayload = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        images: media.images,
        videos: media.videos,
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

      await adminProductService.create(payload);

      toast.success("Product created successfully.");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create the product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Add product details, hair variants and product media to your store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Product information</h3>

            <div className="space-y-2">
              <Label htmlFor="product-name">Product name</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. 18-inch Bone Straight Wig"
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the product..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-category">Category</Label>
                <select
                  id="product-category"
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
                <Label htmlFor="product-price">Base price (?)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-stock">Base stock</Label>
                <Input
                  id="product-stock"
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
                  <Label htmlFor="product-featured">Featured product</Label>
                  <p className="text-xs text-muted-foreground">
                    Highlight this product in the store.
                  </p>
                </div>
                <Switch
                  id="product-featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Base price and stock are required by the product record. When variants are added, each
              variant has its own selling price and stock.
            </p>
          </section>

          <section className="space-y-4 border-t pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Hair variants</h3>
                <p className="text-xs text-muted-foreground">
                  Add different lengths, textures, colours and prices.
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
                No variants added. The product will use its base price and stock.
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
                          placeholder="18"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Texture</Label>
                        <Input
                          value={variant.texture}
                          onChange={(event) => updateVariant(index, "texture", event.target.value)}
                          placeholder="Bone Straight"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Colour</Label>
                        <Input
                          value={variant.colour}
                          onChange={(event) => updateVariant(index, "colour", event.target.value)}
                          placeholder="Natural Black"
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
                          placeholder="0"
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
                Select images and videos. JPEG, PNG, WEBP, MP4 and WEBM are supported. Maximum 20 MB
                per file.
              </p>
            </div>

            <label
              htmlFor="product-media"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50"
            >
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm font-medium">Choose images or videos</span>
              <span className="text-xs text-muted-foreground">You can select multiple files.</span>
            </label>
            <input
              id="product-media"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm"
              className="hidden"
              onChange={(event) => {
                handleFileSelection(event.target.files);
                event.target.value = "";
              }}
            />

            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="relative overflow-hidden rounded-lg border"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-28 flex-col items-center justify-center gap-2 bg-muted">
                        <Video className="size-7 text-muted-foreground" />
                        <span className="max-w-full truncate px-2 text-xs">{file.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="truncate text-xs">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeFile(index)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImagePlus className="size-4" />
                No media selected. You can add media later.
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
                  {files.length > 0 ? "Uploading and saving..." : "Saving..."}
                </>
              ) : (
                <>
                  <Plus />
                  Create product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
