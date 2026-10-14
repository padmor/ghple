import { z } from "zod";

const clearable = (max: number) => z.string().max(max).nullish();

/** Fields a manager can set on a product. */
export const productFields = {
  size: z.string().trim().min(1).max(40),
  volumeMl: z.number().int().min(1).max(100000),
  price: z.number().min(0).max(1_000_000),
  description: z.string().max(1000),
  badge: clearable(40),
  // An address only: a bundled picture (/images/...) or an upload (/api/images/...)
  image: clearable(500),
  inStock: z.boolean(),
};
