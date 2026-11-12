import { createFileRoute } from "@tanstack/react-router";
import { AddressManager } from "@/components/account/AddressManager";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({
    meta: [
      { title: "My Addresses - HairbyOma" },
      {
        name: "description",
        content: "Manage your saved delivery addresses.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="site-container py-10">
      <div className="mb-8">
        <p className="eyebrow">Delivery preferences</p>
        <h1 className="mt-2 text-3xl font-display">My Addresses</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add, edit and manage the addresses you use for your orders.
        </p>
      </div>

      <AddressManager />
    </div>
  );
}
