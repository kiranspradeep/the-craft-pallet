import { z } from "zod";

export const checkoutSchema = z.object({
  body: z.object({
    // Customer info
    name: z
      .string({ required_error: "Name is required" })
      .min(1)
      .max(200),
    phone: z
      .string({ required_error: "Phone is required" })
      .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    email: z.string().email("Must be a valid email").optional(),

    // Shipping address
    shipName: z
      .string({ required_error: "Shipping name is required" })
      .min(1)
      .max(200),
    shipPhone: z
      .string({ required_error: "Shipping phone is required" })
      .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    shipLine1: z
      .string({ required_error: "Address line 1 is required" })
      .min(1)
      .max(300),
    shipLine2: z.string().max(300).optional(),
    shipCity: z
      .string({ required_error: "City is required" })
      .min(1)
      .max(100),
    shipState: z
      .string({ required_error: "State is required" })
      .min(1)
      .max(100),
    shipPincode: z
      .string({ required_error: "Pincode is required" })
      .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
    shipCountry: z.string().max(100).optional().default("India"),

    // Optional
    couponCode: z.string().max(50).optional(),
    customerNote: z.string().max(1000).optional(),
  }),
});