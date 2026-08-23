import { z } from "zod";
import {
  OrderStatus,
  PhotoStatus,
  ProductionStage,
  OrderSource,
} from "@prisma/client";

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
    photoStatus: z.nativeEnum(PhotoStatus).optional(),
    orderSource: z.nativeEnum(OrderSource).optional(),
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

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Order ID is required"),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      required_error: "Status is required",
    }),
    note: z.string().max(500).optional(),
  }),
});

export const updateProductionStageSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    productionStage: z.nativeEnum(ProductionStage, {
      required_error: "Production stage is required",
    }),
  }),
});

export const addNoteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    note: z
      .string({ required_error: "Note is required" })
      .min(1)
      .max(1000),
  }),
});

export const markAsPaidSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    referenceNumber: z.string().max(200).optional(),
    note: z.string().max(500).optional(),
  }),
});

export const generatePaymentLinkSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const markAsShippedSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    trackingNumber: z
      .string({ required_error: "Tracking number is required" })
      .min(1, "Tracking number is required")
      .max(100),
    estimatedDelivery: z.string().optional(),
  }),
});