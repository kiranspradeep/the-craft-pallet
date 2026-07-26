import path from "path";
import fs from "fs";

// Base upload directory — all files stored here
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Sub-directories
export const DIRS = {
  originals: path.join(UPLOAD_DIR, "originals"),
  thumbnails: path.join(UPLOAD_DIR, "thumbnails"),
  zips: path.join(UPLOAD_DIR, "zips"),
  extracted: path.join(UPLOAD_DIR, "extracted"),
};

// Ensure all directories exist on startup
export const ensureUploadDirs = (): void => {
  Object.values(DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Build a public-accessible URL for a stored file
export const buildFileUrl = (storagePath: string): string => {
  const base = process.env.BASE_URL || "http://localhost:4000";
  // Normalize backslashes on Windows
  const normalized = storagePath.replace(/\\/g, "/");
  return `${base}/${normalized}`;
};