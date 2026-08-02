import { Request, Response } from "express";
import { checkoutService } from "./service.js";
import { sendSuccess } from "../../shared/helpers/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { BadRequestError } from "../../shared/errors/AppError.js";

const getSessionId = (req: Request): string => {
  const sessionId = req.headers["x-session-id"] as string;
  if (!sessionId) {
    throw new BadRequestError("X-Session-Id header is required");
  }
  return sessionId;
};

export const checkoutController = {
  // POST /api/checkout                — website order (cart or buy-now)
  placeOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);
      const order = await checkoutService.placeWebsiteOrder({
        sessionId,
        ...req.body,
      });
      sendSuccess({
        res,
        message: "Order placed successfully",
        data: order,
        statusCode: 201,
      });
    }
  ),

  // POST /api/checkout/draft          — WhatsApp draft order
  placeDraftOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);
      const order = await checkoutService.placeWhatsAppDraft({
        sessionId,
        ...req.body,
      });
      sendSuccess({
        res,
        message: "Draft order created — continue on WhatsApp",
        data: order,
        statusCode: 201,
      });
    }
  ),

  // POST /api/checkout/buy-now        — create Buy Now session
  createBuyNow: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);
      const session = await checkoutService.createBuyNowSession({
        sessionId,
        ...req.body,
      });
      sendSuccess({
        res,
        message: "Buy Now session created",
        data: session,
        statusCode: 201,
      });
    }
  ),

  // GET /api/checkout/buy-now/:id     — get session
  getBuyNow: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params["id"] as string;
      const session = await checkoutService.getBuyNowSession(id);
      sendSuccess({ res, data: session });
    }
  ),

  // PATCH /api/checkout/buy-now/:id   — attach asset / customizations
  updateBuyNow: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params["id"] as string;
      const session = await checkoutService.updateBuyNowSession(id, req.body);
      sendSuccess({
        res,
        message: "Session updated",
        data: session,
      });
    }
  ),

  // GET /api/checkout/track/:orderNumber?phone=...
  trackOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const orderNumber = req.params["orderNumber"] as string;
      const phone = req.query["phone"] as string;
      if (!phone) throw new BadRequestError("Phone number required");
      const order = await checkoutService.trackOrder(orderNumber, phone);
      sendSuccess({ res, data: order });
    }
  ),

  createRazorpayOrder: asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderNumber = req.params["orderNumber"] as string;
    const result = await checkoutService.createRazorpayOrder(orderNumber);
    sendSuccess({
      res,
      message: "Razorpay order created",
      data: result,
    });
  }
),
};