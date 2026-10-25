import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Star } from "lucide-react";
import { useState } from "react";
import { PageHero, MockForm, MockNotice, UploadField } from "@/components/shared";
import { reviews } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth";
export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — HairbyOma" },
      {
        name: "description",
        content:
          "Read mock HairbyOma customer reviews and preview the future review submission experience.",
      },
      { property: "og:title", content: "Customer Reviews — HairbyOma" },
      { property: "og:description", content: "HairbyOma customer stories and product reviews." },
    ],
  }),
  component: Page,
});
function Page() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  function writeReview() {
    if (!user) {
      navigate({ to: "/auth", search: { next: "/reviews" } });
      return;
    }
    setOpen(true);
  }
  return (
    <>
      <PageHero
        eyebrow="Client stories"
        title="Loved, worn, remembered."
        copy="Realistic frontend review presentation, ready for verified purchase data and moderation later."
      />
      <div className="site-container py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <MockNotice />
          <Button onClick={writeReview}>
            {user ? "Write a review" : "Sign in to write a review"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share your HairbyOma experience</DialogTitle>
              </DialogHeader>
              <MockForm kind="review">
                <label>
                  <span className="form-label">Name *</span>
                  <Input required />
                </label>
                <label>
                  <span className="form-label">Product *</span>
                  <Input required />
                </label>
                <label>
                  <span className="form-label">Rating *</span>
                  <select required className="h-10 w-full border bg-background px-3">
                    <option value="">Choose rating</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n}>{n} stars</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="form-label">Review *</span>
                  <Textarea required />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadField label="Hair photo" accept="image/*" />
                  <UploadField label="Video review" accept="video/*" />
                </div>
              </MockForm>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <article key={r.id} className="border p-5">
              <img
                src={r.image}
                alt={`${r.name}'s hair`}
                className="aspect-square w-full object-cover"
              />
              <div className="mt-4 flex gap-1 text-primary">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary" />
                ))}
              </div>
              <p className="mt-3 leading-7">“{r.text}”</p>
              <p className="mt-4 font-semibold">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.product}</p>
              {r.verified && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                  <BadgeCheck className="size-4" />
                  Verified purchase
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
