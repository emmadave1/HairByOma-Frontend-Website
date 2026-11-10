import { useEffect, useRef } from "react";
import Swiper from "swiper";
import { Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { BackendReview } from "@/services/review.service";

export function ReviewsSlider({ reviews }: { reviews: BackendReview[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reviews.length === 0) return;

    const paginationEl = root.querySelector<HTMLElement>(".reviews-dots");

    const swiper = new Swiper(root, {
      modules: [Autoplay, Keyboard, Navigation, Pagination],
      rewind: true,
      speed: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
      slidesPerView: 1,
      spaceBetween: 16,
      autoplay: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? false
        : { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { prevEl: prevRef.current, nextEl: nextRef.current },
      pagination: { el: paginationEl, clickable: true },
      keyboard: { enabled: true },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });

    return () => {
      swiper.destroy(true, true);
    };
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="bg-background px-6 py-12 text-center">
        <p className="text-muted-foreground">
          Customer reviews will appear here once they are available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={rootRef}
        className="reviews-swiper overflow-hidden"
        aria-label="Customer reviews carousel"
      >
        <div className="swiper-wrapper items-stretch">
          {reviews.map((review) => {
            const image = review.media.find((item) => item.resourceType === "image");
            const video = review.media.find((item) => item.resourceType === "video");

            return (
              <div key={review._id} className="swiper-slide h-auto">
                <article className="flex h-full flex-col bg-background p-6">
                  <div
                    className="flex gap-1 text-primary"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${
                          index < review.rating ? "fill-current" : "opacity-30"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-4 grow leading-7">&ldquo;{review.comment}&rdquo;</p>

                  {image && (
                    <img
                      src={image.url}
                      alt={`Customer review of ${review.product?.name ?? "HairbyOma product"}`}
                      loading="lazy"
                      className="mt-4 h-40 w-full rounded-lg object-cover"
                    />
                  )}

                  {video && (
                    <video
                      src={video.url}
                      controls
                      preload="metadata"
                      className="mt-4 max-h-48 w-full rounded-lg"
                    >
                      Your browser does not support video playback.
                    </video>
                  )}

                  <div className="mt-5">
                    <strong>{review.reviewer}</strong>
                    <p className="text-xs text-muted-foreground">
                      {review.product?.name ?? "HairbyOma product"}
                      {" • Verified purchase"}
                    </p>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        <div className="reviews-dots mt-8 text-center" />
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 md:absolute md:-top-16 md:right-0 md:mt-0">
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous review"
          className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          ref={nextRef}
          type="button"
          aria-label="Next review"
          className="grid size-10 place-items-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
