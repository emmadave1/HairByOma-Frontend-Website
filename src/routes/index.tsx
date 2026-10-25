import { SaleSection } from "@/components/promotions/SaleSection";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReviewsSlider } from "@/components/home/ReviewsSlider";
import { HeroSlider } from "@/components/home/HeroSlider";
import { SectionTitle } from "@/components/shared";
import { categories, products } from "@/data/products";
import { reviews } from "@/data/content";
import hero from "@/assets/hairbyoma-hero.jpg";
import deep from "@/assets/deep-wave.jpg";
import bob from "@/assets/bob-wig.jpg";
import bounce from "@/assets/layered-bounce.jpg";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "HairbyOma | Premium Human Hair Wigs & Bundles in Nigeria",
      },
      {
        name: "description",
        content:
          "Shop premium human hair wigs, bundles and custom hair at HairbyOma. Discover beautiful textures, quality craftsmanship and personalised hair consultations in Port Harcourt, Nigeria.",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large",
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "HairbyOma",
      },
      {
        property: "og:title",
        content: "HairbyOma | Premium Human Hair Wigs & Bundles in Nigeria",
      },
      {
        property: "og:description",
        content:
          "Discover premium wigs, hair bundles and custom hair experiences at HairbyOma in Port Harcourt, Nigeria.",
      },
      {
        property: "og:url",
        content: "https://hairbyoma.com/",
      },
      {
        property: "og:image",
        content: "https://hairbyoma.com/og-image.jpg",
      },
      {
        property: "og:image:alt",
        content: "HairbyOma premium human hair wigs and bundles",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "HairbyOma | Premium Human Hair Wigs & Bundles in Nigeria",
      },
      {
        name: "twitter:description",
        content:
          "Shop premium wigs, bundles and custom hair from HairbyOma in Port Harcourt, Nigeria.",
      },
      {
        name: "twitter:image",
        content: "https://hairbyoma.com/og-image.jpg",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://hairbyoma.com/",
      },
    ],
  }),
  component: Home,
});

const benefitIcons: Array<[LucideIcon, string]> = [
  [Sparkles, "Shine"],
  [ShieldCheck, "Thickness"],
  [Truck, "Careful delivery"],
];
const catImages = [hero, bounce, deep, bounce, hero, deep, bob, bob, bounce];
function Home() {
  return (
    <>
    <OrganizationSchema />

      <section className="site-container py-4 md:py-7">
        <div className="hero-shell">
          <div className="hero-parallax absolute inset-0" data-parallax>
            <HeroSlider />
          </div>
          <div className="hero-overlay" />
          <div className="relative z-10 flex min-h-[74svh] max-w-2xl flex-col justify-end px-5 py-10 text-background md:min-h-[76vh] md:px-12 md:py-16">
            <p className="eyebrow text-background/80">HairbyOma · Port Harcourt</p>
            <h1 className="mt-3 text-5xl leading-[1.02] md:text-7xl">
              {" "}
              Premium Human Hair Wigs <br /> Timeless Beauty.{" "}
            </h1>
            <p className="mt-5 max-w-lg text-base text-background/85 md:text-lg">
              Discover premium human hair wigs, bundles and custom hairstyles crafted for beautiful
              movement, lasting quality and effortless confidence. Shop HairbyOma in Port Harcourt,
              Nigeria.
            </p>
            <div className="mt-7 flex flex-w4rap gap-3">
              <Button magnetic asChild size="lg">
                <Link to="/shop">
                  Shop now <ArrowRight />
                </Link>
              </Button>
              <Button magnetic asChild size="lg" variant="secondary">
                <a href="https://wa.me/2348102968799" target="_blank" rel="noreferrer">
                  <MessageCircle />
                  Chat with HairbyOma
                </a>
              </Button>
              <Button asChild size="lg" variant="outlineOnDark">
                <Link to="/appointment">
                  <CalendarDays />
                  Book appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <SaleSection />
      <section className="site-container py-16">
        <SectionTitle
          eyebrow="Curated for every look"
          title="Shop by category"
          copy="From sleek signatures to expressive curls, find the finish that feels most like you."
        />
        <div className="category-rail">
          {categories.map((c, i) => (
            <Link key={c} to="/shop" search={{ category: c }} className="category-card group">
              <img
                src={catImages[i]}
                alt=""
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-foreground/75 p-3 font-display text-sm text-background backdrop-blur sm:text-lg">
                {c}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-muted/55 py-16">
        <div className="site-container">
          <SectionTitle
            eyebrow="Loved most"
            title="HairbyOma best sellers"
            action={
              <Button asChild variant="outline">
                <Link to="/shop">View all</Link>
              </Button>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="site-container grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
        <div className="grid grid-cols-2 gap-3">
          <img
            src={deep}
            alt="Deep wave hair bundles"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <img
            src={bounce}
            alt="Layered bounce wig"
            loading="lazy"
            data-reveal
            className="mt-10 aspect-[4/5] w-full object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">See the bounce. Feel the quality.</p>
          <h2 className="mt-3 text-4xl md:text-6xl">Movement made to be noticed.</h2>
          <p className="mt-5 text-muted-foreground">
            Explore lightweight previews for shine, volume, curl definition and natural movement.
            Official HairbyOma videos can replace these centrally when supplied.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {benefitIcons.map(([I, t]) => (
              <div key={String(t)} className="border p-4">
                <I className="text-primary" />
                <p className="mt-3 font-medium">{t as string}</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-7">
            <Link to="/gallery">
              Explore the gallery <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <section className="bg-secondary/45 py-16">
        <div className="site-container">
          <SectionTitle eyebrow="Client love" title="Beautiful hair, beautifully remembered" />
          <ReviewsSlider reviews={reviews} />
        </div>
      </section>
    </>
  );
}
