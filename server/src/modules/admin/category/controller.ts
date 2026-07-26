import { Request, Response } from "express";
import { categoryService } from "./service.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const categoryController = {
  // POST /api/admin/categories
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await categoryService.create(req.body);
    sendSuccess({
      res,
      message: "Category created successfully",
      data: category,
      statusCode: 201,
    });
  }),

  // GET /api/admin/categories
  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, search, sortBy, sortOrder, isActive } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      sortBy?: "sortOrder" | "name" | "createdAt";
      sortOrder?: "asc" | "desc";
      isActive?: string;
    };

    const result = await categoryService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      sortBy: sortBy ?? "sortOrder",
      sortOrder: sortOrder ?? "asc",
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
    });

    sendSuccess({
      res,
      data: result.categories,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }),

  // GET /api/admin/categories/:id
  getOne: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params["id"] as string;
    const category = await categoryService.findById(id);
    sendSuccess({ res, data: category });
  }),

  // PUT /api/admin/categories/:id
  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params["id"] as string;
    const category = await categoryService.update(id, req.body);
    sendSuccess({
      res,
      message: "Category updated successfully",
      data: category,
    });
  }),

  // DELETE /api/admin/categories/:id  (soft delete)
  softDelete: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = req.params["id"] as string;
      await categoryService.softDelete(id);
      sendSuccess({ res, message: "Category deactivated successfully" });
    }
  ),

  // PATCH /api/admin/categories/:id/restore
  restore: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params["id"] as string;
    const category = await categoryService.restore(id);
    sendSuccess({
      res,
      message: "Category restored successfully",
      data: category,
    });
  }),
};