import { useEffect, useState } from "react";
import hero from "@/assets/hairbyoma-hero.jpg";
import deep from "@/assets/deep-wave.jpg";
import bob from "@/assets/bob-wig.jpg";
import bounce from "@/assets/layered-bounce.jpg";
import wave from "@/assets/water-wave.jpg";
import ponytail from "@/assets/sleek-ponytail.jpg";

const heroImages = [
  { src: hero, alt: "HairbyOma model wearing long bone-straight hair" },
  { src: wave, alt: "Model with voluminous water-wave curls" },
  { src: ponytail, alt: "Model with a sleek long ponytail" },
  { src: deep, alt: "Deep wave hair bundles" },
  { src: bob, alt: "Model wearing a polished bob wig" },
  { src: bounce, alt: "Layered bounce wig with soft movement" },
];

export function HeroSlider() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % heroImages.length), 5000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      {heroImages.map((img, i) => (
        <img
          key={img.alt}
          src={img.src}
          alt={i === active ? img.alt : ""}
          aria-hidden={i !== active}
          width={1536}
          height={1280}
          fetchPriority={i === 0 ? "high" : undefined}
          loading={i === 0 ? undefined : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ease-in-out ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </>
  );
}
