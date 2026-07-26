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
  // POST /api/checkout
  placeOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);

      const order = await checkoutService.placeOrder({
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

  // GET /api/checkout/track/:orderNumber
  trackOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const orderNumber = req.params["orderNumber"] as string;
      const phone = req.query["phone"] as string;

      if (!phone) {
        throw new BadRequestError("Phone number is required to track order");
      }

      const order = await checkoutService.trackOrder(orderNumber, phone);

      sendSuccess({ res, data: order });
    }
  ),
};