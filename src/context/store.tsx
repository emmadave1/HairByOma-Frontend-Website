import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";
import { useAuth } from "@/context/auth";
type Store = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (p: Product, length?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, q: number) => void;
  toggleWishlist: (id: string) => void;
  cartCount: number;
};
const StoreContext = createContext<Store | undefined>(undefined);
export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [wishlistOwner, setWishlistOwner] = useState<string | null>(null);
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("oma-cart") || "[]"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    setWishlistOwner(user?.id ?? null);
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      setWishlist(JSON.parse(localStorage.getItem(`oma-wishlist-${user.id}`) || "[]"));
    } catch {
      setWishlist([]);
    }
  }, [user?.id]);
  useEffect(() => {
    if (ready) localStorage.setItem("oma-cart", JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    if (ready && user && wishlistOwner === user.id)
      localStorage.setItem(`oma-wishlist-${user.id}`, JSON.stringify(wishlist));
  }, [wishlist, ready, user?.id, wishlistOwner]);
  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addToCart: (p: Product, length?: number) => {
        const selectedLength = length ?? p.lengths[0] ?? 10;
        setCart((x) => {
          const found = x.find((i) => i.product.id === p.id && i.length === selectedLength);
          return found
            ? x.map((i) => (i === found ? { ...i, quantity: i.quantity + 1 } : i))
            : [...x, { product: p, quantity: 1, length: selectedLength }];
        });
      },
      removeFromCart: (id: string) => setCart((x) => x.filter((i) => i.product.id !== id)),
      updateQuantity: (id: string, q: number) =>
        setCart((x) =>
          x.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, q) } : i)),
        ),
      toggleWishlist: (id: string) =>
        setWishlist((x) => (x.includes(id) ? x.filter((v) => v !== id) : [...x, id])),
      cartCount: cart.reduce((a, b) => a + b.quantity, 0),
    }),
    [cart, wishlist],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}
