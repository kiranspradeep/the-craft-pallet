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

// No authentication — guest cart via session ID header

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

router.post(
  "/apply-coupon",
  validate(applyCouponSchema),
  cartController.applyCoupon
);

export default router;