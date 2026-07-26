import { Router } from "express";
import { checkoutController } from "./controller.js";
import { validate } from "../../shared/validators/validate.js";
import { checkoutSchema } from "./validator.js";

const router = Router();

// POST /api/checkout
router.post("/", validate(checkoutSchema), checkoutController.placeOrder);

// GET /api/checkout/track/:orderNumber?phone=9876543210
router.get("/track/:orderNumber", checkoutController.trackOrder);

export default router;