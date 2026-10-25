import { useState } from "react";
import { Check, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle } from "@/components/shared";
import naturalBlack from "@/assets/hairbyoma-hero.jpg";
import chocolateBrown from "@/assets/guide-chocolate-brown.jpg";
import burgundy from "@/assets/guide-burgundy.jpg";
import honeyBlonde from "@/assets/guide-honey-blonde.jpg";
import lengthModel from "@/assets/sleek-ponytail.jpg";

const colours = [
  { name: "Natural Black", image: naturalBlack, swatch: "bg-hair-natural", imageClass: "" },
  { name: "Brown", image: chocolateBrown, swatch: "bg-hair-brown", imageClass: "" },
  { name: "Burgundy", image: burgundy, swatch: "bg-hair-burgundy", imageClass: "" },
  { name: "Honey Blonde", image: honeyBlonde, swatch: "bg-hair-honey", imageClass: "" },
  { name: "613 Blonde", image: honeyBlonde, swatch: "bg-hair-613", imageClass: "hair-preview-613" },
  { name: "Jet Black", image: naturalBlack, swatch: "bg-hair-jet", imageClass: "hair-preview-jet" },
] as const;

const lengths = [
  { value: 16, fall: "Shoulder", line: "top-[34%]" },
  { value: 18, fall: "Upper back", line: "top-[42%]" },
  { value: 20, fall: "Mid-back", line: "top-[50%]" },
  { value: 22, fall: "Lower back", line: "top-[58%]" },
  { value: 24, fall: "Waist", line: "top-[66%]" },
  { value: 26, fall: "Upper hip", line: "top-[74%]" },
  { value: 28, fall: "Hip", line: "top-[82%]" },
  { value: 30, fall: "Lower hip", line: "top-[90%]" },
] as const;

export function HairGuidePage() {
  const [selectedColour, setSelectedColour] = useState<(typeof colours)[number]>(colours[0]);
  const [selectedLength, setSelectedLength] = useState<(typeof lengths)[number]>(lengths[2]);

  return (
    <>
      <PageHero
        eyebrow="Choose with confidence"
        title="Find your perfect look"
        copy="Explore colour and length visually before choosing your HairbyOma hair."
      />
      <section className="site-container py-14 md:py-20" aria-labelledby="colour-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] lg:items-center lg:gap-14">
          <div className="relative overflow-hidden rounded-lg bg-muted">
            <img
              key={selectedColour.name}
              src={selectedColour.image}
              alt={`Long straight hair preview in ${selectedColour.name}`}
              className={`hair-colour-preview aspect-[5/4] w-full object-cover ${selectedColour.imageClass}`}
            />
            <div className="absolute inset-x-0 bottom-0 bg-foreground/80 px-5 py-4 text-background backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-background/70">
                Currently viewing
              </p>
              <p className="mt-1 font-display text-2xl">{selectedColour.name}</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Interactive colour guide</p>
            <h2 id="colour-heading" className="mt-3 text-4xl md:text-5xl">
              Choose Your Colour
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              Select a shade to see how it transforms the same sleek HairbyOma look.
            </p>
            <div
              className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
              role="group"
              aria-label="Hair colour choices"
            >
              {colours.map((colour) => (
                <Button
                  key={colour.name}
                  type="button"
                  variant="outline"
                  aria-pressed={selectedColour.name === colour.name}
                  onClick={() => setSelectedColour(colour)}
                  className={`h-auto min-h-20 flex-col gap-2 whitespace-normal px-3 py-3 ${selectedColour.name === colour.name ? "border-primary bg-secondary/55 shadow-sm" : ""}`}
                >
                  <span
                    className={`relative size-8 rounded-full border border-foreground/15 shadow-sm ${colour.swatch}`}
                  >
                    {selectedColour.name === colour.name && (
                      <Check
                        className="absolute inset-0 m-auto size-4 text-hair-check"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span className="text-center text-xs leading-4">{colour.name}</span>
                </Button>
              ))}
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              Colours are a visual guide. Tone may vary slightly by screen, lighting and available
              hair.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/55 py-14 md:py-20" aria-labelledby="length-heading">
        <div className="site-container">
          <SectionTitle
            eyebrow="See where it falls"
            title="Interactive Hair Length Visualizer"
            copy="Choose a length to see its approximate fall on the model."
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(20rem,34rem)_18rem] lg:items-center lg:justify-center lg:gap-10">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold">Choose your length</p>
              <div
                className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-2"
                role="group"
                aria-label="Hair length choices"
              >
                {lengths.map((length) => (
                  <Button
                    key={length.value}
                    type="button"
                    variant={selectedLength.value === length.value ? "default" : "outline"}
                    aria-pressed={selectedLength.value === length.value}
                    onClick={() => setSelectedLength(length)}
                    className="h-11 px-2 text-base"
                  >
                    {length.value}&quot;
                  </Button>
                ))}
              </div>
            </div>

            <div className="order-1 mx-auto w-full max-w-lg lg:order-2">
              <div className="relative overflow-hidden rounded-lg bg-secondary">
                <img
                  src={lengthModel}
                  alt="Model showing the approximate fall of selected hair lengths"
                  className="aspect-square w-full object-cover"
                />
                <div
                  key={selectedLength.value}
                  className={`hair-length-marker absolute inset-x-0 ${selectedLength.line}`}
                  aria-hidden="true"
                >
                  <span className="absolute left-3 top-1/2 h-px w-[calc(50%-4rem)] -translate-y-1/2 bg-background/80" />
                  <span className="absolute right-3 top-1/2 h-px w-[calc(50%-4rem)] -translate-y-1/2 bg-background/80" />
                  <span className="mx-auto grid size-16 place-items-center rounded-full border-2 border-background bg-primary font-display text-xl text-primary-foreground shadow-lg">
                    {selectedLength.value}&quot;
                  </span>
                </div>
              </div>
            </div>

            <div className="order-3 text-center lg:text-left">
              <Sparkles className="mx-auto size-6 text-primary lg:mx-0" />
              <p className="mt-3 text-sm text-muted-foreground">Selected length</p>
              <p className="mt-1 font-display text-5xl text-primary">
                {selectedLength.value}&quot;
              </p>
              <p className="mt-2 text-lg font-medium">Approximately {selectedLength.fall}</p>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                Straight hair shows its full length. Curly and wavy textures may appear shorter
                because of their curl pattern.
              </p>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-muted-foreground">
            <Info className="mr-1 inline size-4 align-text-bottom" />
            This guide is approximate. Your height, torso length, styling and hair texture will
            affect the final position.
          </p>
        </div>
      </section>
    </>
  );
}
