import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,

  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/auth",
      search: {
        next: location.href,
      },
    });
  },

  component: () => <Outlet />,
});
