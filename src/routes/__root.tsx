import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AuthProvider } from "@/context/auth";

function NotFound() {
  return (
    <div className="site-container py-24 text-center">
      <h1 className="text-6xl">404</h1>

      <p className="mt-4 text-muted-foreground">
        This page could not be found.
      </p>

      <Link
        to="/"
        className="mt-6 inline-block text-primary"
      >
        Return home
      </Link>
    </div>
  );
}

function ErrorView({
  error,
  reset,
}: import("@tanstack/react-router").ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("HairbyOma application error:", error);
  }, [error]);

  return (
    <div className="site-container py-24 text-center">
      <h1 className="text-4xl">This page didn't load</h1>

      <p className="mt-4 text-muted-foreground">
        Something went wrong. Please try again.
      </p>

      <button
        className="mt-5 text-primary"
        onClick={() => {
          router.invalidate();
          reset();
        }}
      >
        Try again
      </button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "HairbyOma — Luxury Hair in Nigeria",
      },
      {
        name: "description",
        content:
          "Discover luxury wigs, bundles and custom hair experiences from HairbyOma in Nigeria.",
      },
      { property: "og:type", content: "website" },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),

  shellComponent: Shell,
  component: Root,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function Shell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Root() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteLayout>
          <Outlet />
        </SiteLayout>
      </AuthProvider>
    </QueryClientProvider>
  );
}