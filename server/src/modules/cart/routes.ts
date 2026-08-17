import { Router } from "express";
import { cartController } from "./controller.js";
import { validate } from "../../shared/validators/validate.js";
import {
  addItemSchema,
  updateItemSchema,
  itemIdSchema,
  applyCouponSchema,
} from "./validator.js";

const router = Router();

router.get("/", cartController.getCart);

router.post(
  "/items",
  validate(addItemSchema),
  cartController.addItem
);

router.put(
  "/items/:itemId",
  validate(updateItemSchema),
  cartController.updateItem
);

router.delete(
  "/items/:itemId",
  validate(itemIdSchema),
  cartController.removeItem
);

// Link an uploaded asset to a specific PHOTO_UPLOAD field on a cart item
router.patch(
  "/items/:itemId/upload-fields/:customizationId/asset",
  cartController.linkAssetToUploadField
);

router.post(
  "/apply-coupon",
  validate(applyCouponSchema),
  cartController.applyCoupon
);

export default router;