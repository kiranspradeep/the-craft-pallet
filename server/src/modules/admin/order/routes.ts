import { Router } from "express";
import { orderController } from "./controller.js";
import { authenticateAdmin } from "../auth/middleware.js";
import { validate } from "../../../shared/validators/validate.js";
import {
  listOrdersSchema,
  orderIdSchema,
  updateStatusSchema,
  updateProductionStageSchema,
  addNoteSchema,
  markAsPaidSchema,
  generatePaymentLinkSchema,
  markAsShippedSchema ,
} from "./validator.js";

const router = Router();

router.use(authenticateAdmin);

router.get("/stats", orderController.getStats);
router.get("/production-queue", orderController.getProductionQueue);

router.get("/", validate(listOrdersSchema), orderController.list);
router.get("/:id", validate(orderIdSchema), orderController.getOne);

router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  orderController.updateStatus
);
router.patch(
  "/:id/production-stage",
  validate(updateProductionStageSchema),
  orderController.updateProductionStage
);

// ── Photo status ──────────────────────────────────────────────────────────
router.patch(
  "/:id/photos/received",
  validate(orderIdSchema),
  orderController.markPhotosReceived
);
router.patch(
  "/:id/photos/verified",
  validate(orderIdSchema),
  orderController.markPhotosVerified
);

router.patch(
  "/:id/note",
  validate(addNoteSchema),
  orderController.addNote
);

router.patch(
  "/:id/mark-paid",
  validate(markAsPaidSchema),
  orderController.markAsPaid
);
router.post(
  "/:id/payment-link",
  validate(generatePaymentLinkSchema),
  orderController.generatePaymentLink
);

// ── Download unit photos as ZIP ───────────────────────────────────────────
router.get(
  "/:id/items/:itemId/download",
  orderController.downloadUnitPhotos
);

router.patch(
  "/:id/ship",
  validate(markAsShippedSchema),
  orderController.markAsShipped
);

export default router;