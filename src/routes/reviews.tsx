import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  ImagePlus,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Star,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth";
import { productService, type BackendProduct } from "@/services/product.service";
import { reviewService, type BackendReview } from "@/services/review.service";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "video/mp4",
  "video/webm",
];

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews - HairbyOma" },
      {
        name: "description",
        content: "Read customer experiences and verified product reviews from HairbyOma.",
      },
      { property: "og:title", content: "Customer Reviews - HairbyOma" },
      {
        property: "og:description",
        content: "Real customer experiences and product reviews from HairbyOma.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [reviewsRetry, setReviewsRetry] = useState(0);
  const [productsRetry, setProductsRetry] = useState(0);

  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError("");

      try {
        const response = await reviewService.list(1, 50);

        if (!cancelled) {
          setReviews(response.reviews || []);
        }
      } catch (error) {
        if (!cancelled) {
          setReviewsError(
            error instanceof Error ? error.message : "Unable to load customer reviews.",
          );
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [reviewsRetry]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError("");

      try {
        const response = await productService.list({
          page: 1,
          limit: 50,
          sort: "newest",
        });

        if (!cancelled) {
          setProducts(response.products || []);
        }
      } catch (error) {
        if (!cancelled) {
          setProductsError(error instanceof Error ? error.message : "Unable to load products.");
        }
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [productsRetry]);

  function resetForm() {
    setProductId("");
    setRating(0);
    setComment("");
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDialogChange(value: boolean) {
    if (!submitting) {
      setOpen(value);
      if (!value) resetForm();
    }
  }

  function writeReview() {
    if (!user) {
      navigate({ to: "/auth", search: { next: "/reviews" } });
      return;
    }

    setOpen(true);
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);

    if (selected.length + files.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} files.`);
      event.target.value = "";
      return;
    }

    const invalidType = selected.find((file) => !ALLOWED_TYPES.includes(file.type));

    if (invalidType) {
      toast.error("Only JPEG, PNG, WEBP images and MP4 or WEBM videos are allowed.");
      event.target.value = "";
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);

    if (oversized) {
      toast.error("Each file must be 20 MB or smaller.");
      event.target.value = "";
      return;
    }

    setFiles((current) => [...current, ...selected]);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit a review.");
      return;
    }

    if (!productId) {
      toast.error("Please select the product you purchased.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    const trimmedComment = comment.trim();

    if (trimmedComment.length < 5 || trimmedComment.length > 1000) {
      toast.error("Your review must contain between 5 and 1,000 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("rating", String(rating));
    formData.append("comment", trimmedComment);

    files.forEach((file) => {
      formData.append("media", file);
    });

    setSubmitting(true);

    try {
      const response = await reviewService.create(formData);

      toast.success(response.message || "Your review has been submitted and is awaiting approval.");

      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Client stories"
        title="Loved, worn, remembered."
        copy="Discover real experiences from customers who have chosen HairbyOma."
      />

      <section className="site-container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {reviews.length} approved {reviews.length === 1 ? "review" : "reviews"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">What our customers say</h2>
          </div>

          <Button onClick={writeReview}>
            <MessageSquare className="mr-2 size-4" />
            {user ? "Write a review" : "Sign in to review"}
          </Button>
        </div>

        {reviewsLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="size-8 animate-spin text-primary" />
          </div>
        ) : reviewsError ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">{reviewsError}</p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => setReviewsRetry((value) => value + 1)}
            >
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-5 text-xl font-semibold">No reviews yet</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Our customer stories will appear here once reviews have been approved. Be among the
              first to share your experience.
            </p>
            <Button className="mt-6" onClick={writeReview}>
              Write a review
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review._id} className="flex flex-col border p-5">
                {review.media?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {review.media.map((media, index) => (
                      <div key={`${media.url}-${index}`} className="overflow-hidden bg-muted">
                        {media.resourceType === "video" ? (
                          <video
                            src={media.url}
                            controls
                            preload="metadata"
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={`Customer review ${index + 1}`}
                            loading="lazy"
                            className="aspect-square w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${
                        index < review.rating ? "fill-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-4 flex-1 whitespace-pre-line leading-7">"{review.comment}"</p>

                <div className="mt-5 border-t pt-4">
                  <p className="font-semibold">{review.reviewer}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {review.product?.name || "HairbyOma product"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <BadgeCheck className="size-4" />
                      Verified purchase
                    </span>

                    <time className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share your HairbyOma experience</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Product purchased *</label>

              {productsLoading ? (
                <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading products...
                </div>
              ) : productsError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{productsError}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setProductsRetry((value) => value + 1)}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Retry
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">
                  No products are currently available.
                </p>
              ) : (
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose the product you purchased" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="form-label">Your rating *</label>
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} out of 5 stars`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="rounded p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Star
                      className={`size-8 ${
                        value <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}

                <span className="ml-2 text-sm text-muted-foreground">
                  {rating > 0 ? `${rating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="review-comment">
                Your review *
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us about your experience with this product..."
                rows={5}
                maxLength={1000}
                className="mt-2"
                required
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {comment.length}/1000 characters (minimum 5)
              </p>
            </div>

            <div>
              <label className="form-label">Photos or videos (optional)</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                multiple
                onChange={handleFilesChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= MAX_FILES}
                className="mt-2 flex w-full items-center justify-center gap-2 border border-dashed p-5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus className="size-5" />
                Add photos or videos
              </button>

              <p className="mt-2 text-xs text-muted-foreground">
                JPEG, PNG, WEBP, MP4 or WEBM. Maximum 5 files, 20 MB each.
              </p>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {file.type.startsWith("video/") ? (
                          <Video className="size-4 shrink-0 text-primary" />
                        ) : (
                          <ImagePlus className="size-4 shrink-0 text-primary" />
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeFile(index)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-3 text-sm text-muted-foreground">
              Reviews are only accepted from customers whose orders have been paid for and
              delivered. Submitted reviews are checked before appearing publicly.
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || productsLoading || products.length === 0 || !!productsError}
            >
              {submitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}
              {submitting ? "Submitting review..." : "Submit review"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
