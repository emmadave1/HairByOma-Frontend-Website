import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Sparkles,
  Target,
  Truck,
} from "lucide-react";
import { PageHero, SectionTitle, MockForm, BasicContactFields, MockNotice } from ".";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/content";
import { siteConfig } from "@/data/config";
import hero from "@/assets/hairbyoma-hero.jpg";
import bounce from "@/assets/layered-bounce.jpg";
export function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Mission",
      copy: "To pair luxurious hair with thoughtful, honest guidance.",
    },
    {
      icon: Sparkles,
      title: "Vision",
      copy: "To be a trusted name for timeless hair experiences in Nigeria.",
    },
    { icon: HeartHandshake, title: "Values", copy: "Quality, care, confidence and consistency." },
    {
      icon: CheckCircle2,
      title: "Commitment",
      copy: "Beautiful presentation and attentive customer care.",
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="About HairbyOma"
        copy="A luxury hair experience shaped by quality, confidence and attentive service."
      />
      <div className="site-container grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <img
          src={hero}
          alt="HairbyOma luxury hair portrait"
          className="aspect-[4/5] w-full object-cover"
        />
        <div>
          <SectionTitle eyebrow="Beauty with intention" title="Hair that feels like you." />
          <p className="leading-8 text-muted-foreground">
            HairbyOma exists to make exceptional hair feel personal. Every texture, finish and
            consultation is considered with the woman wearing it in mind.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="border p-5">
                <Icon className="text-primary" />
                <h3 className="mt-3 text-xl">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export function HowToOrderPage() {
  const steps = [
    "Choose your hair.",
    "Select your preferred length and options.",
    "Add to cart.",
    "Enter your delivery details.",
    "Make payment.",
    "Receive your order confirmation.",
    "Your hair is processed and delivered.",
  ];
  return (
    <>
      <PageHero
        eyebrow="Simple by design"
        title="How to order"
        copy="From discovery to delivery in seven clear steps."
      />
      <div className="site-container py-14">
        <div className="mx-auto max-w-3xl">
          {steps.map((s, i) => (
            <div key={s} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b py-6">
              <span className="font-display text-3xl text-primary">0{i + 1}</span>
              <div>
                <h2 className="text-2xl">{s}</h2>
                {i === 4 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Payment UI is a placeholder until secure processing is connected.
                  </p>
                )}
              </div>
            </div>
          ))}
          <div className="mt-10 bg-secondary/45 p-7 text-center">
            <h2 className="text-3xl">Prefer to order through WhatsApp?</h2>
            <Button asChild className="mt-5">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle />
                Chat with HairbyOma
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
export function DeliveryPage() {
  return (
    <>
      <PageHero
        eyebrow="From us to you"
        title="Delivery & pickup"
        copy="Clear local options and replaceable nationwide delivery details."
      />
      <div className="site-container grid gap-6 py-14 md:grid-cols-2">
        <article className="border p-7">
          <MapPin className="text-primary" />
          <h2 className="mt-4 text-3xl">Port Harcourt orders</h2>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>Studio pickup option</li>
            <li>Local dispatch option</li>
            <li>
              Delivery fee: <strong className="text-foreground">₦4,000</strong>
            </li>
            <li>Exact location is required before dispatch.</li>
          </ul>
        </article>
        <article className="border p-7">
          <Truck className="text-primary" />
          <h2 className="mt-4 text-3xl">Nationwide delivery</h2>
          <ul className="mt-5 space-y-3 text-muted-foreground">
            <li>Timeframe: Awaiting client confirmation</li>
            <li>Dispatch fee: Calculated after final delivery schedule</li>
            <li>Tracking: Details supplied after dispatch</li>
          </ul>
        </article>
        <div className="md:col-span-2">
          <MockNotice>
            Nationwide timing, fees and tracking wording are editable placeholders, not confirmed
            delivery terms.
          </MockNotice>
        </div>
      </div>
    </>
  );
}
export function PoliciesPage() {
  const items = [
    [
      "Payment Policy",
      "Client-approved policy text has not yet been supplied. Insert the exact final payment policy here before launch.",
    ],
    [
      "Installment Payment Policy",
      "Awaiting the client’s exact installment terms and payment schedule.",
    ],
    [
      "Delivery Policy",
      "Port Harcourt delivery is currently shown as ₦4,000. Remaining official terms are pending.",
    ],
    ["Refund Policy", "Awaiting exact client-approved refund policy text."],
    ["Exchange Policy", "Awaiting exact client-approved exchange policy text."],
    ["Order Cancellation Policy", "Awaiting exact client-approved cancellation policy text."],
    ["Custom Order Policy", "Awaiting exact client-approved custom order policy text."],
    [
      "Important Notice",
      "These are visible editorial placeholders and must not be treated as official HairbyOma policy terms.",
    ],
  ];
  return (
    <>
      <PageHero
        eyebrow="Customer care"
        title="Policies"
        copy="A clear home for HairbyOma’s approved customer policies."
      />
      <div className="site-container py-14">
        <MockNotice>
          The client’s exact policy content was not included. Meaning cannot be preserved until that
          text is supplied.
        </MockNotice>
        <Accordion type="single" collapsible className="mx-auto mt-8 max-w-3xl">
          {items.map(([q, a], i) => (
            <AccordionItem key={q} value={String(i)}>
              <AccordionTrigger className="text-base">{q}</AccordionTrigger>
              <AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
export function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Questions, answered"
        title="Frequently asked questions"
        copy="Everything customers need to know before choosing their hair."
      />
      <div className="site-container py-14">
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={String(i)}>
              <AccordionTrigger className="text-base">{q}</AccordionTrigger>
              <AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
export function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="We’re here"
        title="Contact HairbyOma"
        copy="Ask a question, arrange a consultation or plan your visit."
      />
      <div className="site-container grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl">Let’s talk hair.</h2>
          <div className="mt-6 space-y-4 text-sm">
            <p className="flex gap-3">
              <MessageCircle className="text-primary" />
              WhatsApp: {siteConfig.phone}
            </p>
            <p className="flex gap-3">
              <Phone className="text-primary" />
              {siteConfig.phone}
            </p>
            <p className="flex gap-3">
              <MapPin className="text-primary" />
              {siteConfig.location}
            </p>
            <p className="flex gap-3">
              <Clock className="text-primary" />
              Business hours: Awaiting client confirmation
            </p>
          </div>
          <div className="mt-8 grid aspect-video place-items-center bg-muted text-center text-muted-foreground">
            <MapPin />
            <span>Map location placeholder</span>
          </div>
        </div>
        <div>
          <MockForm kind="message">
            <BasicContactFields />
          </MockForm>
        </div>
      </div>
    </>
  );
}
export function GuidesPage() {
  const lengths = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
  return (
    <>
      <PageHero
        eyebrow="Choose with confidence"
        title="Length & colour guide"
        copy="Visual placeholders designed for easy replacement with official HairbyOma charts."
      />
      <div className="site-container py-14">
        <SectionTitle
          title="Hair length guide"
          copy="Appearance varies depending on texture, curl pattern, styling and your height."
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
          {lengths.map((n, i) => (
            <div
              key={n}
              className="flex flex-col items-center justify-end bg-muted p-3"
              style={{ height: `${120 + i * 12}px` }}
            >
              <span
                className="mb-2 w-1 rounded-full bg-primary"
                style={{ height: `${30 + i * 9}px` }}
              />
              <strong>{n}&quot;</strong>
            </div>
          ))}
        </div>
        <section className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <img
            src={bounce}
            alt="Placeholder for HairbyOma colour chart"
            className="aspect-[4/3] w-full object-cover"
          />
          <div>
            <p className="eyebrow">Replaceable visual</p>
            <h2 className="mt-3 text-4xl">Hair colour guide</h2>
            <p className="mt-4 text-muted-foreground">
              The official HairbyOma colour chart will replace this visual. Current example labels:
              Natural Black, Jet Black, Chocolate Brown, Honey Blonde and custom blends.
            </p>
            <MockNotice>This is not the official colour chart.</MockNotice>
          </div>
        </section>
      </div>
    </>
  );
}
export function AppointmentPage() {
  return (
    <>
      <PageHero
        eyebrow="Personal consultation"
        title="Book an appointment"
        copy="Preserving HairbyOma’s consultation-first experience while the official booking link is confirmed."
      />
      <div className="site-container py-16 text-center">
        <CalendarBlock />
        <Button asChild size="lg" className="mt-7">
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%27d%20like%20to%20book%20a%20HairbyOma%20appointment.`}
            target="_blank"
            rel="noreferrer"
          >
            Request via WhatsApp <ArrowRight />
          </a>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          The official booking system URL can replace this handoff in configuration.
        </p>
      </div>
    </>
  );
}
function CalendarBlock() {
  return (
    <div className="mx-auto max-w-xl border p-8">
      <PackageCheck className="mx-auto size-10 text-primary" />
      <h2 className="mt-4 text-3xl">Your HairbyOma consultation</h2>
      <p className="mt-3 text-muted-foreground">
        Discuss texture, length, colour, fit and the final look before you order.
      </p>
    </div>
  );
}
