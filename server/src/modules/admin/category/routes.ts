import { Router } from "express";
import { categoryController } from "./controller.js";
import { authenticateAdmin } from "../auth/middleware.js";
import { validate } from "../../../shared/validators/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  listCategoriesSchema,
} from "./validator.js";

const router = Router();

// All category routes require authentication
router.use(authenticateAdmin);

router.post(
  "/",
  validate(createCategorySchema),
  categoryController.create
);

router.get(
  "/",
  validate(listCategoriesSchema),
  categoryController.list
);

router.get(
  "/:id",
  validate(categoryIdSchema),
  categoryController.getOne
);

router.put(
  "/:id",
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  "/:id",
  validate(categoryIdSchema),
  categoryController.softDelete
);

router.patch(
  "/:id/restore",
  validate(categoryIdSchema),
  categoryController.restore
);

export default router;