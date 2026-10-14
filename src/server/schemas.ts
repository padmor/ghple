import { z } from "zod";

const clearable = (max: number) => z.string().max(max).nullish();

/** Fields a manager can set on a product. */
export const productFields = {
  size: z.string().trim().min(1).max(40),
  volumeMl: z.number().int().min(1).max(100000),
  price: z.number().min(0).max(1_000_000),
  description: z.string().max(1000),
  badge: clearable(40),
  // Uploaded photos arrive as data URLs; keep them small until image storage is added
  image: clearable(1_500_000),
  inStock: z.boolean(),
};
