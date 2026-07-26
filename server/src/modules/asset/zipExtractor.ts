import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";
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
 * Extracts image files from a ZIP archive.
 * Ignores system files (e.g. __MACOSX, .DS_Store).
 * Returns list of extracted file info.
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

  for (const entry of entries) {
    // Skip directories and macOS system files
    if (entry.isDirectory) continue;
    if (entry.entryName.startsWith("__MACOSX")) continue;
    if (path.basename(entry.entryName).startsWith(".")) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!allowed.includes(ext)) continue;

    const storedName = `${uuidv4()}${ext}`;
    const destPath = path.join(DIRS.extracted, storedName);

    // Write entry to disk
    const data = entry.getData();
    fs.writeFileSync(destPath, data);

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
  }

  return extracted;
};