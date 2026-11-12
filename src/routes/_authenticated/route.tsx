import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { tokenStorage } from "@/lib/api";
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

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

  beforeLoad: ({ location }) => {
    if (!tokenStorage.get()) {
      throw redirect({
        to: "/auth",
        search: {
          next: location.href,
        },
      });
    }
  },

  component: AuthenticatedLayout,
});


