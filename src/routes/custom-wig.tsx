import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHero, UploadField } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/data/config";
export const Route = createFileRoute("/custom-wig")({
  head: () => ({
    meta: [
      { title: "Custom Wig Request — HairbyOma" },
      {
        name: "description",
        content:
          "Send a personalized HairbyOma wig request with your preferred texture, length, density and colour directly via WhatsApp.",
      },
      { property: "og:title", content: "Custom Wig Request — HairbyOma" },
      {
        property: "og:description",
        content: "Design your ideal HairbyOma custom wig and send it via WhatsApp.",
      },
    ],
  }),
  component: Page,
});
const options = {
  "Hair texture": ["Bone Straight", "Deep Wave", "Layered Bounce", "Pixie Curl"],
  Length: ["10 inches", "14 inches", "18 inches", "22 inches", "26 inches", "30 inches"],
  Density: ["180%", "200%", "250%"],
  "Closure / Frontal": ["5×5 closure", "6×6 closure", "13×4 frontal"],
  "Cap size": ["Small", "Medium", "Large"],
  Colour: ["Natural black", "Jet black", "Brown", "Custom colour"],
  Style: ["Straight", "Layered", "Middle part", "Side part"],
};
function Page() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) || "—");
    const lines = [
      "Hello HairbyOma! I would like a custom wig.",
      "",
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone")}`,
      `Quantity: ${get("quantity")}`,
      "",
      ...Object.keys(options).map((k) => `${k}: ${get(k)}`),
      "",
      `Special requirements: ${get("notes")}`,
    ];
    const url = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.setTimeout(() => {
      window.open(url, "_blank", "noopener");
      setSending(false);
      setSent(true);
    }, 400);
  }
  return (
    <>
      <PageHero
        eyebrow="Made for you"
        title="Create your custom wig"
        copy="Share every detail of your desired unit and send it straight to HairbyOma on WhatsApp."
      />
      <div className="site-container grid gap-10 py-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl">Your vision, beautifully considered.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Complete the form and it will open WhatsApp with your request ready to send to HairbyOma
            at {siteConfig.phone}. Reference photos and videos can be attached in the WhatsApp chat.
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-secondary/45 p-4 text-sm text-muted-foreground">
            <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Prefer to chat first?{" "}
              <a
                className="font-medium text-primary underline"
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                Message us directly on WhatsApp
              </a>
              .
            </span>
          </div>
        </div>
        {sent ? (
          <div className="rounded-lg border border-primary/25 bg-secondary/30 p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Send />
            </span>
            <h2 className="mt-4 text-2xl">Your request is ready in WhatsApp.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              WhatsApp should have opened with your details pre-filled. Just press send there to
              reach HairbyOma.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button type="button" variant="outline" onClick={() => setSent(false)}>
                Prepare another
              </Button>
              <Button asChild>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle />
                  Open WhatsApp
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="name" label="Full name" type="text" />
              <Field name="email" label="Email" type="email" />
              <Field name="phone" label="Phone" type="tel" />
              <Field name="quantity" label="Quantity" type="number" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {Object.entries(options).map(([label, items]) => (
                <label key={label}>
                  <span className="form-label">{label} *</span>
                  <select
                    name={label}
                    required
                    className="h-10 w-full rounded-md border bg-background px-3"
                  >
                    <option value="">Select {label.toLowerCase()}</option>
                    {items.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label>
              <span className="form-label">Special requirements</span>
              <Textarea
                name="notes"
                rows={5}
                placeholder="Tell us about the finish, parting, styling or occasion…"
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <UploadField label="Reference image" accept="image/*" />
              <UploadField label="Reference video" accept="video/*" />
            </div>
            <p className="text-xs text-muted-foreground">
              Files stay on your device — attach them in the WhatsApp chat after sending.
            </p>
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Opening WhatsApp…
                </>
              ) : (
                <>
                  <MessageCircle />
                  Send request via WhatsApp
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
function Field({ label, type, name }: { label: string; type: string; name: string }) {
  return (
    <label>
      <span className="form-label">{label} *</span>
      <Input name={name} required type={type} min={type === "number" ? 1 : undefined} />
    </label>
  );
}
