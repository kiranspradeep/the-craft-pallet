import { Router } from "express";
import { checkoutController } from "./controller.js";
import { validate } from "../../shared/validators/validate.js";
import {
  checkoutSchema,
  draftCheckoutSchema,
  createBuyNowSchema,
  buyNowIdSchema,
  updateBuyNowSchema,
  verifyRazorpaySchema,
} from "./validator.js";

const router = Router();

// Buy Now temp sessions
router.post(
  "/buy-now",
  validate(createBuyNowSchema),
  checkoutController.createBuyNow
);
router.get(
  "/buy-now/:id",
  validate(buyNowIdSchema),
  checkoutController.getBuyNow
);
router.patch(
  "/buy-now/:id",
  validate(updateBuyNowSchema),
  checkoutController.updateBuyNow
);

// WhatsApp draft
router.post(
  "/draft",
  validate(draftCheckoutSchema),
  checkoutController.placeDraftOrder
);

// Website order
router.post("/", validate(checkoutSchema), checkoutController.placeOrder);

// Order tracking
router.get("/track/:orderNumber", checkoutController.trackOrder);

// POST /api/checkout/razorpay-order/:orderNumber
router.post(
  "/razorpay-order/:orderNumber",
  checkoutController.createRazorpayOrder
);

router.post(
  "/razorpay-verify",
  validate(verifyRazorpaySchema),
  checkoutController.verifyRazorpayPayment
);

export default router;