// src/modules/asset/imageProcessor.ts
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { DIRS } from "../../shared/utils/storage.js";

export interface ProcessedResult {
  width: number;
  height: number;
  previewPath: string;
  previewStoredName: string;
  optimizedSize: number;
}

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

// High-fidelity resolution ceiling (4K limit) for prints.
// 3840px is more than enough for razor-sharp wood/acrylic prints up to poster sizes.
const ORIGINAL_MAX_WIDTH = 3840; 
const ORIGINAL_QUALITY = 90; // High quality threshold for visually lossless clarity

/**
 * Optimizes the original image in place and generates a web preview thumbnail in parallel.
 * Keeps color management ICC profiles intact to prevent print discoloration.
 */
export const processAndOptimizeImage = async (
  originalPath: string
): Promise<ProcessedResult> => {
  // Read metadata and setup initial Sharp instance
  const pipeline = sharp(originalPath).rotate(); // auto-rotate via EXIF orientation
  const metadata = await pipeline.metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const previewName = `${uuidv4()}_thumb.jpg`;
  const previewPath = path.join(DIRS.thumbnails, previewName);

  // 1. Generate Web Preview Thumbnail (Executed in parallel)
  const thumbnailPromise = pipeline
    .clone()
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMBNAIL_QUALITY, mozjpeg: true })
    .toFile(previewPath);

  // 2. Compress original file in-place, stripping GPS/camera info but preserving color space mapping
  const tempOriginalPath = `${originalPath}.tmp`;
  let originalPipeline = pipeline.clone();

  if (width > ORIGINAL_MAX_WIDTH) {
    originalPipeline = originalPipeline.resize({
      width: ORIGINAL_MAX_WIDTH,
      withoutEnlargement: true,
    });
  }

  const ext = path.extname(originalPath).toLowerCase();
  
  if (ext === ".png") {
    // PNG output optimization
    await originalPipeline
      .png({ compressionLevel: 8, palette: true })
      .toFile(tempOriginalPath);
  } else {
    // High-clarity progressive JPEG conversion (Mozjpeg algorithm)
    await originalPipeline
      .withMetadata() // Crucial: Keeps ICC Color profiles so prints don't look washed out
      .jpeg({
        quality: ORIGINAL_QUALITY,
        progressive: true,
        mozjpeg: true,
      })
      .toFile(tempOriginalPath);
  }

  // Await thumbnail generation
  await thumbnailPromise;

  // Atomically replace old bloated file with optimized original
  fs.renameSync(tempOriginalPath, originalPath);
  const stats = fs.statSync(originalPath);

  // Compute scale proportions if resized
  let finalWidth = width;
  let finalHeight = height;
  if (width > ORIGINAL_MAX_WIDTH) {
    finalWidth = ORIGINAL_MAX_WIDTH;
    finalHeight = Math.round(height * (ORIGINAL_MAX_WIDTH / width));
  }

  return {
    width: finalWidth,
    height: finalHeight,
    previewPath: `uploads/thumbnails/${previewName}`,
    previewStoredName: previewName,
    optimizedSize: stats.size,
  };
};

/**
 * Fast metadata query — no image mutations.
 */
export const readImageMetadata = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
};