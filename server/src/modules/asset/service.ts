// src/modules/asset/service.ts
import fs from "fs";
import path from "path";
import { AssetSourceType, AssetStatus, JobType } from "@prisma/client";
import { assetRepository } from "./repository.js";
import { processAndOptimizeImage } from "./imageProcessor.js";
import { extractZip } from "./zipExtractor.js";
import { computeFileHash } from "../../shared/utils/fileHash.js";
import { NotFoundError, BadRequestError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/index.js";

// Max concurrent images to process at once. Adjust based on server CPU cores.
const PROCESSING_CONCURRENCY_LIMIT = 4;

interface UploadConstraints {
  maxImages?: number | null;
  minImages?: number | null;
  maxFileSizeMb?: number | null;
  maxZipSizeMb?: number | null;
  allowedExtensions?: string[];
  allowDuplicateImages?: boolean;
}

// ── Controlled Pool Helper ───────────────────────────────────────────
async function runWithPool<T, R>(
  items: T[],
  limit: number,
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  const execute = async () => {
    while (i < items.length) {
      const currentIdx = i++;
      results[currentIdx] = await iteratorFn(items[currentIdx], currentIdx);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, execute);
  await Promise.all(workers);
  return results;
}

const validateFileSize = (
  fileSizeBytes: number,
  maxMb: number | null | undefined
): void => {
  if (!maxMb) return;
  const maxBytes = maxMb * 1024 * 1024;
  if (fileSizeBytes > maxBytes) {
    throw new BadRequestError(
      `File size ${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB exceeds limit of ${maxMb} MB`
    );
  }
};

const validateExtension = (
  filename: string,
  allowed: string[] | undefined
): void => {
  if (!allowed || allowed.length === 0) return;
  const ext = path.extname(filename).toLowerCase();
  if (!allowed.map((e) => e.toLowerCase()).includes(ext)) {
    throw new BadRequestError(
      `File extension "${ext}" is not allowed for this product`
    );
  }
};

// ── Service ───────────────────────────────────────────────────────────────

export const assetService = {
  /**
   * Direct image upload - processes multiple images in parallel with controlled concurrency
   */
  uploadDirect: async (
    files: Express.Multer.File[],
    constraints: UploadConstraints
  ) => {
    if (!files || files.length === 0) {
      throw new BadRequestError("No files provided");
    }

    if (constraints.maxImages && files.length > constraints.maxImages) {
      throw new BadRequestError(`You can upload a maximum of ${constraints.maxImages} images`);
    }

    if (constraints.minImages && files.length < constraints.minImages) {
      throw new BadRequestError(`You must upload at least ${constraints.minImages} images`);
    }

    // Create asset record
    const asset = await assetRepository.create({
      sourceType: AssetSourceType.DIRECT_UPLOAD,
      status: AssetStatus.UPLOADING,
    });

    const activeChecksums = new Set<string>();

    // Process all images concurrently using the pool worker queue
    const savedFiles = await runWithPool(
      files,
      PROCESSING_CONCURRENCY_LIMIT,
      async (file, index) => {
        validateExtension(file.originalname, constraints.allowedExtensions);
        validateFileSize(file.size, constraints.maxFileSizeMb);

        const checksum = await computeFileHash(file.path);

        // Deduplication Check
        if (!constraints.allowDuplicateImages) {
          if (activeChecksums.has(checksum)) {
            try { fs.unlinkSync(file.path); } catch {}
            return null; // skip processing
          }
          const duplicate = await assetRepository.findFileByChecksum(asset.id, checksum);
          if (duplicate) {
            try { fs.unlinkSync(file.path); } catch {}
            return null;
          }
          activeChecksums.add(checksum);
        }

        let width = 0;
        let height = 0;
        let previewPath: string | undefined;
        let finalSize = file.size;

        try {
          // Perform image optimization & thumbnail generation
          const processed = await processAndOptimizeImage(file.path);
          width = processed.width;
          height = processed.height;
          previewPath = processed.previewPath;
          finalSize = processed.optimizedSize;
        } catch (err) {
          logger.warn(`Could not process image ${file.originalname}:`, err);
        }

        const storedName = path.basename(file.path);
        return assetRepository.createFile({
          assetId: asset.id,
          originalName: file.originalname,
          storedName,
          storagePath: `uploads/originals/${storedName}`,
          previewPath,
          mimeType: file.mimetype,
          fileSize: finalSize,
          checksum,
          width,
          height,
          sortOrder: index,
        });
      }
    );

    // Clean null duplicates
    const filteredFiles = savedFiles.filter(Boolean);

    // Mark asset as uploaded
    await assetRepository.updateStatus(asset.id, AssetStatus.UPLOADED, {
      uploadProgress: 100,
    });

    return assetRepository.findById(asset.id);
  },

  /**
   * ZIP upload - extracts and processes images concurrently with controlled concurrency
   */
  uploadZip: async (
    file: Express.Multer.File,
    constraints: UploadConstraints
  ) => {
    if (!file) {
      throw new BadRequestError("No ZIP file provided");
    }

    validateFileSize(file.size, constraints.maxZipSizeMb);

    const asset = await assetRepository.create({
      sourceType: AssetSourceType.ZIP_UPLOAD,
      status: AssetStatus.UPLOADING,
    });

    await assetRepository.createJob({
      assetId: asset.id,
      type: JobType.ZIP_EXTRACTION,
    });

    let extracted;
    try {
      extracted = await extractZip(file.path, constraints.allowedExtensions);
    } catch (err) {
      await assetRepository.updateStatus(asset.id, AssetStatus.FAILED, {
        notes: "ZIP extraction failed",
      });
      throw new BadRequestError("Failed to extract ZIP file");
    }

    if (extracted.length === 0) {
      await assetRepository.updateStatus(asset.id, AssetStatus.FAILED, {
        notes: "No valid images found in ZIP",
      });
      throw new BadRequestError("No valid image files found inside the ZIP archive");
    }

    if (constraints.maxImages && extracted.length > constraints.maxImages) {
      throw new BadRequestError(`ZIP contains ${extracted.length} images but max allowed is ${constraints.maxImages}`);
    }

    if (constraints.minImages && extracted.length < constraints.minImages) {
      throw new BadRequestError(`ZIP contains ${extracted.length} images but min required is ${constraints.minImages}`);
    }

    const activeChecksums = new Set<string>();

    // Process extracted files concurrently with controlled concurrency
    const savedFiles = await runWithPool(
      extracted,
      PROCESSING_CONCURRENCY_LIMIT,
      async (ef, index) => {
        const fullPath = path.join(process.cwd(), ef.storagePath);
        const checksum = await computeFileHash(fullPath);

        if (!constraints.allowDuplicateImages) {
          if (activeChecksums.has(checksum)) {
            try { fs.unlinkSync(fullPath); } catch {}
            return null;
          }
          const duplicate = await assetRepository.findFileByChecksum(asset.id, checksum);
          if (duplicate) {
            try { fs.unlinkSync(fullPath); } catch {}
            return null;
          }
          activeChecksums.add(checksum);
        }

        let width = 0;
        let height = 0;
        let previewPath: string | undefined;
        let finalSize = ef.fileSize;

        try {
          const processed = await processAndOptimizeImage(fullPath);
          width = processed.width;
          height = processed.height;
          previewPath = processed.previewPath;
          finalSize = processed.optimizedSize;
        } catch (err) {
          logger.warn(`Could not process extracted file ${ef.originalName}:`, err);
        }

        return assetRepository.createFile({
          assetId: asset.id,
          originalName: ef.originalName,
          storedName: ef.storedName,
          storagePath: ef.storagePath,
          previewPath,
          mimeType: ef.mimeType,
          fileSize: finalSize,
          checksum,
          width,
          height,
          sortOrder: index,
        });
      }
    );

    // Clean up temporary ZIP archive from disk
    try {
      fs.unlinkSync(file.path);
    } catch {
      logger.warn(`Could not delete ZIP file: ${file.path}`);
    }

    await assetRepository.updateStatus(asset.id, AssetStatus.UPLOADED, {
      uploadProgress: 100,
    });

    return assetRepository.findById(asset.id);
  },

  uploadDriveLink: async (driveUrl: string) => {
    if (!driveUrl) {
      throw new BadRequestError("Google Drive URL is required");
    }

    const isDriveUrl =
      driveUrl.includes("drive.google.com") ||
      driveUrl.includes("docs.google.com");
    if (!isDriveUrl) {
      throw new BadRequestError("URL must be a Google Drive share link");
    }

    const asset = await assetRepository.create({
      sourceType: AssetSourceType.GOOGLE_DRIVE,
      status: AssetStatus.WAITING,
      externalUrl: driveUrl,
    });

    await assetRepository.createJob({
      assetId: asset.id,
      type: JobType.DRIVE_DOWNLOAD,
    });

    return assetRepository.findById(asset.id);
  },

  findById: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");
    return asset;
  },

  delete: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");

    for (const file of asset.files) {
      const paths = [
        path.join(process.cwd(), file.storagePath),
        ...(file.previewPath ? [path.join(process.cwd(), file.previewPath)] : []),
        ...(file.printReadyPath ? [path.join(process.cwd(), file.printReadyPath)] : []),
      ];

      for (const p of paths) {
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch {
          logger.warn(`Could not delete file: ${p}`);
        }
      }
    }

    await assetRepository.delete(id);
  },

  reorder: async (
    id: string,
    updates: { id: string; sortOrder: number }[]
  ) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");
    await assetRepository.updateFileSortOrders(updates);
    return assetRepository.findById(id);
  },
};