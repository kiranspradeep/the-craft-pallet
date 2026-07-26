import { Router } from "express";
import { publicController } from "./controller.js";
import { validate } from "../../shared/validators/validate.js";
import {
  listPublicProductsSchema,
  productSlugSchema,
  categorySlugSchema,
  trackOrderSchema,
} from "./validator.js";

const router = Router();

// ── Categories ────────────────────────────────────────────────────────────
router.get("/categories", publicController.getCategories);
router.get(
  "/categories/:slug",
  validate(categorySlugSchema),
  publicController.getCategoryBySlug
);

// ── Products ──────────────────────────────────────────────────────────────
router.get(
  "/products",
  validate(listPublicProductsSchema),
  publicController.getProducts
);
router.get(
  "/products/:slug",
  validate(productSlugSchema),
  publicController.getProductBySlug
);

// ── Settings ──────────────────────────────────────────────────────────────
router.get("/settings/business", publicController.getBusinessSettings);
router.get("/settings/shipping", publicController.getShippingSettings);
router.get("/settings/whatsapp", publicController.getWhatsAppSettings);

// ── Order Tracking ────────────────────────────────────────────────────────
router.get(
  "/orders/track/:orderNumber",
  validate(trackOrderSchema),
  publicController.trackOrder
);

export default router;