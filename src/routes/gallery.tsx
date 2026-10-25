import { createFileRoute } from "@tanstack/react-router";
import { Play, Maximize2 } from "lucide-react";
import { useState } from "react";
import { PageHero, MockNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { gallery } from "@/data/content";
export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "HairbyOma Gallery — Hair & Client Looks" },
      {
        name: "description",
        content: "Explore HairbyOma wigs, installations, client looks and hair movement previews.",
      },
      { property: "og:title", content: "HairbyOma Gallery" },
      { property: "og:description", content: "Hair, installations and client looks by HairbyOma." },
    ],
  }),
  component: Page,
});
function Page() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<(typeof gallery)[number]>();
  const cats = [
    "All",
    "Hair",
    "Installations",
    "Before & After",
    "Client Looks",
    "Packaging",
    "Wigs",
    "New Arrivals",
    "Videos",
  ];
  const list = filter === "All" ? gallery : gallery.filter((x) => x.category === filter);
  return (
    <>
      <PageHero
        eyebrow="The lookbook"
        title="HairbyOma Gallery"
        copy="Explore texture, transformation and presentation through replaceable mock imagery."
      />
      <div className="site-container py-10">
        <MockNotice>
          Official customer imagery and videos will replace these polished placeholders when
          supplied.
        </MockNotice>
        <div className="my-7 flex gap-2 overflow-x-auto pb-2">
          {cats.map((c) => (
            <Button
              key={c}
              variant={filter === c ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="columns-2 gap-3 md:columns-3">
          {list.map((item, i) => (
            <button
              key={item.id}
              className="group relative mb-3 w-full overflow-hidden"
              onClick={() => setActive(item)}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className={`w-full object-cover ${i % 3 === 0 ? "aspect-[4/5]" : "aspect-square"}`}
              />
              <span className="absolute inset-0 flex items-end justify-between bg-foreground/0 p-4 text-left text-background opacity-0 transition group-hover:bg-foreground/45 group-hover:opacity-100">
                <span>
                  {item.title}
                  <small className="block">{item.category}</small>
                </span>
                {item.category === "Videos" ? <Play /> : <Maximize2 />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(undefined)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{active?.title}</DialogTitle>
          {active && (
            <img
              src={active.image}
              alt={active.title}
              className="max-h-[75vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
