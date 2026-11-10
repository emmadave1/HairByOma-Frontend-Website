import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MessageCircle,
  // Pause,
  Play,
  ShoppingBag,
} from "lucide-react";

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
      {
        label: "Shop deep wave",
        to: "/shop",
        search: { category: "Deep Wave" },
        icon: "shop",
      },
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
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const paused = userPaused || reducedMotion;

  // Detect and respond to the visitor's reduced-motion preference.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  // Automatically rotate slides when rotation is not paused.
  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(id);
  }, [paused]);

  // Preload the next slide to improve transition smoothness.
  useEffect(() => {
    const nextIndex = (active + 1) % slides.length;
    const nextImage = new window.Image();

    nextImage.src = slides[nextIndex]!.src;
  }, [active]);

  const current = slides[active];

  if (!current) return null;

  const iconFor = (icon: string) => {
    switch (icon) {
      case "shop":
        return <ShoppingBag aria-hidden="true" />;
      case "calendar":
        return <CalendarDays aria-hidden="true" />;
      case "message":
        return <MessageCircle aria-hidden="true" />;
      default:
        return <ArrowRight aria-hidden="true" />;
    }
  };

  const showPrevious = () => {
    setActive((index) => (index - 1 + slides.length) % slides.length);
  };

  const showNext = () => {
    setActive((index) => (index + 1) % slides.length);
  };

  return (
    <section
      className="hero-shell"
      role="region"
      aria-roledescription="carousel"
      aria-label="HairbyOma featured collections"
    >
      {/* Single active background slide */}
      <div className="hero-parallax absolute inset-0 overflow-hidden" data-parallax>
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={1536}
          height={1280}
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      <div className="hero-overlay" />

      <div className="relative z-10 flex min-h-[39rem] flex-col justify-center px-5 py-12 text-background sm:min-h-[40rem] sm:px-10 sm:py-14 md:px-12 lg:min-h-[min(76vh,48rem)]">
        {/* Active slide content */}
        <div
          key={active}
          className="hero-copy-enter max-w-2xl"
          role="group"
          aria-roledescription="slide"
          aria-label={`${active + 1} of ${slides.length}: ${current.eyebrow}`}
        >
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
                  <a href={action.href} target="_blank" rel="noopener noreferrer">
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

        {/* Carousel controls */}
        <div className="mt-5 flex w-fit max-w-full items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-background hover:bg-background/15 hover:text-background"
            onClick={showPrevious}
            aria-label="Previous slide"
          >
            <ArrowLeft aria-hidden="true" />
          </Button>

          {/* Slide indicators */}
          <div className="flex min-w-0 items-center gap-0.5">
            {slides.map((slide, index) => (
              <Button
                key={slide.title}
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-background hover:bg-background/15 hover:text-background"
                onClick={() => setActive(index)}
                aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
                aria-pressed={index === active}
              >
                <span
                  className={`h-1 rounded-full transition-all ${
                    index === active ? "w-4 bg-background" : "w-1.5 bg-background/60"
                  }`}
                />
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-background hover:bg-background/15 hover:text-background"
            onClick={showNext}
            aria-label="Next slide"
          >
            <ArrowRight aria-hidden="true" />
          </Button>

          {/* Automatic rotation control */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-background hover:bg-background/15 hover:text-background"
            onClick={() => setUserPaused((value) => !value)}
            aria-label={
              userPaused ? "Resume automatic slide rotation" : "Pause automatic slide rotation"
            }
            aria-pressed={userPaused}
          >
            {/* {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />} */}
          </Button>
        </div>
      </div>
    </section>
  );
}
