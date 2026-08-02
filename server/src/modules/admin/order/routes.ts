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
} from "./validator.js";

const router = Router();

router.use(authenticateAdmin);

// ── Stats & Queue — must be before /:id routes ────────────────────────────
router.get("/stats", orderController.getStats);
router.get("/production-queue", orderController.getProductionQueue);

// ── List & Detail ─────────────────────────────────────────────────────────
router.get("/", validate(listOrdersSchema), orderController.list);
router.get("/:id", validate(orderIdSchema), orderController.getOne);

// ── Status & Production ───────────────────────────────────────────────────
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

// ── Notes ─────────────────────────────────────────────────────────────────
router.patch(
  "/:id/note",
  validate(addNoteSchema),
  orderController.addNote
);

// ── Payment ───────────────────────────────────────────────────────────────
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

export default router;