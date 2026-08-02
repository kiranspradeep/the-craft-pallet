import { z } from "zod";
import { CustomFieldType } from "@prisma/client";

// ── Add Item ──────────────────────────────────────────────────────────────

const customizationSchema = z.object({
  customFieldId: z.string().min(1, "Custom field ID is required"),
  fieldLabel: z.string().min(1),
  fieldType: z.nativeEnum(CustomFieldType),
  textValue: z.string().optional(),
  numberValue: z.number().optional(),
  dateValue: z.string().datetime().optional(),
  booleanValue: z.boolean().optional(),
  assetId: z.string().optional(),
});

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: "Product ID is required" }).min(1),
    variantId: z.string().optional(),
    quantity: z
      .number({ required_error: "Quantity is required" })
      .int()
      .min(1, "Quantity must be at least 1"),
    notes: z.string().max(500).optional(),
    selectedTierQuantity: z.number().int().positive().optional().nullable(), // ← NEW
    customizations: z.array(customizationSchema).optional().default([]),
  }),
});

// ── Update Item ───────────────────────────────────────────────────────────

export const updateItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1),
  }),
  body: z.object({
    quantity: z.number().int().min(1).optional(),
    notes: z.string().max(500).optional(),
  }),
});

// ── Remove Item ───────────────────────────────────────────────────────────

export const itemIdSchema = z.object({
  params: z.object({
    itemId: z.string().min(1),
  }),
});

// ── Apply Coupon ──────────────────────────────────────────────────────────

export const applyCouponSchema = z.object({
  body: z.object({
    code: z
      .string({ required_error: "Coupon code is required" })
      .min(1)
      .max(50)
      .toUpperCase(),
  }),
});