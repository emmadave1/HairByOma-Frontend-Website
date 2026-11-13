import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { CustomerDashboardLayout } from "@/components/layout/CustomerDashboardLayout";

const dashboardRoutes = [
  "/account",
  "/orders",
  "/rewards",
  "/referrals",
  "/birthday-club",
  "/wishlist",
  "/annual-challenge",
  "/addresses",
  "/settings",
  "/notifications",
];

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const currentHref = useRouterState({
    select: (state) => state.location.href,
  });

  useEffect(() => {
    if (!loading && !user) {
      void navigate({
        to: "/auth",
        search: {
          next: currentHref,
        },
      });
    }
  }, [loading, user, currentHref, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking your session...
        </p>
      </div>
    );
  }

  const isDashboardRoute = dashboardRoutes.includes(pathname);

  return isDashboardRoute ? (
    <CustomerDashboardLayout>
      <Outlet />
    </CustomerDashboardLayout>
  ) : (
    <Outlet />
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});