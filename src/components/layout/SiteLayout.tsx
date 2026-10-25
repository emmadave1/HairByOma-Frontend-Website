import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
  Instagram,
  Phone,
  MapPin,
  CalendarDays,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { StoreProvider, useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import { siteConfig } from "@/data/config";
import {
  AnimatedNumber,
  CartFeedback,
  StorefrontMotion,
} from "@/components/motion/StorefrontMotion";
const nav = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Custom Wig", "/custom-wig"],
  ["Book Appointment", "/appointment"],
  ["Gallery", "/gallery"],
  ["Reviews", "/reviews"],
  ["About", "/about"],
  ["How to Order", "/how-to-order"],
  ["Contact", "/contact"],
] as const;
function Chrome({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pageKey = useRouterState({ select: (s) => s.location.pathname });
  const { cartCount, wishlist } = useStore();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/auth", replace: true });
  }
  return (
    <>
      {/* <div className="bg-foreground px-4 py-2 text-center text-xs font-medium text-background">
        Complimentary consultation on every luxury hair selection · Frontend preview
      </div> */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="site-container flex h-18 items-center justify-between gap-3">
          <Link to="/" className="shrink-0">
            <img
              src="/logo.png"
              alt="HairbyOma Luxury Hair Studio"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <nav className="hidden items-center gap-5 xl:flex">
            {nav.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                activeProps={{ className: "text-primary" }}
                className="text-sm font-medium transition hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Link to="/shop" search={{ q: "" }} aria-label="Search">
                <Search />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              {user ? (
                <Link
                  to="/wishlist"
                  aria-label={`Wishlist with ${wishlist.length} items`}
                  className="relative"
                >
                  <Heart />
                  <Count n={wishlist.length} />
                </Link>
              ) : (
                <Link
                  to="/auth"
                  search={{ next: "/wishlist" }}
                  aria-label="Sign in to view wishlist"
                >
                  <Heart />
                </Link>
              )}
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link to="/cart" aria-label={`Cart with ${cartCount} items`} className="relative">
                <ShoppingCart />
                <Count key={cartCount} n={cartCount} />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              {user ? (
                <Link to="/account" aria-label="Customer account">
                  <UserRound />
                </Link>
              ) : (
                <Link to="/auth" search={{ next: "/account" }} aria-label="Sign in">
                  <UserRound />
                </Link>
              )}
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={() => void handleSignOut()}
                aria-label="Sign out"
              >
                <LogOut />
              </Button>
            )}
            <Button asChild variant="outline" className="hidden lg:inline-flex">
              <Link to="/appointment">
                <CalendarDays />
                Book
              </Link>
            </Button>
            <Button asChild className="hidden lg:inline-flex">
              <Link to="/shop">
                <ShoppingCart />
                Shop now
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Open navigation"
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="site-container grid gap-1 border-t py-4 xl:hidden">
            {nav.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                >
                  My account
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    void handleSignOut();
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                search={{ next: "/account" }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              >
                Sign in
              </Link>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <Link to="/appointment">
                  <CalendarDays />
                  Appointment
                </Link>
              </Button>
              <Button asChild>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle />
                  WhatsApp
                </a>
              </Button>
            </div>
          </nav>
        )}
      </header>
      <main>
        <StorefrontMotion pageKey={pageKey}>{children}</StorefrontMotion>
      </main>
      <CartFeedback />
      <Footer />
      <a
        href={`https://wa.me/${siteConfig.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-float"
        aria-label="Chat with HairbyOma on WhatsApp"
      >
        <MessageCircle className="size-6" />
        <span className="sr-only">WhatsApp</span>
      </a>
    </>
  );
}
function Count({ n }: { n: number }) {
  return n ? (
    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground cart-count">
      <AnimatedNumber value={n} />
    </span>
  ) : null;
}
function Footer() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="site-container grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl">HairbyOma</p>
          <p className="mt-3 text-sm text-background/70">
            Luxury Hair. Timeless Beauty. Carefully considered hair experiences from Port Harcourt.
          </p>
        </div>
        <FooterLinks
          title="Discover"
          links={[
            ["Shop", "/shop"],
            ["Gallery", "/gallery"],
            ["About", "/about"],
            ["Length & colour guide", "/guides"],
          ]}
        />
        <FooterLinks
          title="Customer care"
          links={[
            ["How to order", "/how-to-order"],
            ["Delivery", "/delivery"],
            ["Policies", "/policies"],
            ["FAQ", "/faq"],
          ]}
        />
        <div>
          <h3 className="font-display text-xl">Visit & connect</h3>
          <p className="mt-4 flex gap-2 text-sm text-background/70">
            <MapPin className="size-4 shrink-0" />
            {siteConfig.location}
          </p>
          <p className="mt-3 flex gap-2 text-sm text-background/70">
            <Phone className="size-4" />
            {siteConfig.phone}
          </p>
          <p className="mt-3 flex gap-2 text-sm text-background/70">
            <Instagram className="size-4" />
            {siteConfig.instagram}
          </p>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="site-container flex flex-wrap justify-between gap-3 py-5 text-xs text-background/60">
          <span>© 2026 HairbyOma.</span>
          <Link to="/admin">Admin UI preview</Link>
        </div>
      </div>
    </footer>
  );
}
function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <h3 className="font-display text-xl">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map(([l, t]) => (
          <Link
            key={t}
            to={t as never}
            className="text-sm text-background/70 hover:text-background"
          >
            {l}
          </Link>
        ))}
      </div>
    </div>
  );
}
export function SiteLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pending = useRouterState({ select: (s) => s.status === "pending" });
  useEffect(() => {
    let disposed = false;
    const min = new Promise<void>((resolve) => setTimeout(resolve, 650));
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    Promise.race([
      Promise.all([min, loaded]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]).then(() => {
      if (!disposed) setLoading(false);
    });
    return () => {
      disposed = true;
    };
  }, []);
  return (
    <StoreProvider>
      {loading && (
        <div className="preloader" role="status" aria-label="Loading HairbyOma">
          <div className="text-center">
            <div className="loader-ring mx-auto" />
            <p className="mt-6 font-display text-3xl text-primary">HairbyOma</p>
            <span className="sr-only">Loading</span>
          </div>
        </div>
      )}
      {!loading && pending && (
        <div className="route-loading" role="status" aria-label="Loading page">
          <div className="loader-ring loader-ring-small" />
        </div>
      )}
      <Chrome>{children}</Chrome>
    </StoreProvider>
  );
}
