import { Request, Response } from "express";
import { settingsService } from "./service.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const settingsController = {
  // ── Business ───────────────────────────────────────────────────────────

  getBusinessSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.getBusinessSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  updateBusinessSettings: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.updateBusinessSettings(req.body);
      sendSuccess({
        res,
        message: "Business settings updated",
        data: settings,
      });
    }
  ),

  // ── Payment ────────────────────────────────────────────────────────────

  getPaymentSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.getPaymentSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  updatePaymentSettings: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.updatePaymentSettings(req.body);
      sendSuccess({
        res,
        message: "Payment settings updated",
        data: settings,
      });
    }
  ),

  // ── Shipping ───────────────────────────────────────────────────────────

  getShippingSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.getShippingSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  updateShippingSettings: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.updateShippingSettings(req.body);
      sendSuccess({
        res,
        message: "Shipping settings updated",
        data: settings,
      });
    }
  ),

  // ── WhatsApp ───────────────────────────────────────────────────────────

  getWhatsAppSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.getWhatsAppSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  updateWhatsAppSettings: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.updateWhatsAppSettings(req.body);
      sendSuccess({
        res,
        message: "WhatsApp settings updated",
        data: settings,
      });
    }
  ),

  // ── Image Retention ────────────────────────────────────────────────────

  getImageRetentionSettings: asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const settings = await settingsService.getImageRetentionSettings();
      sendSuccess({ res, data: settings });
    }
  ),

  updateImageRetentionSettings: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const settings =
        await settingsService.updateImageRetentionSettings(req.body);
      sendSuccess({
        res,
        message: "Image retention settings updated",
        data: settings,
      });
    }
  ),
};