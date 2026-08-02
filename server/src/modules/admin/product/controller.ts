import { Request, Response } from "express";
import { productService } from "./service.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const productController = {
  // ── Core ──────────────────────────────────────────────────────────────

  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await productService.create(req.body);
    sendSuccess({
      res,
      message: "Product created successfully",
      data: product,
      statusCode: 201,
    });
  }),

  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const q = req.query as Record<string, string>;
    const result = await productService.findAll({
      page: q["page"] ? parseInt(q["page"], 10) : 1,
      limit: q["limit"] ? parseInt(q["limit"], 10) : 20,
      search: q["search"],
      categoryId: q["categoryId"],
      isActive:
        q["isActive"] === "true"
          ? true
          : q["isActive"] === "false"
          ? false
          : undefined,
      isFeatured:
        q["isFeatured"] === "true"
          ? true
          : q["isFeatured"] === "false"
          ? false
          : undefined,
      sortBy: (q["sortBy"] as any) ?? "sortOrder",
      sortOrder: (q["sortOrder"] as any) ?? "asc",
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
  }),

  getOne: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await productService.findById(param(req, "id"));
    sendSuccess({ res, data: product });
  }),

  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await productService.update(param(req, "id"), req.body);
    sendSuccess({
      res,
      message: "Product updated successfully",
      data: product,
    });
  }),

  softDelete: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.softDelete(param(req, "id"));
      sendSuccess({ res, message: "Product deactivated successfully" });
    }
  ),

  // ── Images ────────────────────────────────────────────────────────────

  addImage: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const image = await productService.addImage(param(req, "id"), req.body);
      sendSuccess({
        res,
        message: "Image added successfully",
        data: image,
        statusCode: 201,
      });
    }
  ),

  deleteImage: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.deleteImage(
        param(req, "id"),
        param(req, "imageId")
      );
      sendSuccess({ res, message: "Image deleted successfully" });
    }
  ),

  reorderImages: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.reorderImages(param(req, "id"), req.body.images);
      sendSuccess({ res, message: "Images reordered successfully" });
    }
  ),

  // ── Variants ──────────────────────────────────────────────────────────

  createVariant: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const variant = await productService.createVariant(
        param(req, "id"),
        req.body
      );
      sendSuccess({
        res,
        message: "Variant created successfully",
        data: variant,
        statusCode: 201,
      });
    }
  ),

  updateVariant: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const variant = await productService.updateVariant(
        param(req, "id"),
        param(req, "variantId"),
        req.body
      );
      sendSuccess({
        res,
        message: "Variant updated successfully",
        data: variant,
      });
    }
  ),

  deleteVariant: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.deleteVariant(
        param(req, "id"),
        param(req, "variantId")
      );
      sendSuccess({ res, message: "Variant deleted successfully" });
    }
  ),

  // ── Configuration ──────────────────────────────────────────────────────

  upsertConfiguration: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const config = await productService.upsertConfiguration(
        param(req, "id"),
        req.body
      );
      sendSuccess({
        res,
        message: "Configuration saved successfully",
        data: config,
      });
    }
  ),

  // ── Pricing ────────────────────────────────────────────────────────────

  upsertPricing: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const pricing = await productService.upsertPricing(
        param(req, "id"),
        req.body
      );
      sendSuccess({
        res,
        message: "Pricing saved successfully",
        data: pricing,
      });
    }
  ),

  // ── Pricing Tiers ──────────────────────────────────────────────────────

  createPricingTier: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tier = await productService.createPricingTier(
        param(req, "id"),
        req.body
      );
      sendSuccess({
        res,
        message: "Pricing tier created successfully",
        data: tier,
        statusCode: 201,
      });
    }
  ),

  updatePricingTier: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tier = await productService.updatePricingTier(
        param(req, "id"),
        param(req, "tierId"),
        req.body
      );
      sendSuccess({
        res,
        message: "Pricing tier updated successfully",
        data: tier,
      });
    }
  ),

  deletePricingTier: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.deletePricingTier(
        param(req, "id"),
        param(req, "tierId")
      );
      sendSuccess({ res, message: "Pricing tier deleted successfully" });
    }
  ),

  // ── Custom Fields ──────────────────────────────────────────────────────

  createCustomField: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const field = await productService.createCustomField(
        param(req, "id"),
        req.body
      );
      sendSuccess({
        res,
        message: "Custom field created successfully",
        data: field,
        statusCode: 201,
      });
    }
  ),

  updateCustomField: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const field = await productService.updateCustomField(
        param(req, "id"),
        param(req, "fieldId"),
        req.body
      );
      sendSuccess({
        res,
        message: "Custom field updated successfully",
        data: field,
      });
    }
  ),

  deleteCustomField: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.deleteCustomField(
        param(req, "id"),
        param(req, "fieldId")
      );
      sendSuccess({ res, message: "Custom field deleted successfully" });
    }
  ),

  reorderCustomFields: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.reorderCustomFields(
        param(req, "id"),
        req.body.fields
      );
      sendSuccess({ res, message: "Custom fields reordered successfully" });
    }
  ),

  // ── Custom Field Options ────────────────────────────────────────────────

  createCustomFieldOption: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const option = await productService.createCustomFieldOption(
        param(req, "id"),
        param(req, "fieldId"),
        req.body
      );
      sendSuccess({
        res,
        message: "Option created successfully",
        data: option,
        statusCode: 201,
      });
    }
  ),

  updateCustomFieldOption: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const option = await productService.updateCustomFieldOption(
        param(req, "id"),
        param(req, "fieldId"),
        param(req, "optionId"),
        req.body
      );
      sendSuccess({
        res,
        message: "Option updated successfully",
        data: option,
      });
    }
  ),

  deleteCustomFieldOption: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await productService.deleteCustomFieldOption(
        param(req, "id"),
        param(req, "fieldId"),
        param(req, "optionId")
      );
      sendSuccess({ res, message: "Option deleted successfully" });
    }
  ),
};