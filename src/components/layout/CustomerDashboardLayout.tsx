import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  LayoutDashboard,
  Heart,
  Gift,
  Share2,
  Cake,
  UserRound,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  ChevronRight,
  MapPin,
  Settings,
  Package,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { notificationService } from "@/services/notification.service";

const navigation = [
  { label: "Home", to: "/", icon: Home },
  { label: "Overview", to: "/account", icon: LayoutDashboard },
  { label: "My Orders", to: "/orders", icon: Package },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "My Wishlist", to: "/wishlist", icon: Heart },
  { label: "My Addresses", to: "/addresses", icon: MapPin },
  { label: "My Rewards", to: "/rewards", icon: Gift },
  { label: "Referrals", to: "/referrals", icon: Share2 },
  { label: "Birthday Club", to: "/birthday-club", icon: Cake },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let active = true;

    const loadUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        if (active) setUnreadCount(response.unreadCount);
      } catch {
        // Keep the existing count if the request temporarily fails.
      }
    };

    void loadUnreadCount();

    const interval = window.setInterval(() => {
      void loadUnreadCount();
    }, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user]);

  const handleSignOut = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut();
      await navigate({ to: "/auth" });
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join("")
    .toUpperCase();

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer";

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="hidden w-[260px] shrink-0 flex-col bg-primary text-white lg:flex">
        <Link to="/account" className="flex h-24 items-center border-b border-white/10 px-8">
          <div>
            <p className="font-display text-3xl tracking-wide">HairbyOma</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/55">
              Customer dashboard
            </p>
          </div>
        </Link>

        <div className="px-5 py-8">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Menu
          </p>

          <nav className="space-y-2">
            {navigation.map(({ label, to, icon: Icon }) => {
              const active = pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                    active
                      ? "bg-primary-foreground text-primary font-semibold"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1">{label}</span>
                  {label === "Notifications" && unreadCount > 0 && (
                    <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {active && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur md:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open dashboard menu"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 hover:bg-accent lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/account" className="font-display text-2xl text-primary lg:hidden">
              HairbyOma
            </Link>

            <div className="hidden lg:block">
              <p className="text-xs text-muted-foreground">Your personal space</p>
              <p className="text-sm font-semibold">Customer dashboard</p>
            </div>
          </div>

          <Link
            to="/account"
            className="flex items-center gap-3 rounded-full py-1 pl-2 pr-1 transition hover:bg-accent"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">My account</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
              {initials || <UserRound className="h-5 w-5" />}
            </div>
          </Link>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close dashboard menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/50"
            />

            <aside className="absolute inset-y-0 left-0 flex w-[285px] max-w-[85vw] flex-col bg-primary text-white shadow-xl">
              <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-2xl"
                >
                  HairbyOma
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2 p-5">
                {navigation.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                      pathname === to
                        ? "bg-white font-semibold text-primary"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1">{label}</span>
                    {label === "Notifications" && unreadCount > 0 && (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-white/10 p-5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="mx-auto w-full max-w-[1500px] p-5 md:p-8 lg:p-10">{children}</main>

        <footer className="border-t border-border bg-background px-5 py-6 text-center text-xs text-muted-foreground md:px-8">
          <div className="flex items-center justify-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>HairbyOma • Your beauty, your way.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
