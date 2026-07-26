import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { DIRS } from "../../shared/utils/storage.js";

export interface ImageMetadata {
  width: number;
  height: number;
  previewPath: string;
  previewStoredName: string;
}

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

/**
 * Given the path to an original uploaded image:
 * 1. Read metadata (width, height)
 * 2. Generate a compressed JPEG thumbnail
 * Returns paths and dimensions.
 */
export const processImage = async (
  originalPath: string
): Promise<ImageMetadata> => {
  const image = sharp(originalPath);
  const meta = await image.metadata();

  const previewName = `${uuidv4()}_thumb.jpg`;
  const previewPath = path.join(DIRS.thumbnails, previewName);

  await image
    .rotate() // auto-rotate from EXIF
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMBNAIL_QUALITY })
    .toFile(previewPath);

  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    previewPath: `uploads/thumbnails/${previewName}`,
    previewStoredName: previewName,
  };
};

/**
 * Read only metadata — no thumbnail generation.
 */
export const readImageMetadata = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
};