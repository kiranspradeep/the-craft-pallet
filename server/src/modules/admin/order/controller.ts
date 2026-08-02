import { Request, Response } from "express";
import { orderService } from "./service.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { BadRequestError } from "../../../shared/errors/AppError.js";
import { OrderStatus, ProductionStage } from "@prisma/client";

const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const orderController = {
  // GET /api/admin/orders
  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const q = req.query as Record<string, string>;

    const result = await orderService.findAll({
      page: q["page"] ? parseInt(q["page"], 10) : 1,
      limit: q["limit"] ? parseInt(q["limit"], 10) : 20,
      search: q["search"],
      status: q["status"] as OrderStatus | undefined,
      productionStage: q["productionStage"] as ProductionStage | undefined,
      dateFrom: q["dateFrom"] ? new Date(q["dateFrom"]) : undefined,
      dateTo: q["dateTo"] ? new Date(q["dateTo"]) : undefined,
      sortBy:
        (q["sortBy"] as "createdAt" | "updatedAt" | "totalAmount") ??
        "createdAt",
      sortOrder: (q["sortOrder"] as "asc" | "desc") ?? "desc",
    });

    sendSuccess({
      res,
      data: result.orders,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }),

  // GET /api/admin/orders/stats
  getStats: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const stats = await orderService.getStats();
      sendSuccess({ res, data: stats });
    }
  ),

  // GET /api/admin/orders/production-queue
  getProductionQueue: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const orders = await orderService.getProductionQueue();
      sendSuccess({ res, data: orders });
    }
  ),

  // GET /api/admin/orders/:id
  getOne: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.findById(param(req, "id"));
    sendSuccess({ res, data: order });
  }),

  // PATCH /api/admin/orders/:id/status
  updateStatus: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { status, note } = req.body;
      const adminId = req.admin!.id;

      const order = await orderService.updateStatus(
        param(req, "id"),
        status,
        adminId,
        note
      );

      sendSuccess({
        res,
        message: "Order status updated successfully",
        data: order,
      });
    }
  ),

  // PATCH /api/admin/orders/:id/production-stage
  updateProductionStage: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { productionStage } = req.body;
      const adminId = req.admin!.id;

      const order = await orderService.updateProductionStage(
        param(req, "id"),
        productionStage,
        adminId
      );

      sendSuccess({
        res,
        message: "Production stage updated successfully",
        data: order,
      });
    }
  ),

  // PATCH /api/admin/orders/:id/note
  addNote: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { note } = req.body;
      const adminId = req.admin!.id;

      const order = await orderService.addNote(
        param(req, "id"),
        note,
        adminId
      );

      sendSuccess({
        res,
        message: "Note added successfully",
        data: order,
      });
    }
  ),

  // PATCH /api/admin/orders/:id/mark-paid
  markAsPaid: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.admin!.id;

      const order = await orderService.markAsPaid(
        param(req, "id"),
        adminId,
        {
          referenceNumber: req.body.referenceNumber,
          note: req.body.note,
        }
      );

      sendSuccess({
        res,
        message: "Order marked as paid successfully",
        data: order,
      });
    }
  ),

  // POST /api/admin/orders/:id/payment-link
  generatePaymentLink: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.admin!.id;

      const result = await orderService.generatePaymentLink(
        param(req, "id"),
        adminId
      );

      sendSuccess({
        res,
        message: "Payment link generated successfully",
        data: result,
        statusCode: 201,
      });
    }
  ),
};