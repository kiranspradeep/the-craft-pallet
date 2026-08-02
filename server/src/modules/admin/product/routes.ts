import { Router } from "express";
import { productController } from "./controller.js";
import { authenticateAdmin } from "../auth/middleware.js";
import { validate } from "../../../shared/validators/validate.js";
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  productIdSchema,
  addImageSchema,
  deleteImageSchema,
  reorderImagesSchema,
  createVariantSchema,
  updateVariantSchema,
  variantIdSchema,
  upsertConfigurationSchema,
  upsertPricingSchema,
  createPricingTierSchema,
  updatePricingTierSchema,
  tierIdSchema,
  createCustomFieldSchema,
  updateCustomFieldSchema,
  fieldIdSchema,
  reorderCustomFieldsSchema,
  createCustomFieldOptionSchema,
  updateCustomFieldOptionSchema,
  optionIdSchema,
} from "./validator.js";

const router = Router();

router.use(authenticateAdmin);

// ── Core ──────────────────────────────────────────────────────────────────
router.post("/", validate(createProductSchema), productController.create);
router.get("/", validate(listProductsSchema), productController.list);
router.get("/:id", validate(productIdSchema), productController.getOne);
router.put("/:id", validate(updateProductSchema), productController.update);
router.delete("/:id", validate(productIdSchema), productController.softDelete);

// ── Images ────────────────────────────────────────────────────────────────
router.post(
  "/:id/images",
  validate(addImageSchema),
  productController.addImage
);
router.delete(
  "/:id/images/:imageId",
  validate(deleteImageSchema),
  productController.deleteImage
);
router.put(
  "/:id/images/reorder",
  validate(reorderImagesSchema),
  productController.reorderImages
);

// ── Variants ──────────────────────────────────────────────────────────────
router.post(
  "/:id/variants",
  validate(createVariantSchema),
  productController.createVariant
);
router.put(
  "/:id/variants/:variantId",
  validate(updateVariantSchema),
  productController.updateVariant
);
router.delete(
  "/:id/variants/:variantId",
  validate(variantIdSchema),
  productController.deleteVariant
);

// ── Configuration ─────────────────────────────────────────────────────────
router.put(
  "/:id/configuration",
  validate(upsertConfigurationSchema),
  productController.upsertConfiguration
);

// ── Pricing ───────────────────────────────────────────────────────────────
router.put(
  "/:id/pricing",
  validate(upsertPricingSchema),
  productController.upsertPricing
);

// ── Pricing Tiers ─────────────────────────────────────────────────────────
router.post(
  "/:id/pricing/tiers",
  validate(createPricingTierSchema),
  productController.createPricingTier
);
router.put(
  "/:id/pricing/tiers/:tierId",
  validate(updatePricingTierSchema),
  productController.updatePricingTier
);
router.delete(
  "/:id/pricing/tiers/:tierId",
  validate(tierIdSchema),
  productController.deletePricingTier
);

// ── Custom Fields ─────────────────────────────────────────────────────────
router.post(
  "/:id/custom-fields",
  validate(createCustomFieldSchema),
  productController.createCustomField
);
router.put(
  "/:id/custom-fields/reorder",
  validate(reorderCustomFieldsSchema),
  productController.reorderCustomFields
);
router.put(
  "/:id/custom-fields/:fieldId",
  validate(updateCustomFieldSchema),
  productController.updateCustomField
);
router.delete(
  "/:id/custom-fields/:fieldId",
  validate(fieldIdSchema),
  productController.deleteCustomField
);

// ── Custom Field Options ──────────────────────────────────────────────────
router.post(
  "/:id/custom-fields/:fieldId/options",
  validate(createCustomFieldOptionSchema),
  productController.createCustomFieldOption
);
router.put(
  "/:id/custom-fields/:fieldId/options/:optionId",
  validate(updateCustomFieldOptionSchema),
  productController.updateCustomFieldOption
);
router.delete(
  "/:id/custom-fields/:fieldId/options/:optionId",
  validate(optionIdSchema),
  productController.deleteCustomFieldOption
);

export default router;