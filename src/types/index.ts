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

export type CartItem = {
  product: Product;
  quantity: number;
  length: number;
};

export type Review = {
  id: string;
  name: string;
  product: string;
  rating: number;
  text: string;
  verified: boolean;
  image: string;
};

export type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  referralCode?: string;
  dateOfBirth?: string | null;
  loyaltyPoints?: number;
  birthdayEmailsEnabled?: boolean;
  birthdayWishesEnabled?: boolean;
  promotionalEmailsEnabled?: boolean;
  promotionalInAppEnabled?: boolean;
  abandonedCartEmailsEnabled?: boolean;
  hairRevampingEmailsEnabled?: boolean;
  newProductEmailsEnabled?: boolean;
  newProductInAppEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AppUser;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  email: string;
  requiresVerification: boolean;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};
