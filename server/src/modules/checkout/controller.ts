import { Request, Response } from "express";
import { checkoutService } from "./service.js";
import { sendSuccess } from "../../shared/helpers/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { BadRequestError } from "../../shared/errors/AppError.js";
import { prisma } from "../../prisma/client.js";
import { calculateShipping, CalculatorItem } from "./shippingCalculator.js";

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

  verifyRazorpayPayment: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const sessionId = req.headers["x-session-id"] as string | undefined;
      const result = await checkoutService.verifyRazorpayPayment({
        ...req.body,
        sessionId,
      });
      sendSuccess({
        res,
        message: "Payment verified successfully",
        data: result,
      });
    }
  ),

  // POST /api/checkout/calculate-shipping  — Public, secure shipping preview
  getShippingPreview: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { cartItems, shipState } = req.body as {
        cartItems: { productId: string; variantId?: string; quantity: number }[];
        shipState: string;
      };

      if (!shipState || shipState.trim() === "") {
        throw new BadRequestError("Shipping state is required");
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        sendSuccess({ res, data: { shippingCharge: 0 } });
        return;
      }

      // Collect unique product and variant IDs from the request
      const productIds = [...new Set(cartItems.map((item) => item.productId))];
      const variantIds = [
        ...new Set(
          cartItems
            .map((item) => item.variantId)
            .filter((id): id is string => !!id)
        ),
      ];

      // Load products and variants in parallel from the database
      const [dbProducts, dbVariants] = await Promise.all([
        prisma.product.findMany({
          where: {
            id: { in: productIds },
            deletedAt: null,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            shippingCategory: true,
            deliveryIncrement: true,
            additionalUnitIncrement: true,
          },
        }),
        variantIds.length > 0
          ? prisma.productVariant.findMany({
              where: { id: { in: variantIds }, isActive: true },
              select: {
                id: true,
                productId: true,
                name: true,
                shippingCategory: true,
                deliveryIncrement: true,
                additionalUnitIncrement: true,
              },
            })
          : Promise.resolve([]),
      ]);

      const calculatorItems: CalculatorItem[] = [];
      for (const item of cartItems) {
        const dbProd = dbProducts.find((p) => p.id === item.productId);
        if (!dbProd) continue;

        const dbVar = item.variantId
          ? dbVariants.find((v) => v.id === item.variantId)
          : null;

        calculatorItems.push({
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: Math.max(1, Number(item.quantity)),
          product: {
            id: dbProd.id,
            name: dbProd.name,
            shippingCategory: dbProd.shippingCategory,
            deliveryIncrement: dbProd.deliveryIncrement,
            additionalUnitIncrement: dbProd.additionalUnitIncrement,
          },
          variant: dbVar
            ? {
                id: dbVar.id,
                name: dbVar.name,
                shippingCategory: dbVar.shippingCategory,
                deliveryIncrement: dbVar.deliveryIncrement,
                additionalUnitIncrement: dbVar.additionalUnitIncrement,
              }
            : null,
        });
      }

      const shippingSettings = await prisma.shippingSetting.findFirst();
      const shippingCharge = calculateShipping(
        calculatorItems,
        shipState,
        shippingSettings
      );

      sendSuccess({
        res,
        data: {
          shippingCharge: Number(shippingCharge.toFixed(2)),
        },
      });
    }
  ),
};