// src/modules/asset/zipExtractor.ts
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs/promises"; // Use Promise-based FS
import { v4 as uuidv4 } from "uuid";
import { DIRS } from "../../shared/utils/storage.js";

export interface ExtractedFile {
  originalName: string;
  storedName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
}

const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
];

/**
 * Extracts and processes files out of a zip archive asynchronously.
 * Prevents main thread blocking.
 */
export const extractZip = async (
  zipFilePath: string,
  allowedExtensions?: string[]
): Promise<ExtractedFile[]> => {
  const zip = new AdmZip(zipFilePath);
  const entries = zip.getEntries();
  const extracted: ExtractedFile[] = [];

  const allowed =
    allowedExtensions && allowedExtensions.length > 0
      ? allowedExtensions.map((e) => e.toLowerCase())
      : ALLOWED_IMAGE_EXTENSIONS;

  const writePromises = entries.map(async (entry) => {
    // Filter system directories or metadata files
    if (entry.isDirectory) return;
    if (entry.entryName.startsWith("__MACOSX")) return;
    if (path.basename(entry.entryName).startsWith(".")) return;

    const ext = path.extname(entry.name).toLowerCase();
    if (!allowed.includes(ext)) return;

    const storedName = `${uuidv4()}${ext}`;
    const destPath = path.join(DIRS.extracted, storedName);

    const data = entry.getData(); // CPU bound read operation
    
    // Write out the file using async unblocked filesystem worker thread
    await fs.writeFile(destPath, data);

    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".heic": "image/heic",
      ".heif": "image/heif",
    };

    extracted.push({
      originalName: entry.name,
      storedName,
      storagePath: `uploads/extracted/${storedName}`,
      mimeType: mimeMap[ext] ?? "application/octet-stream",
      fileSize: data.length,
    });
  });

  await Promise.all(writePromises);
  return extracted;
};