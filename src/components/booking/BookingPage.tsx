import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Scissors,
} from "lucide-react";
import { PageHero } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/data/config";

const services = [
  { id: "consultation", name: "Hair consultation", duration: "30 min" },
  { id: "custom-wig", name: "Custom wig fitting", duration: "60 min" },
  { id: "install", name: "Wig install & styling", duration: "90 min" },
  { id: "revamp", name: "Wig revamp & maintenance", duration: "120 min" },
] as const;

const slots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] as const;

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function BookingPage() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [service, setService] = useState<string>(services[0].id);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = firstDay.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
    ),
  ];

  const selectedService = services.find((s) => s.id === service)!;
  const ready = Boolean(date && time && name.trim() && phone.trim());
  const prettyDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  function confirm() {
    const message = [
      "Hello HairbyOma, I would like to book an appointment.",
      "",
      `Service: ${selectedService.name} (${selectedService.duration})`,
      `Date: ${prettyDate}`,
      `Time: ${time}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
    setSent(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Personal consultation"
        title="Book an appointment"
        copy="Choose your service, pick a date and time, and confirm your booking with HairbyOma in seconds."
      />
      <div className="site-container grid gap-8 py-14 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl">1. Choose your service</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setService(s.id)}
                  aria-pressed={service === s.id}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition hover:border-primary ${service === s.id ? "border-primary bg-secondary/40" : ""}`}
                >
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Scissors className="size-4 text-primary" />
                      {s.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{s.duration}</span>
                  </span>
                  {service === s.id && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl">2. Pick a date</h2>
            <div className="mt-4 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() =>
                    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
                  }
                  disabled={cursor <= new Date(today.getFullYear(), today.getMonth(), 1)}
                >
                  <ChevronLeft />
                </Button>
                <strong className="font-display text-lg">
                  {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
                </strong>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Next month"
                  onClick={() =>
                    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
                  }
                >
                  <ChevronRight />
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wider text-muted-foreground">
                {dayNames.map((d) => (
                  <span key={d} className="py-1">
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (!d) return <span key={`empty-${i}`} />;
                  const value = iso(d);
                  const past = d < today;
                  const sunday = d.getDay() === 0;
                  const disabled = past || sunday;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setDate(value);
                        setTime("");
                      }}
                      aria-label={d.toDateString()}
                      aria-pressed={date === value}
                      className={`grid h-11 place-items-center rounded-lg text-sm transition ${
                        disabled
                          ? "cursor-not-allowed text-muted-foreground/40"
                          : date === value
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary/60"
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Studio closed on Sundays.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl">3. Pick a time</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={!date}
                  onClick={() => setTime(s)}
                  aria-pressed={time === s}
                  className={`rounded-lg border py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${time === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {!date && (
              <p className="mt-3 text-xs text-muted-foreground">
                Select a date to see available times.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-2xl">4. Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="form-label">Full name *</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </label>
              <label>
                <span className="form-label">Phone / WhatsApp *</span>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="+234…"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="form-label">Anything we should know?</span>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Hair length, colour, occasion…"
              />
            </label>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-xl border p-6 shadow-sm">
            <h2 className="font-display text-2xl">Your appointment</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <Scissors className="size-4 shrink-0 text-primary" />
                <span>
                  {selectedService.name} · {selectedService.duration}
                </span>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="size-4 shrink-0 text-primary" />
                <span>{prettyDate || "No date selected yet"}</span>
              </div>
              <div className="flex gap-3">
                <Clock className="size-4 shrink-0 text-primary" />
                <span>{time || "No time selected yet"}</span>
              </div>
              <div className="flex gap-3">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span>{siteConfig.location}</span>
              </div>
            </dl>
            {sent ? (
              <div className="mt-6 rounded-lg border border-primary/25 bg-secondary/40 p-4 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check />
                </span>
                <p className="mt-3 text-sm">
                  Your booking request was opened in WhatsApp. Send the message to confirm with
                  HairbyOma.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>
                  Book another
                </Button>
              </div>
            ) : (
              <>
                <Button size="lg" className="mt-6 w-full" disabled={!ready} onClick={confirm}>
                  <MessageCircle />
                  Confirm booking
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Your booking is sent straight to HairbyOma on WhatsApp ({siteConfig.phone}) for
                  confirmation.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
