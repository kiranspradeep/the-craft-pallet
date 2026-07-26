import { Router } from "express";
import { settingsController } from "./controller.js";
import { authenticateAdmin } from "../auth/middleware.js";
import { requireRole } from "../auth/middleware.js";
import { validate } from "../../../shared/validators/validate.js";
import {
  updateBusinessSettingsSchema,
  updatePaymentSettingsSchema,
  updateShippingSettingsSchema,
  updateWhatsAppSettingsSchema,
  updateImageRetentionSettingsSchema,
} from "./validator.js";

const router = Router();

// All settings routes require authentication
router.use(authenticateAdmin);

// ── Business ───────────────────────────────────────────────────────────────
router.get("/business", settingsController.getBusinessSettings);
router.put(
  "/business",
  requireRole("SUPERADMIN", "ADMIN"),
  validate(updateBusinessSettingsSchema),
  settingsController.updateBusinessSettings
);

// ── Payment ────────────────────────────────────────────────────────────────
router.get("/payment", settingsController.getPaymentSettings);
router.put(
  "/payment",
  requireRole("SUPERADMIN"),
  validate(updatePaymentSettingsSchema),
  settingsController.updatePaymentSettings
);

// ── Shipping ───────────────────────────────────────────────────────────────
router.get("/shipping", settingsController.getShippingSettings);
router.put(
  "/shipping",
  requireRole("SUPERADMIN", "ADMIN"),
  validate(updateShippingSettingsSchema),
  settingsController.updateShippingSettings
);

// ── WhatsApp ───────────────────────────────────────────────────────────────
router.get("/whatsapp", settingsController.getWhatsAppSettings);
router.put(
  "/whatsapp",
  requireRole("SUPERADMIN", "ADMIN"),
  validate(updateWhatsAppSettingsSchema),
  settingsController.updateWhatsAppSettings
);

// ── Image Retention ────────────────────────────────────────────────────────
router.get("/image-retention", settingsController.getImageRetentionSettings);
router.put(
  "/image-retention",
  requireRole("SUPERADMIN"),
  validate(updateImageRetentionSettingsSchema),
  settingsController.updateImageRetentionSettings
);

export default router;