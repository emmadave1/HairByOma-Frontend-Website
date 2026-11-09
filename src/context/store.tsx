import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/auth";
import { cartService, type BackendCartItem, type AddToCartPayload } from "@/services/cart.service";

type Store = {
  cart: BackendCartItem[];
  wishlist: string[];
  loadingCart: boolean;
  cartError: string;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleWishlist: (id: string) => void;
  cartCount: number;
  cartTotal: number;
};

const StoreContext = createContext<Store | undefined>(undefined);
const GUEST_CART_KEY = "oma-guest-cart-id";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState<BackendCartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState("");
  const [wishlistOwner, setWishlistOwner] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    const guestId = localStorage.getItem(GUEST_CART_KEY) || undefined;

    try {
      const response = await cartService.get(guestId);
      if (response.guestId) {
        localStorage.setItem(GUEST_CART_KEY, response.guestId);
      }
      setCart(response.items || []);
      setCartError("");
    } catch (error) {
      setCartError(
        error instanceof Error ? error.message : "Unable to load your cart.",
      );
      throw error;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function initialiseCart() {
      setLoadingCart(true);
      setCartError("");

      try {
        const guestId = localStorage.getItem(GUEST_CART_KEY);

        if (user && guestId) {
          try {
            await cartService.merge(guestId);
            localStorage.removeItem(GUEST_CART_KEY);
          } catch (error) {
            const status =
              typeof error === "object" &&
              error !== null &&
              "status" in error
                ? error.status
                : undefined;

            if (status === 404) {
              localStorage.removeItem(GUEST_CART_KEY);
            } else {
              throw error;
            }
          }
        }

        const currentGuestId =
          localStorage.getItem(GUEST_CART_KEY) || undefined;
        const response = await cartService.get(currentGuestId);

        if (!cancelled) {
          if (response.guestId) {
            localStorage.setItem(GUEST_CART_KEY, response.guestId);
          }
          setCart(response.items || []);
        }
      } catch (error) {
        if (!cancelled) {
          setCartError(
            error instanceof Error
              ? error.message
              : "Unable to load your cart.",
          );
        }
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    }

    void initialiseCart();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  useEffect(() => {
    setWishlistOwner(user?.id ?? null);

    if (!user) {
      setWishlist([]);
      return;
    }

    try {
      setWishlist(
        JSON.parse(
          localStorage.getItem(`oma-wishlist-${user.id}`) || "[]",
        ),
      );
    } catch {
      setWishlist([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && wishlistOwner === user.id) {
      localStorage.setItem(
        `oma-wishlist-${user.id}`,
        JSON.stringify(wishlist),
      );
    }
  }, [wishlist, user?.id, wishlistOwner, user]);

  const addToCart = useCallback(
    async (payload: AddToCartPayload) => {
      const guestId = localStorage.getItem(GUEST_CART_KEY) || undefined;
      const response = await cartService.add(payload, guestId);

      if (response.guestId) {
        localStorage.setItem(GUEST_CART_KEY, response.guestId);
      }

      await refreshCart();
    },
    [refreshCart],
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const guestId = localStorage.getItem(GUEST_CART_KEY) || undefined;
      await cartService.remove(itemId, guestId);
      await refreshCart();
    },
    [refreshCart],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      const guestId = localStorage.getItem(GUEST_CART_KEY) || undefined;
      await cartService.update(itemId, quantity, guestId);
      await refreshCart();
    },
    [refreshCart],
  );

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const value = useMemo<Store>(
    () => ({
      cart,
      wishlist,
      loadingCart,
      cartError,
      addToCart,
      removeFromCart,
      updateQuantity,
      refreshCart,
      toggleWishlist,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      cartTotal: cart.reduce((total, item) => total + item.subtotal, 0),
    }),
    [
      cart,
      wishlist,
      loadingCart,
      cartError,
      addToCart,
      removeFromCart,
      updateQuantity,
      refreshCart,
      toggleWishlist,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("StoreProvider missing");
  }

  return context;
}
