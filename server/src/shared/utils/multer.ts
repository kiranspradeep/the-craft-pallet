import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { DIRS } from "./storage.js";
import { BadRequestError } from "../errors/AppError.js";

// ── Image Upload ──────────────────────────────────────────────────────────

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, DIRS.originals);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Default 20 MB — overridden per-product via config check in service
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

export const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`File type not allowed: ${ext}`));
    }
  },
});

// ── ZIP Upload ────────────────────────────────────────────────────────────

const zipStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, DIRS.zips);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const MAX_ZIP_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB default

export const zipUpload = multer({
  storage: zipStorage,
  limits: { fileSize: MAX_ZIP_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".zip") {
      cb(null, true);
    } else {
      cb(new BadRequestError("Only ZIP files are allowed"));
    }
  },
});