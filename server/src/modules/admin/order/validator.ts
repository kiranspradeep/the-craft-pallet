import { z } from "zod";
import { OrderStatus, ShipmentStatus } from "@prisma/client";

// ── List Orders ───────────────────────────────────────────────────────────

export const listOrdersSchema = z.object({
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
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z
      .enum(["PENDING", "INITIATED", "SUCCESS", "FAILED", "REFUNDED"])
      .optional(),
    customerId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z
      .enum(["createdAt", "totalAmount", "orderNumber"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// ── Order ID param ────────────────────────────────────────────────────────

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

// ── Update Status ─────────────────────────────────────────────────────────

export const updateStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      required_error: "Status is required",
    }),
    note: z.string().max(500).optional(),
  }),
});

// ── Assign Shipment ───────────────────────────────────────────────────────

export const assignShipmentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    shippingPartnerId: z.string({
      required_error: "Shipping partner is required",
    }).min(1),
    trackingNumber: z
      .string({ required_error: "Tracking number is required" })
      .min(1)
      .max(100),
    estimatedDelivery: z.string().datetime().optional(),
    note: z.string().max(500).optional(),
  }),
});

// ── Cancel Order ──────────────────────────────────────────────────────────

export const cancelOrderSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    reason: z
      .string({ required_error: "Cancellation reason is required" })
      .min(1)
      .max(500),
  }),
});

// ── Refund Order ──────────────────────────────────────────────────────────

export const refundOrderSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    refundAmount: z
      .number({ required_error: "Refund amount is required" })
      .positive("Refund amount must be positive"),
    reason: z
      .string({ required_error: "Refund reason is required" })
      .min(1)
      .max(500),
  }),
});

// ── Verify Payment ────────────────────────────────────────────────────────

export const verifyPaymentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    approved: z.boolean({ required_error: "approved is required" }),
    note: z.string().max(500).optional(),
    referenceNumber: z.string().max(200).optional(),
  }),
});

// ── Add Admin Note ────────────────────────────────────────────────────────

export const addNoteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    note: z
      .string({ required_error: "Note is required" })
      .min(1)
      .max(1000),
    isVisibleToCustomer: z.boolean().optional().default(false),
  }),
});

// ── Update Shipment Status ────────────────────────────────────────────────

export const updateShipmentStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.nativeEnum(ShipmentStatus, {
      required_error: "Shipment status is required",
    }),
    note: z.string().max(500).optional(),
  }),
});