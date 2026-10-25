import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useStore } from "@/context/store";

export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.55,
      ease: "easeOut",
      onUpdate: (n) => setDisplay(Math.round(n)),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reduced]);
  return (
    <span className="tabular-nums" aria-label={String(value)}>
      <span aria-hidden="true">{display.toLocaleString()}</span>
    </span>
  );
}

export function StorefrontMotion({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = root.current;
    if (!element || reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    const register = () =>
      element
        .querySelectorAll(
          "h1,h2,section > div > p,section > p,.product-card,.category-card,[data-reveal]",
        )
        .forEach((node) => {
          if (node.hasAttribute("data-motion-ready")) return;
          node.setAttribute("data-motion-ready", "");
          // Never conceal text already visible in the viewport.
          const rect = node.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) node.classList.add("is-revealed");
          observer.observe(node);
        });
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(element, { childList: true, subtree: true });
    let frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        element.querySelectorAll<HTMLElement>("[data-parallax]").forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight)
            node.style.setProperty(
              "--parallax-offset",
              `${Math.max(-18, Math.min(18, -rect.top * 0.035))}px`,
            );
        });
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [pageKey, reduced]);
  return (
    <motion.div
      ref={root}
      key={pageKey}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CartFeedback() {
  const { cartCount } = useStore();
  const previous = useRef(cartCount);
  const ready = useRef(false);
  const [notice, setNotice] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const timer = setTimeout(() => {
      ready.current = true;
    }, 700);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (ready.current && cartCount > previous.current) setNotice(true);
    previous.current = cartCount;
    if (!notice) return;
    const timer = setTimeout(() => setNotice(false), 2600);
    return () => clearTimeout(timer);
  }, [cartCount, notice]);
  return (
    <div className="cart-feedback" role="status" aria-live="polite">
      <AnimatePresence>
        {notice && (
          <motion.div
            key="cart-notice"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 6 }}
            transition={{ duration: 0.28 }}
            className="flex items-center gap-3 border bg-background px-5 py-4 shadow-sm"
          >
            <ShoppingCart className="size-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Added to your selection</p>
              <Link to="/cart" className="text-xs text-primary underline underline-offset-4">
                View cart · {cartCount} {cartCount === 1 ? "item" : "items"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
