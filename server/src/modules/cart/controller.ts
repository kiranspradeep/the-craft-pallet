import { Request, Response } from "express";
import { cartService } from "./service.js";
import { sendSuccess } from "../../shared/helpers/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { BadRequestError } from "../../shared/errors/AppError.js";

// Session ID comes from X-Session-Id header
const getSessionId = (req: Request): string => {
  const sessionId = req.headers["x-session-id"] as string;
  if (!sessionId) {
    throw new BadRequestError("X-Session-Id header is required");
  }
  return sessionId;
};

const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const cartController = {
  // GET /api/cart
  getCart: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sessionId = getSessionId(req);
    const { cart, totals } = await cartService.getCart(sessionId);
    sendSuccess({
      res,
      data: { cart, totals },
    });
  }),

  // POST /api/cart/items
  addItem: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sessionId = getSessionId(req);
    const cart = await cartService.addItem(sessionId, req.body);
    sendSuccess({
      res,
      message: "Item added to cart",
      data: cart,
      statusCode: 201,
    });
  }),

  // PUT /api/cart/items/:itemId
  updateItem: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);
      const cart = await cartService.updateItem(
        sessionId,
        param(req, "itemId"),
        req.body
      );
      sendSuccess({ res, message: "Cart item updated", data: cart });
    }
  ),

  // DELETE /api/cart/items/:itemId
  removeItem: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);
      const cart = await cartService.removeItem(
        sessionId,
        param(req, "itemId")
      );
      sendSuccess({ res, message: "Item removed from cart", data: cart });
    }
  ),

  // POST /api/cart/apply-coupon
  applyCoupon: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = getSessionId(req);
      const { code } = req.body;
      const result = await cartService.applyCoupon(sessionId, code);
      sendSuccess({ res, data: result });
    }
  ),
};