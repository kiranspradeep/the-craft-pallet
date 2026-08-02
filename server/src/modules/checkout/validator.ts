import { z } from "zod";
import { CustomFieldType } from "@prisma/client";

const customerFieldsSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1).max(200),
  phone: z
    .string({ required_error: "Phone is required" })
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  email: z.string().email("Invalid email").optional(),

  shipName: z.string({ required_error: "Shipping name is required" }).min(1).max(200),
  shipPhone: z
    .string({ required_error: "Shipping phone is required" })
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  shipLine1: z.string({ required_error: "Address line 1 is required" }).min(1).max(300),
  shipLine2: z.string().max(300).optional(),
  shipCity: z.string({ required_error: "City is required" }).min(1).max(100),
  shipState: z.string({ required_error: "State is required" }).min(1).max(100),
  shipPincode: z
    .string({ required_error: "Pincode is required" })
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  shipCountry: z.string().max(100).optional().default("India"),

  couponCode: z.string().max(50).optional(),
  customerNote: z.string().max(1000).optional(),
  driveLink: z.string().url().optional(),
  buyNowCheckoutId: z.string().optional(),
});

export const checkoutSchema = z.object({
  body: customerFieldsSchema,
});

export const draftCheckoutSchema = z.object({
  body: customerFieldsSchema,
});

// ── Buy Now ────────────────────────────────────────────────────────────────

const customizationSchema = z.object({
  customFieldId: z.string().min(1),
  fieldLabel: z.string().min(1),
  fieldType: z.nativeEnum(CustomFieldType),
  textValue: z.string().optional(),
  numberValue: z.number().optional(),
  dateValue: z.string().optional(),
  booleanValue: z.boolean().optional(),
  assetId: z.string().optional(),
});

export const createBuyNowSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: "Product ID is required" }).min(1),
    variantId: z.string().optional(),
    quantity: z
      .number({ required_error: "Quantity is required" })
      .int()
      .min(1),
    selectedTierQuantity: z.number().int().positive().optional(),
    notes: z.string().max(500).optional(),
    customizations: z.array(customizationSchema).optional(),
    assetId: z.string().optional(),
  }),
});

export const buyNowIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updateBuyNowSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    assetId: z.string().optional(),
    customizations: z.array(customizationSchema).optional(),
  }),
});