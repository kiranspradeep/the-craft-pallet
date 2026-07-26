import { z } from "zod";

export const listPublicProductsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 1))
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : 20))
      .pipe(z.number().int().min(1).max(100)),
    search: z.string().optional(),
    category: z.string().optional(),
    featured: z
      .string()
      .optional()
      .transform((v) => {
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
    sortBy: z
      .enum(["name", "createdAt", "sortOrder"])
      .optional()
      .default("sortOrder"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

export const productSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const categorySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const trackOrderSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(1),
  }),
  query: z.object({
    phone: z
      .string({ required_error: "Phone is required" })
      .regex(/^\d{10}$/, "Phone must be 10 digits"),
  }),
});