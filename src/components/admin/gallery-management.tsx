import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
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
import { Textarea } from "@/components/ui/textarea";

import {
  galleryService,
  type AdminGalleryEntry,
  type AdminGalleryStatus,
  type GalleryCategory,
} from "@/services/gallery.service";
import { reviewService, type AdminReview } from "@/services/review.service";

const PAGE_SIZE = 10;
const REVIEW_PAGE_SIZE = 20;
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

const CATEGORIES: { label: string; value: GalleryCategory }[] = [
  { label: "Customer installation", value: "customer-installation" },
  { label: "Before and after", value: "before-and-after" },
  { label: "Packaging", value: "packaging" },
  { label: "Testimonials", value: "testimonials" },
  { label: "Other", value: "other" },
];

type CreationMode = "upload" | "review";

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

function getCategoryLabel(category: GalleryCategory) {
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export default function GalleryManagement() {
  const [entries, setEntries] = useState<AdminGalleryEntry[]>([]);
  const [status, setStatus] = useState<AdminGalleryStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryEntry | null>(null);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("other");
  const [mode, setMode] = useState<CreationMode>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [approvedReviews, setApprovedReviews] = useState<AdminReview[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState("");
  const [selectedMediaIndexes, setSelectedMediaIndexes] = useState<number[]>([]);

  const loadEntries = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await galleryService.listAdmin({
          status,
          page,
          limit: PAGE_SIZE,
          ...(categoryFilter ? { category: categoryFilter as GalleryCategory } : {}),
        });

        setEntries(response.gallery);
        setTotalEntries(response.total);
        setTotalPages(Math.max(1, response.pagination.totalPages));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load gallery entries.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status, page, categoryFilter],
  );

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const loadApprovedReviews = useCallback(async () => {
    setReviewsLoading(true);

    try {
      const response = await reviewService.listAdmin({
        status: "approved",
        page: reviewPage,
        limit: REVIEW_PAGE_SIZE,
      });

      setApprovedReviews(response.reviews);
      setReviewTotalPages(Math.max(1, response.pagination.totalPages));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load approved customer reviews.");
      setApprovedReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewPage]);

  useEffect(() => {
    if (createOpen && mode === "review") {
      void loadApprovedReviews();
    }
  }, [createOpen, mode, loadApprovedReviews]);

  const selectedReview = approvedReviews.find((review) => review._id === selectedReviewId);

  const resetForm = () => {
    setTitle("");
    setCaption("");
    setCategory("other");
    setMode("upload");
    setFiles([]);
    setSelectedReviewId("");
    setSelectedMediaIndexes([]);
    setReviewPage(1);
    setApprovedReviews([]);
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (saving) return;

    if (!open) {
      resetForm();
    }

    setCreateOpen(open);
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

    setFiles((current) => {
      const remaining = MAX_FILES - current.length;

      if (accepted.length > remaining) {
        toast.error(`You can select a maximum of ${MAX_FILES} media files.`);
      }

      return [...current, ...accepted.slice(0, Math.max(0, remaining))];
    });
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const toggleMediaSelection = (index: number) => {
    setSelectedMediaIndexes((current) => {
      if (current.includes(index)) {
        return current.filter((item) => item !== index);
      }

      if (current.length >= MAX_FILES) {
        toast.error(`You can select a maximum of ${MAX_FILES} media files.`);
        return current;
      }

      return [...current, index];
    });
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Enter a gallery title.");
      return false;
    }

    if (title.trim().length > 100) {
      toast.error("The title cannot exceed 100 characters.");
      return false;
    }

    if (caption.length > 1000) {
      toast.error("The caption cannot exceed 1,000 characters.");
      return false;
    }

    if (mode === "upload" && (files.length < 1 || files.length > MAX_FILES)) {
      toast.error("Select between 1 and 5 media files.");
      return false;
    }

    if (mode === "review") {
      if (!selectedReviewId) {
        toast.error("Select an approved customer review.");
        return false;
      }

      if (selectedMediaIndexes.length < 1 || selectedMediaIndexes.length > MAX_FILES) {
        toast.error("Select between 1 and 5 review media files.");
        return false;
      }
    }

    return true;
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || !validateForm()) return;

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("caption", caption.trim());
      formData.append("category", category);

      if (mode === "upload") {
        files.forEach((file) => {
          formData.append("media", file);
        });
      } else {
        formData.append("sourceReviewId", selectedReviewId);
        formData.append("mediaIndexes", JSON.stringify(selectedMediaIndexes));
      }

      await galleryService.createAdmin(formData);

      toast.success("Gallery entry created. It is unpublished until you publish it.");
      resetForm();
      setCreateOpen(false);
      setPage(1);

      if (page === 1) {
        await loadEntries();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create gallery entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublication = async (entry: AdminGalleryEntry) => {
    setActionId(entry._id);

    try {
      await galleryService.togglePublication(entry._id);

      toast.success(
        entry.isPublished ? "Gallery entry unpublished." : "Gallery entry published successfully.",
      );

      await loadEntries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update publication status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget._id;
    setActionId(id);

    try {
      await galleryService.deleteAdmin(id);
      toast.success("Gallery entry deleted successfully.");
      setDeleteTarget(null);

      if (entries.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadEntries();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete gallery entry.");
    } finally {
      setActionId(null);
    }
  };

  const statusTabs: { label: string; value: AdminGalleryStatus }[] = [
    { label: "All entries", value: "all" },
    { label: "Published", value: "published" },
    { label: "Unpublished", value: "unpublished" },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Store management</p>
          <h2 className="mt-2 text-2xl font-semibold">Gallery management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer installations, transformations, packaging and featured media.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void loadEntries(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Refresh
          </Button>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add gallery entry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Gallery entries found</p>
              <p className="mt-1 text-2xl font-semibold">{totalEntries.toLocaleString()}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <ImageIcon className="size-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Current filter</p>
              <p className="mt-1 text-lg font-semibold">
                {statusTabs.find((tab) => tab.value === status)?.label}
              </p>
            </div>
            <Badge variant="secondary">
              {getCategoryLabel(categoryFilter as GalleryCategory) || "All categories"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={status === tab.value ? "default" : "outline"}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <select
          aria-label="Filter gallery by category"
          value={categoryFilter}
          onChange={(event) => {
            setCategoryFilter(event.target.value);
            setPage(1);
          }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-56"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading gallery...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadEntries()}>
            Try again
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <ImageIcon className="mx-auto size-9 text-muted-foreground" />
          <h3 className="mt-4 font-medium">No gallery entries found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add media to start building your store gallery.
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add gallery entry
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <article key={entry._id} className="overflow-hidden rounded-xl border bg-card">
              <div className="grid grid-cols-2 gap-1 bg-muted p-1">
                {entry.media.slice(0, 4).map((media, index) => (
                  <div
                    key={`${media.url}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-md bg-background"
                  >
                    {media.resourceType === "video" ? (
                      <video
                        src={media.url}
                        controls
                        preload="metadata"
                        className="size-full object-cover"
                      />
                    ) : (
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open gallery image ${index + 1}`}
                      >
                        <img
                          src={media.url}
                          alt={`${entry.title} ${index + 1}`}
                          loading="lazy"
                          className="size-full object-cover transition-opacity hover:opacity-80"
                        />
                      </a>
                    )}
                  </div>
                ))}

                {entry.media.length === 1 && (
                  <div className="flex aspect-square items-center justify-center rounded-md bg-background">
                    <ImageIcon className="size-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{getCategoryLabel(entry.category)}</Badge>
                  <Badge variant={entry.isPublished ? "default" : "outline"}>
                    {entry.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold">{entry.title}</h3>
                  {entry.caption && (
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                      {entry.caption}
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{entry.media.length} media file(s)</p>
                  <p>Added {formatDate(entry.createdAt)}</p>
                  <p>
                    By{" "}
                    {entry.createdBy
                      ? `${entry.createdBy.firstName} ${entry.createdBy.lastName}`.trim()
                      : "Unknown admin"}
                  </p>
                  {entry.sourceReview && (
                    <p className="flex items-center gap-1">
                      <Check className="size-3.5" />
                      From an approved customer review ({entry.sourceReview.rating}/5)
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant={entry.isPublished ? "outline" : "default"}
                    className="flex-1"
                    onClick={() => void handleTogglePublication(entry)}
                    disabled={actionId !== null}
                  >
                    {actionId === entry._id ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : entry.isPublished ? (
                      <EyeOff className="mr-2 size-4" />
                    ) : (
                      <Eye className="mr-2 size-4" />
                    )}
                    {entry.isPublished ? "Unpublish" : "Publish"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(entry)}
                    disabled={actionId !== null}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && totalEntries > 0 && (
        <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • {totalEntries} entries
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

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a gallery entry</DialogTitle>
            <DialogDescription>
              Upload new media or feature media from an approved customer review. New entries are
              unpublished until you publish them.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-5">
            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gallery-title">Title</Label>
                <Input
                  id="gallery-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Customer's Bone Straight Installation"
                  maxLength={100}
                  required
                />
                <p className="text-right text-xs text-muted-foreground">{title.length}/100</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gallery-caption">Caption</Label>
                <Textarea
                  id="gallery-caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Add a description or caption..."
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-right text-xs text-muted-foreground">{caption.length}/1000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gallery-category">Category</Label>
                <select
                  id="gallery-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as GalleryCategory)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="space-y-4 border-t pt-5">
              <div>
                <h3 className="text-sm font-semibold">Media source</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose where this gallery entry's media should come from.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={mode === "upload" ? "default" : "outline"}
                  onClick={() => setMode("upload")}
                >
                  <Upload className="mr-2 size-4" />
                  Upload new media
                </Button>
                <Button
                  type="button"
                  variant={mode === "review" ? "default" : "outline"}
                  onClick={() => setMode("review")}
                >
                  <ImageIcon className="mr-2 size-4" />
                  Use customer review
                </Button>
              </div>

              {mode === "upload" ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WEBP, MP4 and WEBM supported. Maximum 5 files and 20 MB per file.
                  </p>

                  <label
                    htmlFor="gallery-media"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50"
                  >
                    <Upload className="size-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Choose images or videos</span>
                    <span className="text-xs text-muted-foreground">
                      {files.length}/{MAX_FILES} files selected
                    </span>
                  </label>

                  <input
                    id="gallery-media"
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
                          className="overflow-hidden rounded-lg border"
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
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Select an approved review, then choose up to five of its media files. The
                    original review media will remain untouched.
                  </p>

                  {reviewsLoading ? (
                    <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading approved reviews...
                    </div>
                  ) : approvedReviews.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-5 text-center">
                      <ImageIcon className="mx-auto size-7 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">No approved reviews found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Approve customer reviews with uploaded media before featuring them here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="source-review">Approved customer review</Label>
                        <select
                          id="source-review"
                          value={selectedReviewId}
                          onChange={(event) => {
                            setSelectedReviewId(event.target.value);
                            setSelectedMediaIndexes([]);
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Choose a review</option>
                          {approvedReviews.map((review) => {
                            const customer = review.user
                              ? `${review.user.firstName} ${review.user.lastName}`.trim()
                              : "Unknown customer";

                            return (
                              <option key={review._id} value={review._id}>
                                {customer} • {review.rating}/5 • {review.media.length} media
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {selectedReview && (
                        <div className="space-y-3 rounded-lg border p-3">
                          <div>
                            <p className="text-sm font-medium">
                              {selectedReview.user
                                ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}`.trim()
                                : "Unknown customer"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {selectedReview.comment}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Select media ({selectedMediaIndexes.length}/{MAX_FILES})
                            </p>
                          </div>

                          {selectedReview.media.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              This review has no uploaded media.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {selectedReview.media.map((media, index) => {
                                const selected = selectedMediaIndexes.includes(index);

                                return (
                                  <button
                                    key={`${media.url}-${index}`}
                                    type="button"
                                    onClick={() => toggleMediaSelection(index)}
                                    className={`relative overflow-hidden rounded-lg border-2 text-left transition-colors ${
                                      selected ? "border-primary" : "border-transparent"
                                    }`}
                                  >
                                    {media.resourceType === "video" ? (
                                      <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-muted">
                                        <Video className="size-8 text-muted-foreground" />
                                        <span className="px-2 text-xs">Video {index + 1}</span>
                                      </div>
                                    ) : (
                                      <img
                                        src={media.url}
                                        alt={`Review media ${index + 1}`}
                                        className="aspect-square w-full object-cover"
                                      />
                                    )}

                                    <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-background shadow">
                                      {selected ? (
                                        <Check className="size-4 text-primary" />
                                      ) : (
                                        <Plus className="size-4" />
                                      )}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {reviewTotalPages > 1 && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            Review page {reviewPage} of {reviewTotalPages}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={reviewPage <= 1 || reviewsLoading}
                              onClick={() => setReviewPage((current) => current - 1)}
                            >
                              <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={reviewPage >= reviewTotalPages || reviewsLoading}
                              onClick={() => setReviewPage((current) => current + 1)}
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            <DialogFooter className="gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => handleCreateOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || reviewsLoading}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Create gallery entry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && actionId === null) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gallery entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes "{deleteTarget?.title}". If the entry uses media uploaded
              specifically to the gallery, the backend will also attempt to remove those files.
              Original customer review media is preserved. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={actionId !== null}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {actionId === deleteTarget?._id ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Delete entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
