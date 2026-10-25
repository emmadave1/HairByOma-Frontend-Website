import { useEffect, useRef } from "react";
import Swiper from "swiper";
import { Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Review } from "@/types";

export function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
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
      pagination: { el: root.querySelector(".reviews-dots"), clickable: true },
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
  return (
    <div className="relative">
      <div
        ref={rootRef}
        className="reviews-swiper overflow-hidden"
        aria-label="Client reviews carousel"
      >
        <div className="swiper-wrapper items-stretch">
          {reviews.map((r) => (
            <div key={r.id} className="swiper-slide h-auto">
              <article className="flex h-full flex-col bg-background p-6">
                <p className="text-primary" aria-hidden="true">
                  ★★★★★
                </p>
                <p className="mt-4 grow leading-7">“{r.text}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={r.image} alt="" className="size-11 rounded-full object-cover" />
                  <div>
                    <strong>{r.name}</strong>
                    <p className="text-xs text-muted-foreground">
                      {r.product} · {r.verified ? "Verified purchase" : "Community review"}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          ))}
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
