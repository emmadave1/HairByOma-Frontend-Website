import { createFileRoute, Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthSearch = {
  next?: string;
};

const safeNext = (value?: string) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : "/account";

export const Route = createFileRoute("/auth")({
  ssr: false,

  validateSearch: (search: Record<string, unknown>): AuthSearch =>
    typeof search["next"] === "string" ? { next: search["next"] } : {},

  head: () => ({
    meta: [
      { title: "Sign in — HairbyOma" },
      {
        name: "description",
        content: "Sign-in functionality will be available when HairbyOma authentication is ready.",
      },
    ],
  }),

  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const destination = safeNext(next);

  return (
    <div className="site-container py-14 md:py-20">
      <div className="mx-auto max-w-md border bg-background p-6 text-center shadow-sm md:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary">
          <LockKeyhole className="text-primary" />
        </span>

        <h1 className="mt-5 text-4xl">Account Access</h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We're preparing a secure account experience for HairbyOma. Sign-in, registration, and
          Google authentication are temporarily unavailable while we build our own authentication
          system.
        </p>

        {destination.startsWith("/checkout") && (
          <p className="mt-5 rounded-md bg-secondary p-3 text-sm">
            Your cart is saved in this browser. Account-based checkout will be available when
            authentication is ready.
          </p>
        )}

        <Button asChild className="mt-7 w-full" size="lg">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
