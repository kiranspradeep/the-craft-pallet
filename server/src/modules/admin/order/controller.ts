import { Request, Response } from "express";
import { orderService } from "./service.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import {
  OrderStatus,
  PhotoStatus,
  ProductionStage,
  OrderSource,
} from "@prisma/client";

const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const orderController = {
  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const q = req.query as Record<string, string>;

    const result = await orderService.findAll({
      page: q["page"] ? parseInt(q["page"], 10) : 1,
      limit: q["limit"] ? parseInt(q["limit"], 10) : 20,
      search: q["search"],
      status: q["status"] as OrderStatus | undefined,
      photoStatus: q["photoStatus"] as PhotoStatus | undefined,
      orderSource: q["orderSource"] as OrderSource | undefined,
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

  getStats: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const stats = await orderService.getStats();
      sendSuccess({ res, data: stats });
    }
  ),

  getProductionQueue: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const orders = await orderService.getProductionQueue();
      sendSuccess({ res, data: orders });
    }
  ),

  getOne: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.findById(param(req, "id"));
    sendSuccess({ res, data: order });
  }),

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
        message: "Production stage updated",
        data: order,
      });
    }
  ),

  markPhotosReceived: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.admin!.id;
      const order = await orderService.markPhotosReceived(
        param(req, "id"),
        adminId
      );
      sendSuccess({
        res,
        message: "Photos marked as received",
        data: order,
      });
    }
  ),

  markPhotosVerified: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.admin!.id;
      const order = await orderService.markPhotosVerified(
        param(req, "id"),
        adminId
      );
      sendSuccess({
        res,
        message: "Photos verified successfully",
        data: order,
      });
    }
  ),

  addNote: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { note } = req.body;
      const adminId = req.admin!.id;
      const order = await orderService.addNote(
        param(req, "id"),
        note,
        adminId
      );
      sendSuccess({ res, message: "Note added successfully", data: order });
    }
  ),

  markAsPaid: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.admin!.id;
      const order = await orderService.markAsPaid(param(req, "id"), adminId, {
        referenceNumber: req.body.referenceNumber,
        note: req.body.note,
      });
      sendSuccess({
        res,
        message: "Order marked as paid",
        data: order,
      });
    }
  ),

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