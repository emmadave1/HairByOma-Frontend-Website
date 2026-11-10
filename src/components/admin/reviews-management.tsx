import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { reviewService, type AdminReview, type AdminReviewStatus } from "@/services/review.service";

const PAGE_SIZE = 10;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function ReviewsManagement() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState<AdminReviewStatus>("all");
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminReview | null>(null);

  const loadReviews = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await reviewService.listAdmin({
          status,
          page,
          limit: PAGE_SIZE,
        });

        setReviews(response.reviews);
        setTotalReviews(response.pagination.totalReviews);
        setTotalPages(Math.max(1, response.pagination.totalPages));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load reviews.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status, page],
  );

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const handleStatusChange = (nextStatus: AdminReviewStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleApprove = async (review: AdminReview) => {
    setActionId(review._id);

    try {
      await reviewService.approve(review._id);
      toast.success("Review approved successfully.");
      await loadReviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to approve review.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    const reviewId = rejectTarget._id;
    setActionId(reviewId);

    try {
      await reviewService.reject(reviewId);
      toast.success("Review rejected and deleted successfully.");
      setRejectTarget(null);

      if (reviews.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadReviews();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reject review.");
    } finally {
      setActionId(null);
    }
  };

  const tabs: { label: string; value: AdminReviewStatus }[] = [
    { label: "All reviews", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-2 text-2xl font-semibold">Customer reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Moderate customer feedback before it appears publicly.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadReviews(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={status === tab.value ? "default" : "outline"}
            onClick={() => handleStatusChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Reviews found</p>
            <p className="mt-1 text-2xl font-semibold">{totalReviews.toLocaleString()}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Star className="size-5 text-primary" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading reviews...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadReviews()}>
            Try again
          </Button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <ImageIcon className="mx-auto size-9 text-muted-foreground" />
          <h3 className="mt-4 font-medium">No reviews found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no reviews in this category yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const customerName = review.user
              ? `${review.user.firstName} ${review.user.lastName}`.trim()
              : "Unknown customer";

            return (
              <article key={review._id} className="space-y-4 rounded-xl border bg-card p-4 md:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{customerName}</h3>
                      <Badge variant={review.isApproved ? "default" : "secondary"}>
                        {review.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </div>

                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {review.user?.email || "No customer email available"}
                    </p>

                    <p className="mt-2 text-sm">
                      Product:{" "}
                      <span className="font-medium">
                        {review.product?.name || "Product unavailable"}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${
                        index < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                  {review.comment}
                </p>

                {review.media.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {review.media.map((media, index) => (
                      <div
                        key={`${media.url}-${index}`}
                        className="overflow-hidden rounded-lg border"
                      >
                        {media.resourceType === "video" ? (
                          <video
                            src={media.url}
                            controls
                            preload="metadata"
                            className="h-28 w-28 bg-muted object-cover sm:h-36 sm:w-36"
                          />
                        ) : (
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open review image ${index + 1}`}
                          >
                            <img
                              src={media.url}
                              alt={`Customer review ${index + 1}`}
                              loading="lazy"
                              className="h-28 w-28 object-cover transition-opacity hover:opacity-80 sm:h-36 sm:w-36"
                            />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  {!review.isApproved && (
                    <Button
                      size="sm"
                      onClick={() => void handleApprove(review)}
                      disabled={actionId !== null}
                    >
                      {actionId === review._id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 size-4" />
                      )}
                      Approve
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setRejectTarget(review)}
                    disabled={actionId !== null}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Reject
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && totalReviews > 0 && (
        <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • {totalReviews} reviews
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open && actionId === null) setRejectTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject and delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the review, removes any gallery entries linked to it, and
              attempts to delete its uploaded media. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionId !== null}
              onClick={(event) => {
                event.preventDefault();
                void handleReject();
              }}
            >
              {actionId === rejectTarget?._id ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Confirm rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default ReviewsManagement;
