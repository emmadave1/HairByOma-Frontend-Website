export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  texture: string;
  lengths: number[];
  priceLabel: string;
  mockPrice: number;
  rating: number;
  image: string;
  badge?: string;
  description: string;
  color: string;
  density?: string;
  weight: string;
  available: boolean;
};
export type CartItem = { product: Product; quantity: number; length: number };
export type Review = {
  id: string;
  name: string;
  product: string;
  rating: number;
  text: string;
  verified: boolean;
  image: string;
};
