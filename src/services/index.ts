import { products } from "@/data/products";
import { reviews } from "@/data/content";
// TODO(backend): replace these local resolvers with typed API clients. No network requests are made here.
export const productsService = {
  list: async () => products,
  getBySlug: async (slug: string) => products.find((p) => p.slug === slug),
};
export const reviewsService = { list: async () => reviews };
export const ordersService = { list: async () => [] };
export const customersService = { getCurrent: async () => null };
export const rewardsService = { getSummary: async () => null };
export const referralsService = { getSummary: async () => null };
export const birthdayService = { getStatus: async () => null };
export const customOrdersService = {
  prepare: async <T>(payload: T) => ({ prepared: true, payload }),
};
