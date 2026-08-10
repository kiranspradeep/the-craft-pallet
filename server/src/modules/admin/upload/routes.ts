import { Router } from "express";
import multer from "multer";
import { adminUploadController } from "./controller.js";
import { authenticateAdmin } from "../auth/middleware.js";

const router = Router();

// Memory storage — files go directly to Cloudinary, not to disk
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

// All admin uploads require authentication
router.use(authenticateAdmin);

// POST /api/admin/upload
router.post(
  "/",
  memoryUpload.array("files", 10),
  adminUploadController.uploadImages
);

export default router;