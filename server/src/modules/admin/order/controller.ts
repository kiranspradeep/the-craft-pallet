import { Request, Response } from "express";
import { orderService } from "./service.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { OrderStatus, ShipmentStatus } from "@prisma/client";

const param = (req: Request, key: string): string =>
  req.params[key] as string;

const adminId = (req: Request): string => req.admin!.id;

export const orderController = {
  // GET /api/admin/orders
  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const q = req.query as Record<string, string>;

    const result = await orderService.findAll({
      page: q["page"] ? parseInt(q["page"], 10) : 1,
      limit: q["limit"] ? parseInt(q["limit"], 10) : 20,
      search: q["search"],
      status: q["status"] as OrderStatus | undefined,
      paymentStatus: q["paymentStatus"],
      customerId: q["customerId"],
      dateFrom: q["dateFrom"],
      dateTo: q["dateTo"],
      sortBy: (q["sortBy"] as any) ?? "createdAt",
      sortOrder: (q["sortOrder"] as any) ?? "desc",
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

  // GET /api/admin/orders/:id
  getOne: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.findById(param(req, "id"));
    sendSuccess({ res, data: order });
  }),

  // PATCH /api/admin/orders/:id/status
  updateStatus: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { status, note } = req.body;
      const order = await orderService.updateStatus(
        param(req, "id"),
        status as OrderStatus,
        adminId(req),
        note
      );
      sendSuccess({
        res,
        message: "Order status updated",
        data: order,
      });
    }
  ),

  // POST /api/admin/orders/:id/verify-payment
  verifyPayment: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const order = await orderService.verifyPayment(
        param(req, "id"),
        adminId(req),
        req.body
      );
      sendSuccess({
        res,
        message: req.body.approved
          ? "Payment approved and order confirmed"
          : "Payment rejected",
        data: order,
      });
    }
  ),

  // PATCH /api/admin/orders/:id/shipment
  assignShipment: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const order = await orderService.assignShipment(
        param(req, "id"),
        adminId(req),
        req.body
      );
      sendSuccess({
        res,
        message: "Shipment assigned and order marked as shipped",
        data: order,
      });
    }
  ),

  // PATCH /api/admin/orders/:id/shipment/status
  updateShipmentStatus: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const order = await orderService.updateShipmentStatus(
        param(req, "id"),
        adminId(req),
        {
          status: req.body.status as ShipmentStatus,
          note: req.body.note,
        }
      );
      sendSuccess({
        res,
        message: "Shipment status updated",
        data: order,
      });
    }
  ),

  // PATCH /api/admin/orders/:id/cancel
  cancelOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const order = await orderService.cancelOrder(
        param(req, "id"),
        adminId(req),
        req.body.reason
      );
      sendSuccess({ res, message: "Order cancelled", data: order });
    }
  ),

  // POST /api/admin/orders/:id/refund
  refundOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const order = await orderService.refundOrder(
        param(req, "id"),
        adminId(req),
        req.body
      );
      sendSuccess({ res, message: "Refund recorded", data: order });
    }
  ),

  // POST /api/admin/orders/:id/notes
  addNote: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const order = await orderService.addNote(
        param(req, "id"),
        adminId(req),
        req.body
      );
      sendSuccess({ res, message: "Note added", data: order });
    }
  ),

  // GET /api/admin/shipping-partners
  getShippingPartners: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const partners = await orderService.getShippingPartners();
      sendSuccess({ res, data: partners });
    }
  ),
};