import { z } from "zod";
import { OrderStatus, ProductionStage } from "@prisma/client";

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
    productionStage: z.nativeEnum(ProductionStage).optional(),
    dateFrom: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v) : undefined)),
    dateTo: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v) : undefined)),
    sortBy: z
      .enum(["createdAt", "updatedAt", "totalAmount"])
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
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      required_error: "Status is required",
    }),
    note: z.string().max(500).optional(),
  }),
});

// ── Update Production Stage ───────────────────────────────────────────────

export const updateProductionStageSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    productionStage: z.nativeEnum(ProductionStage, {
      required_error: "Production stage is required",
    }),
  }),
});

// ── Add Admin Note ────────────────────────────────────────────────────────

export const addNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    note: z
      .string({ required_error: "Note is required" })
      .min(1, "Note cannot be empty")
      .max(1000, "Note cannot exceed 1000 characters"),
  }),
});

// ── Mark as Paid ──────────────────────────────────────────────────────────

export const markAsPaidSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    referenceNumber: z.string().max(200).optional(),
    note: z.string().max(500).optional(),
  }),
});

// ── Generate Payment Link ─────────────────────────────────────────────────

export const generatePaymentLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});