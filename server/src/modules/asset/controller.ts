import { Request, Response } from "express";
import { assetService } from "./service.js";
import { sendSuccess } from "../../shared/helpers/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { prisma } from "../../prisma/client.js";

// Load product constraints from DB if productId is provided
const loadConstraints = async (productId?: string) => {
  if (!productId) return {};
  const config = await prisma.productConfiguration.findUnique({
    where: { productId },
  });
  if (!config) return {};
  return {
    maxImages: config.maxImages,
    minImages: config.minImages,
    maxFileSizeMb: config.maxFileSizeMb,
    maxZipSizeMb: config.maxZipSizeMb,
    allowedExtensions: config.allowedExtensions,
    allowDuplicateImages: config.allowDuplicateImages,
  };
};

const param = (req: Request, key: string): string =>
  req.params[key] as string;

export const assetController = {
  // POST /api/assets/upload
  uploadDirect: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const files = req.files as Express.Multer.File[];
      const productId = req.body?.productId as string | undefined;
      const constraints = await loadConstraints(productId);

      const asset = await assetService.uploadDirect(files, constraints);

      sendSuccess({
        res,
        message: "Files uploaded successfully",
        data: asset,
        statusCode: 201,
      });
    }
  ),

  // POST /api/assets/upload-zip
  uploadZip: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const file = req.file as Express.Multer.File;
      const productId = req.body?.productId as string | undefined;
      const constraints = await loadConstraints(productId);

      const asset = await assetService.uploadZip(file, constraints);

      sendSuccess({
        res,
        message: "ZIP uploaded and extracted successfully",
        data: asset,
        statusCode: 201,
      });
    }
  ),

  // POST /api/assets/upload-drive-link
  uploadDriveLink: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { driveUrl } = req.body;
      const asset = await assetService.uploadDriveLink(driveUrl);

      sendSuccess({
        res,
        message: "Google Drive link queued for download",
        data: asset,
        statusCode: 201,
      });
    }
  ),

  // GET /api/assets/:id
  getOne: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const asset = await assetService.findById(param(req, "id"));
      sendSuccess({ res, data: asset });
    }
  ),

  // DELETE /api/assets/:id
  delete: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await assetService.delete(param(req, "id"));
      sendSuccess({ res, message: "Asset deleted successfully" });
    }
  ),

  // POST /api/assets/:id/reorder
  reorder: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const asset = await assetService.reorder(
        param(req, "id"),
        req.body.files
      );
      sendSuccess({ res, message: "Files reordered successfully", data: asset });
    }
  ),
};