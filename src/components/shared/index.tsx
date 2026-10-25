import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Info, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow?: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-hero">
      <div className="site-container py-14 text-center md:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 text-4xl md:text-6xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">{copy}</p>
      </div>
    </section>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-3xl md:text-5xl">{title}</h2>
        {copy && <p className="mt-3 max-w-2xl text-muted-foreground">{copy}</p>}
      </div>
      {action}
    </div>
  );
}
export function MockNotice({
  children = "Preview only — values and actions use local mock data until backend integration.",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-2 rounded-lg border border-primary/20 bg-secondary/45 p-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}
export function EmptyState({
  title,
  copy,
  to = "/shop",
}: {
  title: string;
  copy: string;
  to?: "/shop" | "/";
}) {
  return (
    <div className="py-20 text-center">
      <h2 className="text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{copy}</p>
      <Button asChild className="mt-6">
        <Link to={to}>
          Explore the collection <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
export function ProgressMeter({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
export function UploadField({ label, accept }: { label: string; accept: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  return (
    <div>
      <span className="form-label">{label}</span>
      {name ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="truncate text-sm">{name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setName("");
              if (ref.current) ref.current.value = "";
            }}
            aria-label={`Remove ${label}`}
          >
            <X />
          </Button>
        </div>
      ) : (
        <button type="button" className="upload-field" onClick={() => ref.current?.click()}>
          <UploadCloud className="size-5" />
          <span>Choose file</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => setName(e.target.files?.[0]?.name || "")}
      />
    </div>
  );
}
export function MockForm({ kind = "request", children }: { kind?: string; children?: ReactNode }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    window.setTimeout(() => setState("done"), 650);
  }
  if (state === "done")
    return (
      <div className="rounded-lg border border-primary/25 bg-secondary/30 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check />
        </span>
        <h2 className="mt-4 text-2xl">Your {kind} has been prepared successfully.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing was sent. A backend service can be connected to this submission point later.
        </p>
        <Button type="button" variant="outline" className="mt-5" onClick={() => setState("idle")}>
          Prepare another
        </Button>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      {children}
      <Button type="submit" size="lg" className="w-full" disabled={state === "loading"}>
        {state === "loading" ? (
          <>
            <LoaderCircle className="animate-spin" />
            Preparing…
          </>
        ) : (
          "Prepare request"
        )}
      </Button>
    </form>
  );
}
export function BasicContactFields() {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="form-label">Full name *</span>
          <Input required placeholder="Your full name" />
        </label>
        <label>
          <span className="form-label">Email *</span>
          <Input required type="email" placeholder="you@example.com" />
        </label>
      </div>
      <label>
        <span className="form-label">Phone *</span>
        <Input required type="tel" placeholder="+234…" />
      </label>
      <label>
        <span className="form-label">Message *</span>
        <Textarea required rows={5} placeholder="How can we help?" />
      </label>
    </>
  );
}
