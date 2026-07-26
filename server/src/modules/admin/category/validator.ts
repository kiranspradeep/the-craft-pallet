import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters"),

    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
      .optional(),

    description: z.string().max(1000).optional(),

    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    sortOrder: z
      .number()
      .int()
      .min(0, "Sort order must be 0 or greater")
      .optional()
      .default(0),

    isActive: z.boolean().optional().default(true),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
      .optional(),

    description: z.string().max(1000).optional(),

    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    sortOrder: z
      .number()
      .int()
      .min(0, "Sort order must be 0 or greater")
      .optional(),

    isActive: z.boolean().optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
});

export const listCategoriesSchema = z.object({
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

    sortBy: z
      .enum(["sortOrder", "name", "createdAt"])
      .optional()
      .default("sortOrder"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),

    isActive: z
      .string()
      .optional()
      .transform((v) => {
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
  }),
});