import { Router } from "express";
import { assetController } from "./controller.js";
import { validate } from "../../shared/validators/validate.js";
import {
  uploadDriveLinkSchema,
  assetIdSchema,
  reorderFilesSchema,
} from "./validator.js";
import {
  imageUpload,
  zipUpload,
} from "../../shared/utils/multer.js";

const router = Router();

// ── Upload ────────────────────────────────────────────────────────────────

// Direct image upload — up to 50 files
router.post(
  "/upload",
  imageUpload.array("files", 50),
  assetController.uploadDirect
);

// ZIP upload — single file
router.post(
  "/upload-zip",
  zipUpload.single("file"),
  assetController.uploadZip
);

// Google Drive link
router.post(
  "/upload-drive-link",
  validate(uploadDriveLinkSchema),
  assetController.uploadDriveLink
);

// ── Asset Management ──────────────────────────────────────────────────────

router.get("/:id", validate(assetIdSchema), assetController.getOne);

router.delete("/:id", validate(assetIdSchema), assetController.delete);

router.post(
  "/:id/reorder",
  validate(reorderFilesSchema),
  assetController.reorder
);

export default router;