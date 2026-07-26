import { Request, Response } from "express";
import { publicService } from "./service.js";
import { sendSuccess } from "../../shared/helpers/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { BadRequestError } from "../../shared/errors/AppError.js";

const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const publicController = {
  // GET /api/categories
  getCategories: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const categories = await publicService.getCategories();
      sendSuccess({ res, data: categories });
    }
  ),

  // GET /api/categories/:slug
  getCategoryBySlug: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const category = await publicService.getCategoryBySlug(
        param(req, "slug")
      );
      sendSuccess({ res, data: category });
    }
  ),

  // GET /api/products
  getProducts: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const q = req.query as Record<string, string>;

      const result = await publicService.getProducts({
        page: q["page"] ? parseInt(q["page"], 10) : 1,
        limit: q["limit"] ? parseInt(q["limit"], 10) : 20,
        search: q["search"],
        category: q["category"],
        featured:
          q["featured"] === "true"
            ? true
            : q["featured"] === "false"
            ? false
            : undefined,
        sortBy: q["sortBy"] ?? "sortOrder",
        sortOrder: q["sortOrder"] ?? "asc",
      });

      sendSuccess({
        res,
        data: result.products,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    }
  ),

  // GET /api/products/:slug
  getProductBySlug: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const product = await publicService.getProductBySlug(param(req, "slug"));
      sendSuccess({ res, data: product });
    }
  ),

  // GET /api/settings/business
  getBusinessSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await publicService.getBusinessSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  // GET /api/settings/shipping
  getShippingSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await publicService.getShippingSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  // GET /api/settings/whatsapp
  getWhatsAppSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await publicService.getWhatsAppSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  // GET /api/orders/track/:orderNumber?phone=
  trackOrder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const orderNumber = param(req, "orderNumber");
      const phone = req.query["phone"] as string;

      if (!phone) {
        throw new BadRequestError(
          "Phone number is required to track your order"
        );
      }

      const order = await publicService.trackOrder(orderNumber, phone);
      sendSuccess({ res, data: order });
    }
  ),
};