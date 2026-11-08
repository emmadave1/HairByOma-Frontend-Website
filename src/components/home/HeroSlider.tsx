import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hairbyoma-hero.jpg";
import deep from "@/assets/deep-wave.jpg";
import bob from "@/assets/bob-wig.jpg";
import bounce from "@/assets/layered-bounce.jpg";
import wave from "@/assets/water-wave.jpg";
import ponytail from "@/assets/sleek-ponytail.jpg";
import { siteConfig } from "@/data/config";

const slides = [
  {
    src: hero,
    alt: "HairbyOma model wearing long bone-straight hair",
    eyebrow: "HairbyOma · Port Harcourt",
    title: "Luxury Hair.\nTimeless Beauty.",
    copy: "Discover polished textures, beautifully finished wigs and a personal consultation experience designed around you.",
    actions: [
      { label: "Shop now", to: "/shop", icon: "shop" },
      { label: "Book appointment", to: "/appointment", icon: "calendar" },
    ],
  },
  {
    src: wave,
    alt: "Model with voluminous water-wave curls",
    eyebrow: "Soft movement · Defined texture",
    title: "Define your\nsignature texture.",
    copy: "Explore expressive waves and curls, selected for beautiful shape, shine and an effortless finish.",
    actions: [
      { label: "Shop deep wave", to: "/shop", search: { category: "Deep Wave" }, icon: "shop" },
      { label: "See the gallery", to: "/gallery", icon: "arrow" },
    ],
  },
  {
    src: ponytail,
    alt: "Model with a sleek long ponytail",
    eyebrow: "A polished everyday statement",
    title: "Made for your\nmoment.",
    copy: "Find a look that feels distinctly yours, or work with HairbyOma to create a custom wig.",
    actions: [
      { label: "Design a custom wig", to: "/custom-wig", icon: "arrow" },
      { label: "Book a consultation", to: "/appointment", icon: "calendar" },
    ],
  },
  {
    src: deep,
    alt: "Deep wave hair bundles",
    eyebrow: "Beautifully considered hair",
    title: "Movement made\nto be noticed.",
    copy: "From glossy waves to soft volume, discover styles made to move naturally with you.",
    actions: [
      { label: "Shop the collection", to: "/shop", icon: "shop" },
      {
        label: "Chat with HairbyOma",
        href: `https://wa.me/${siteConfig.whatsappNumber}`,
        icon: "message",
      },
    ],
  },
  {
    src: bob,
    alt: "Model wearing a polished bob wig",
    eyebrow: "Ready-to-wear · Refined finish",
    title: "Polished from\nevery angle.",
    copy: "Meet the easy-to-wear pieces that bring a considered finish to every day.",
    actions: [
      {
        label: "Shop ready-to-wear",
        to: "/shop",
        search: { category: "Ready-to-Wear Wigs" },
        icon: "shop",
      },
      { label: "Book appointment", to: "/appointment", icon: "calendar" },
    ],
  },
  {
    src: bounce,
    alt: "Layered bounce wig with soft movement",
    eyebrow: "Volume · Soft layers · Shine",
    title: "Discover your\nnew favourite.",
    copy: "Find your next signature look in a curated collection of rich textures and graceful movement.",
    actions: [
      { label: "Explore the collection", to: "/shop", icon: "shop" },
      { label: "Explore the gallery", to: "/gallery", icon: "arrow" },
    ],
  },
];

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [paused]);
  const current = slides[active];
  if (!current) return null;
  const iconFor = (icon: string) =>
    icon === "shop" ? (
      <ShoppingBag />
    ) : icon === "calendar" ? (
      <CalendarDays />
    ) : icon === "message" ? (
      <MessageCircle />
    ) : (
      <ArrowRight />
    );
  return (
    <div
      className="hero-shell"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="hero-parallax absolute inset-0" data-parallax>
        {slides.map((img, i) => (
          <img
            key={img.alt}
            src={img.src}
            alt={i === active ? img.alt : ""}
            aria-hidden={i !== active}
            width={1536}
            height={1280}
            fetchPriority={i === 0 ? "high" : undefined}
            loading={i === 0 ? undefined : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ease-in-out ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="relative z-10 flex min-h-[39rem] flex-col justify-end px-5 pb-20 pt-10 text-background sm:min-h-[40rem] sm:px-10 sm:pb-24 md:px-12 md:pt-14 lg:min-h-[min(76vh,48rem)]">
        <div key={active} className="hero-copy-enter max-w-2xl">
          <p className="eyebrow text-background/80">{current.eyebrow}</p>
          <h1 className="mt-3 whitespace-pre-line text-4xl leading-[1.05] sm:text-5xl md:text-7xl">
            {current.title}
          </h1>
          <p className="mt-5 max-w-lg text-base text-background/85 sm:text-lg">{current.copy}</p>
          <div className="mt-7 grid max-w-xl gap-3 min-[500px]:grid-cols-2 sm:flex sm:flex-wrap">
            {current.actions.map((action) => {
              const icon = iconFor(action.icon);
              return "href" in action ? (
                <Button key={action.label} magnetic asChild size="lg" className="w-full sm:w-auto">
                  <a href={action.href} target="_blank" rel="noreferrer">
                    {icon}
                    {action.label}
                  </a>
                </Button>
              ) : (
                <Button
                  key={action.label}
                  magnetic
                  asChild
                  size="lg"
                  variant={action === current.actions[0] ? "default" : "secondary"}
                  className="w-full sm:w-auto"
                >
                  <Link to={action.to} {...("search" in action ? { search: action.search } : {})}>
                    {icon}
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
        <div className="mt-5 flex w-fit max-w-full items-center gap-1.5" aria-label="Hero slides">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-background hover:bg-background/15 hover:text-background"
            onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
          >
            <ArrowLeft />
          </Button>
          <div className="flex min-w-0 items-center gap-0.5">
            {slides.map((slide, i) => (
              <Button
                key={slide.title}
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-background hover:bg-background/15 hover:text-background"
                onClick={() => setActive(i)}
                aria-label={`Show slide ${i + 1}: ${slide.eyebrow}`}
                aria-pressed={i === active}
              >
                <span
                  className={`h-1 rounded-full transition-all ${i === active ? "w-4 bg-background" : "w-1.5 bg-background/60"}`}
                />
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-background hover:bg-background/15 hover:text-background"
            onClick={() => setActive((i) => (i + 1) % slides.length)}
            aria-label="Next slide"
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
