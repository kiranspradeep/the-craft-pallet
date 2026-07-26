import { Router } from "express";
import { orderController } from "./controller.js";
import { authenticateAdmin } from "../auth/middleware.js";
import { validate } from "../../../shared/validators/validate.js";
import {
  listOrdersSchema,
  orderIdSchema,
  updateStatusSchema,
  assignShipmentSchema,
  cancelOrderSchema,
  refundOrderSchema,
  verifyPaymentSchema,
  addNoteSchema,
  updateShipmentStatusSchema,
} from "./validator.js";

const router = Router();

router.use(authenticateAdmin);

// ── Orders ────────────────────────────────────────────────────────────────
router.get(
  "/",
  validate(listOrdersSchema),
  orderController.list
);

router.get(
  "/:id",
  validate(orderIdSchema),
  orderController.getOne
);

router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  orderController.updateStatus
);

router.post(
  "/:id/verify-payment",
  validate(verifyPaymentSchema),
  orderController.verifyPayment
);

router.patch(
  "/:id/shipment",
  validate(assignShipmentSchema),
  orderController.assignShipment
);

router.patch(
  "/:id/shipment/status",
  validate(updateShipmentStatusSchema),
  orderController.updateShipmentStatus
);

router.patch(
  "/:id/cancel",
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

router.post(
  "/:id/refund",
  validate(refundOrderSchema),
  orderController.refundOrder
);

router.post(
  "/:id/notes",
  validate(addNoteSchema),
  orderController.addNote
);

// ── Shipping Partners ─────────────────────────────────────────────────────
router.get(
  "/shipping-partners/list",
  orderController.getShippingPartners
);

export default router;