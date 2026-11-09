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

function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function BookingPage() {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const [service, setService] = useState<string>(services[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState("");

  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();

  const leading = firstDay.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(cursor.getFullYear(), cursor.getMonth(), index + 1),
    ),
  ];

  const selectedService = services.find((item) => item.id === service)!;

  const phoneValid = isValidPhone(phone);
  const phoneHasValue = Boolean(phone.trim());

  const ready = Boolean(date && time && name.trim() && phoneValid && !sent);

  const prettyDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  function changeMonth(direction: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1));
  }

  function selectDate(value: string) {
    setDate(value);
    setTime("");
    setFeedback("");
  }

  function confirm() {
    if (!ready) return;

    const message = [
      "Hello HairbyOma, I would like to book an appointment.",
      "",
      `Service: ${selectedService.name} (${selectedService.duration})`,
      `Date: ${prettyDate}`,
      `Time: ${time}`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappNumber = siteConfig.whatsappNumber.replace(/\D/g, "");

    if (!whatsappNumber) {
      setFeedback("WhatsApp booking is currently unavailable. Please contact us directly.");
      return;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const popup = window.open(whatsappUrl, "_blank");

    if (!popup) {
      setFeedback("Your browser blocked the WhatsApp window. Please allow pop-ups and try again.");
      return;
    }

    popup.opener = null;
    setSent(true);
    setFeedback("");
  }

  function bookAnother() {
    setSent(false);
    setFeedback("");
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setNotes("");
    setService(services[0].id);

    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <>
      <PageHero
        eyebrow="Personal consultation"
        title="Book an appointment"
        copy="Choose your service, pick a date and time, and send your booking request to HairbyOma."
      />

      <div className="site-container grid gap-8 py-14 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="min-w-0 space-y-8">
          {/* Service selection */}
          <section>
            <h2 className="text-2xl">1. Choose your service</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setService(item.id)}
                  aria-pressed={service === item.id}
                  className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border p-4 text-left transition hover:border-primary ${
                    service === item.id ? "border-primary bg-secondary/40" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium">
                      <Scissors className="size-4 shrink-0 text-primary" />
                      <span>{item.name}</span>
                    </span>

                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.duration}
                    </span>
                  </span>

                  {service === item.id && <Check className="size-5 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          </section>

          {/* Date selection */}
          <section>
            <h2 className="text-2xl">2. Pick a date</h2>

            <div className="mt-4 rounded-xl border p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                  disabled={cursor <= new Date(today.getFullYear(), today.getMonth(), 1)}
                >
                  <ChevronLeft />
                </Button>

                <strong className="min-w-0 truncate text-center font-display text-base sm:text-lg">
                  {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
                </strong>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight />
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground sm:gap-1 sm:text-xs">
                {dayNames.map((day) => (
                  <span key={day} className="py-1">
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
                {cells.map((day, index) => {
                  if (!day) {
                    return <span key={`empty-${index}`} />;
                  }

                  const value = iso(day);
                  const past = day < today;
                  const sunday = day.getDay() === 0;
                  const disabled = past || sunday;
                  const selected = date === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDate(value)}
                      aria-label={day.toDateString()}
                      aria-pressed={selected}
                      className={`grid h-10 min-w-0 place-items-center rounded-lg text-xs transition sm:h-11 sm:text-sm ${
                        disabled
                          ? "cursor-not-allowed text-muted-foreground/40"
                          : selected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary/60"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">Studio closed on Sundays.</p>
            </div>
          </section>

          {/* Time selection */}
          <section>
            <h2 className="text-2xl">3. Pick a time</h2>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  disabled={!date}
                  onClick={() => {
                    setTime(slot);
                    setFeedback("");
                  }}
                  aria-pressed={time === slot}
                  className={`rounded-lg border py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    time === slot
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {!date && (
              <p className="mt-3 text-xs text-muted-foreground">
                Select a date to choose your preferred time.
              </p>
            )}

            {date && (
              <p className="mt-3 text-xs text-muted-foreground">
                These are requested appointment times. HairbyOma will confirm availability through
                WhatsApp.
              </p>
            )}
          </section>

          {/* Customer details */}
          <section>
            <h2 className="text-2xl">4. Your details</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="min-w-0">
                <span className="form-label">Full name *</span>

                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="min-w-0">
                <span className="form-label">Phone / WhatsApp *</span>

                <Input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setFeedback("");
                  }}
                  type="tel"
                  placeholder="+234..."
                  autoComplete="tel"
                  maxLength={20}
                  required
                  aria-invalid={phoneHasValue && !phoneValid}
                />

                {phoneHasValue && !phoneValid && (
                  <span className="mt-1 block text-xs text-destructive">
                    Enter a valid phone number.
                  </span>
                )}
              </label>
            </div>

            <label className="mt-4 block">
              <span className="form-label">Anything we should know?</span>

              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Hair length, colour, occasion..."
              />
            </label>
          </section>
        </div>

        {/* Appointment summary */}
        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="rounded-xl border p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-2xl">Your appointment</h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Scissors className="mt-0.5 size-4 shrink-0 text-primary" />

                <span>
                  {selectedService.name} · {selectedService.duration}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />

                <span>{prettyDate || "No date selected yet"}</span>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />

                <span>{time || "No time selected yet"}</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />

                <span>{siteConfig.location}</span>
              </div>
            </dl>

            {feedback && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {feedback}
              </div>
            )}

            {sent ? (
              <div className="mt-6 rounded-lg border border-primary/25 bg-secondary/40 p-4 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check />
                </span>

                <p className="mt-3 text-sm font-medium">Your booking request is ready!</p>

                <p className="mt-2 text-sm text-muted-foreground">
                  WhatsApp has been opened with your appointment details. Please send the message
                  and wait for HairbyOma to confirm your appointment.
                </p>

                <Button type="button" variant="outline" className="mt-4" onClick={bookAnother}>
                  Book another
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={!ready}
                  onClick={confirm}
                >
                  <MessageCircle />
                  Send booking request
                </Button>

                <p className="mt-3 text-xs text-muted-foreground">
                  Your appointment details will be sent to HairbyOma on WhatsApp ({siteConfig.phone}
                  ). Your appointment is not confirmed until HairbyOma responds.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
