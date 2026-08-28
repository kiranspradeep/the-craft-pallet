// src/modules/asset/controller.ts
import { Request, Response } from "express";
import { assetService } from "./service.js";
import { sendSuccess } from "../../shared/helpers/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { prisma } from "../../prisma/client.js";

/**
 * Loads and merges global ImageRetentionSetting with product-level ProductConfiguration.
 *
 * Priority:
 *   1. Product-specific constraints (if productId is provided and config exists)
 *   2. Global ImageRetentionSetting (fallback defaults from admin panel)
 *   3. Hardcoded safe defaults (last resort if DB has no records yet)
 */
const loadConstraints = async (productId?: string) => {
  // ── 1. Fetch global retention / upload settings ──────────────────────
  const globalSettings = await prisma.imageRetentionSetting.findFirst();

  // Convert MIME types → file extensions for validation
  const globalExtensions =
    globalSettings?.allowedMimeTypes && globalSettings.allowedMimeTypes.length > 0
      ? globalSettings.allowedMimeTypes.map((mime) => {
          const ext = mime.split("/")[1];
          return ext === "jpeg" ? ".jpg" : `.${ext}`;
        })
      : [".jpg", ".jpeg", ".png", ".webp"];

  // Base constraints from global settings (or safe defaults)
  const base = {
    maxImages: null as number | null,
    minImages: null as number | null,
    maxFileSizeMb: globalSettings?.maxUploadSizeMb ?? 500,
    maxZipSizeMb: globalSettings?.maxUploadSizeMb ?? 500,
    allowedExtensions: globalExtensions,
    allowDuplicateImages: false,
  };

  // ── 2. If no productId, return global-only constraints ───────────────
  if (!productId) return base;

  // ── 3. Fetch product-specific configuration ──────────────────────────
  const config = await prisma.productConfiguration.findUnique({
    where: { productId },
  });

  if (!config) return base;

  // ── 4. Merge — product values override global where present ──────────
  return {
    maxImages: config.maxImages ?? base.maxImages,
    minImages: config.minImages ?? base.minImages,
    maxFileSizeMb: config.maxFileSizeMb ?? base.maxFileSizeMb,
    maxZipSizeMb: config.maxZipSizeMb ?? base.maxZipSizeMb,
    allowedExtensions:
      config.allowedExtensions && config.allowedExtensions.length > 0
        ? config.allowedExtensions
        : base.allowedExtensions,
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
      sendSuccess({
        res,
        message: "Files reordered successfully",
        data: asset,
      });
    }
  ),
};