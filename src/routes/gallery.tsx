import { createFileRoute } from "@tanstack/react-router";
import { Play, Maximize2, RefreshCw, LoaderCircle, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  galleryService,
  type BackendGalleryEntry,
  type GalleryCategory,
} from "@/services/gallery.service";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "HairbyOma Gallery | Hair & Client Looks" },
      {
        name: "description",
        content: "Explore HairbyOma wigs, installations, client looks and hair transformations.",
      },
      { property: "og:title", content: "HairbyOma Gallery" },
      {
        property: "og:description",
        content: "Hair, installations and client looks by HairbyOma.",
      },
    ],
  }),
  component: Page,
});

const categories: {
  label: string;
  value: GalleryCategory | "all";
}[] = [
  { label: "All", value: "all" },
  { label: "Customer Installations", value: "customer-installation" },
  { label: "Before & After", value: "before-and-after" },
  { label: "Packaging", value: "packaging" },
  { label: "Testimonials", value: "testimonials" },
  { label: "Other", value: "other" },
];

const categoryLabels: Record<GalleryCategory, string> = {
  "customer-installation": "Customer Installations",
  "before-and-after": "Before & After",
  packaging: "Packaging",
  testimonials: "Testimonials",
  other: "Other",
};

function Page() {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [entries, setEntries] = useState<BackendGalleryEntry[]>([]);
  const [active, setActive] = useState<BackendGalleryEntry>();
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchGallery = async () => {
      setLoading(true);
      setError("");
      setEntries([]);
      setPage(1);
      setHasNextPage(false);

      try {
        const response = await galleryService.list({
          page: 1,
          limit: 12,
          ...(filter !== "all" ? { category: filter } : {}),
        });

        if (cancelled) return;

        setEntries(response.gallery);
        setHasNextPage(response.pagination.hasNextPage);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Unable to load the gallery. Please try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGallery();

    return () => {
      cancelled = true;
    };
  }, [filter, retry]);

  const loadMore = async () => {
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;

      const response = await galleryService.list({
        page: nextPage,
        limit: 12,
        ...(filter !== "all" ? { category: filter } : {}),
      });

      setEntries((current) => [...current, ...response.gallery]);
      setPage(nextPage);
      setHasNextPage(response.pagination.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load more gallery entries.");
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <PageHero
        eyebrow="The lookbook"
        title="HairbyOma Gallery"
        copy="Explore beautiful textures, transformations and real customer looks."
      />

      <section className="site-container py-10">
        <div className="mb-7 flex gap-2 overflow-x-auto pb-3">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={filter === category.value ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setFilter(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <span className="ml-3 text-sm text-muted-foreground">Loading gallery...</span>
          </div>
        ) : error && entries.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={() => setRetry((value) => value + 1)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold">Nothing to show yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              There are currently no published gallery entries in this category. Please check back
              soon.
            </p>
            {filter !== "all" && (
              <Button variant="outline" className="mt-5" onClick={() => setFilter("all")}>
                View all gallery entries
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="columns-2 gap-3 md:columns-3">
              {entries.map((item, index) => {
                const preview = item.media[0];

                if (!preview) return null;

                return (
                  <button
                    key={item._id}
                    type="button"
                    className="group relative mb-3 block w-full overflow-hidden rounded-sm text-left"
                    onClick={() => setActive(item)}
                    aria-label={`View ${item.title}`}
                  >
                    {preview.resourceType === "video" ? (
                      <video
                        src={preview.url}
                        muted
                        playsInline
                        preload="metadata"
                        className={`w-full object-cover ${
                          index % 3 === 0 ? "aspect-[4/5]" : "aspect-square"
                        }`}
                      />
                    ) : (
                      <img
                        src={preview.url}
                        alt={item.title}
                        loading="lazy"
                        className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          index % 3 === 0 ? "aspect-[4/5]" : "aspect-square"
                        }`}
                      />
                    )}

                    <span className="absolute inset-0 flex items-end justify-between bg-foreground/0 p-4 text-left text-background opacity-0 transition-all group-hover:bg-foreground/45 group-hover:opacity-100">
                      <span>
                        <span className="block font-medium">{item.title}</span>
                        <small className="block">{categoryLabels[item.category]}</small>
                      </span>

                      {preview.resourceType === "video" ? (
                        <Play className="h-5 w-5 shrink-0" />
                      ) : (
                        <Maximize2 className="h-5 w-5 shrink-0" />
                      )}
                    </span>

                    {item.media.length > 1 && (
                      <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                        {item.media.length} media
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" onClick={loadMore}>
                  Try loading again
                </Button>
              </div>
            )}

            {hasNextPage && !error && (
              <div className="mt-10 flex justify-center">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load more
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(undefined)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {active && (
            <>
              <DialogTitle className="text-xl">{active.title}</DialogTitle>

              <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{categoryLabels[active.category]}</span>
                <span>•</span>
                <span>{formatDate(active.createdAt)}</span>
              </div>

              {active.caption && (
                <p className="mb-4 text-sm text-muted-foreground">{active.caption}</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {active.media.map((media, index) => (
                  <div
                    key={`${media.url}-${index}`}
                    className="overflow-hidden rounded-md bg-muted"
                  >
                    {media.resourceType === "video" ? (
                      <video
                        src={media.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="max-h-[65vh] w-full object-contain"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={`${active.title} - image ${index + 1}`}
                        className="max-h-[65vh] w-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
