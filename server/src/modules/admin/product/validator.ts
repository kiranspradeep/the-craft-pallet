import { z } from "zod";
import {
  AssetSourceType,
  CustomFieldType,
  PricingStrategy,
  ProductImageType,
} from "@prisma/client";

// ── Reusable ──────────────────────────────────────────────────────────────

const idParam = z.object({
  params: z.object({ id: z.string().min(1) }),
});

// ── Product Core ──────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string({ required_error: "Category is required" }).min(1),
    name: z.string({ required_error: "Name is required" }).min(1).max(200),
    slug: z
      .string()
      .max(220)
      .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
      .optional(),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    sortOrder: z.number().int().min(0).optional().default(0),
    metaTitle: z.string().max(160).optional(),
    metaDescription: z.string().max(320).optional(),
    metaKeywords: z.string().max(500).optional(),
    ogImageUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    categoryId: z.string().min(1).optional(),
    name: z.string().min(1).max(200).optional(),
    slug: z
      .string()
      .max(220)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    metaTitle: z.string().max(160).optional(),
    metaDescription: z.string().max(320).optional(),
    metaKeywords: z.string().max(500).optional(),
    ogImageUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const listProductsSchema = z.object({
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
    categoryId: z.string().optional(),
    isActive: z
      .string()
      .optional()
      .transform((v) => {
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
    isFeatured: z
      .string()
      .optional()
      .transform((v) => {
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
    sortBy: z.enum(["name", "createdAt", "sortOrder"]).optional().default("sortOrder"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

export const productIdSchema = idParam;

// ── Images ────────────────────────────────────────────────────────────────

export const addImageSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    url: z.string({ required_error: "Image URL is required" }).url(),
    altText: z.string().max(200).optional(),
    type: z.nativeEnum(ProductImageType).optional().default(ProductImageType.GALLERY),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    sortOrder: z.number().int().min(0).optional().default(0),
  }),
});

export const deleteImageSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    imageId: z.string().min(1),
  }),
});

export const reorderImagesSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    images: z
      .array(
        z.object({
          id: z.string().min(1),
          sortOrder: z.number().int().min(0),
        })
      )
      .min(1),
  }),
});

// ── Variants ──────────────────────────────────────────────────────────────

export const createVariantSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string({ required_error: "Variant name is required" }).min(1).max(100),
    sku: z.string().max(100).optional(),
    price: z
      .number({ required_error: "Price is required" })
      .positive("Price must be positive"),
    thumbnailUrl: z.string().url().optional().or(z.literal("")),
    processingDays: z.number().int().positive().optional(),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().min(0).optional().default(0),
  }),
});

export const updateVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    variantId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    sku: z.string().max(100).optional(),
    price: z.number().positive().optional(),
    thumbnailUrl: z.string().url().optional().or(z.literal("")),
    processingDays: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const variantIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    variantId: z.string().min(1),
  }),
});

// ── Configuration ─────────────────────────────────────────────────────────

export const upsertConfigurationSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    uploadRequired: z.boolean().optional().default(false),
    minImages: z.number().int().positive().optional(),
    maxImages: z.number().int().positive().optional(),
    maxFileSizeMb: z.number().int().positive().optional(),
    maxZipSizeMb: z.number().int().positive().optional(),
    allowedExtensions: z.array(z.string()).optional().default([]),
    allowedSources: z
      .array(z.nativeEnum(AssetSourceType))
      .optional()
      .default([]),
    allowDuplicateImages: z.boolean().optional().default(false),
    allowImageReordering: z.boolean().optional().default(true),
    estimatedProductionDays: z.number().int().positive().optional(),
    extraRules: z.record(z.unknown()).optional(),
  }),
});

// ── Pricing ───────────────────────────────────────────────────────────────

export const upsertPricingSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      strategy: z.nativeEnum(PricingStrategy, {
        required_error: "Pricing strategy is required",
      }),
      minimumOrderQuantity: z.number().int().positive().optional(),
      incrementQuantity: z.number().int().positive().optional(),
      incrementPrice: z.number().positive().optional(),
      unitPrice: z.number().positive().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.strategy === PricingStrategy.INCREMENTAL_QUANTITY &&
        (!data.incrementQuantity || !data.incrementPrice)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "incrementQuantity and incrementPrice are required for INCREMENTAL_QUANTITY strategy",
        });
      }
      if (
        data.strategy === PricingStrategy.PER_UNIT &&
        !data.unitPrice
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "unitPrice is required for PER_UNIT strategy",
        });
      }
    }),
});

// ── Custom Fields ─────────────────────────────────────────────────────────

export const createCustomFieldSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string({ required_error: "Field name is required" }).min(1).max(100),
    label: z.string({ required_error: "Label is required" }).min(1).max(200),
    type: z.nativeEnum(CustomFieldType, {
      required_error: "Field type is required",
    }),
    placeholder: z.string().max(200).optional(),
    helpText: z.string().max(500).optional(),
    isRequired: z.boolean().optional().default(false),
    sortOrder: z.number().int().min(0).optional().default(0),
    validationJson: z.record(z.unknown()).optional(),
  }),
});

export const updateCustomFieldSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    fieldId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    label: z.string().min(1).max(200).optional(),
    type: z.nativeEnum(CustomFieldType).optional(),
    placeholder: z.string().max(200).optional(),
    helpText: z.string().max(500).optional(),
    isRequired: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    validationJson: z.record(z.unknown()).optional(),
  }),
});

export const fieldIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    fieldId: z.string().min(1),
  }),
});

export const reorderCustomFieldsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    fields: z
      .array(z.object({ id: z.string().min(1), sortOrder: z.number().int().min(0) }))
      .min(1),
  }),
});

// ── Custom Field Options ──────────────────────────────────────────────────

export const createCustomFieldOptionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    fieldId: z.string().min(1),
  }),
  body: z.object({
    label: z.string({ required_error: "Label is required" }).min(1).max(200),
    value: z.string({ required_error: "Value is required" }).min(1).max(200),
    sortOrder: z.number().int().min(0).optional().default(0),
  }),
});

export const updateCustomFieldOptionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    fieldId: z.string().min(1),
    optionId: z.string().min(1),
  }),
  body: z.object({
    label: z.string().min(1).max(200).optional(),
    value: z.string().min(1).max(200).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const optionIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    fieldId: z.string().min(1),
    optionId: z.string().min(1),
  }),
});