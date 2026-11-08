import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tokenStorage } from "@/lib/api";

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

  component: () => <Outlet />,
});
