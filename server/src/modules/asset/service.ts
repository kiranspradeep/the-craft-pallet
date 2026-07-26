import fs from "fs";
import path from "path";
import { AssetSourceType, AssetStatus, JobType } from "@prisma/client";
import { assetRepository } from "./repository.js";
import { processImage } from "./imageProcessor.js";
import { extractZip } from "./zipExtractor.js";
import { computeFileHash } from "../../shared/utils/fileHash.js";
import { DIRS } from "../../shared/utils/storage.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/index.js";

// ── Validation helpers ────────────────────────────────────────────────────

interface UploadConstraints {
  maxImages?: number | null;
  minImages?: number | null;
  maxFileSizeMb?: number | null;
  maxZipSizeMb?: number | null;
  allowedExtensions?: string[];
  allowDuplicateImages?: boolean;
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
   * Direct image upload — one or more image files.
   * files: from multer req.files
   * constraints: from ProductConfiguration
   */
  uploadDirect: async (
    files: Express.Multer.File[],
    constraints: UploadConstraints
  ) => {
    if (!files || files.length === 0) {
      throw new BadRequestError("No files provided");
    }

    // Check image count against maxImages
    if (
      constraints.maxImages &&
      files.length > constraints.maxImages
    ) {
      throw new BadRequestError(
        `You can upload a maximum of ${constraints.maxImages} images`
      );
    }

    if (
      constraints.minImages &&
      files.length < constraints.minImages
    ) {
      throw new BadRequestError(
        `You must upload at least ${constraints.minImages} images`
      );
    }

    // Create asset record
    const asset = await assetRepository.create({
      sourceType: AssetSourceType.DIRECT_UPLOAD,
      status: AssetStatus.UPLOADING,
    });

    const savedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;

      // Validate extension
      validateExtension(file.originalname, constraints.allowedExtensions);

      // Validate file size
      validateFileSize(file.size, constraints.maxFileSizeMb);

      // Compute hash
      const checksum = await computeFileHash(file.path);

      // Duplicate detection
      if (!constraints.allowDuplicateImages) {
        const duplicate = await assetRepository.findFileByChecksum(
          asset.id,
          checksum
        );
        if (duplicate) {
          // Delete the duplicate from disk
          fs.unlinkSync(file.path);
          continue;
        }
      }

      // Process image — generate thumbnail + get dimensions
      let width = 0;
      let height = 0;
      let previewPath: string | undefined;

      try {
        const processed = await processImage(file.path);
        width = processed.width;
        height = processed.height;
        previewPath = processed.previewPath;
      } catch (err) {
        logger.warn(`Could not process image ${file.originalname}:`, err);
      }

      // Save file record
      const storedName = path.basename(file.path);
      const assetFile = await assetRepository.createFile({
        assetId: asset.id,
        originalName: file.originalname,
        storedName,
        storagePath: `uploads/originals/${storedName}`,
        previewPath,
        mimeType: file.mimetype,
        fileSize: file.size,
        checksum,
        width,
        height,
        sortOrder: i,
      });

      // Queue thumbnail job
      await assetRepository.createJob({
        assetId: asset.id,
        type: JobType.IMAGE_COMPRESSION,
      });

      savedFiles.push(assetFile);
    }

    // Mark asset as uploaded
    await assetRepository.updateStatus(asset.id, AssetStatus.UPLOADED, {
      uploadProgress: 100,
    });

    return assetRepository.findById(asset.id);
  },

  /**
   * ZIP upload — extract images from ZIP, process each.
   */
  uploadZip: async (
    file: Express.Multer.File,
    constraints: UploadConstraints
  ) => {
    if (!file) {
      throw new BadRequestError("No ZIP file provided");
    }

    // Validate ZIP size
    validateFileSize(file.size, constraints.maxZipSizeMb);

    // Create asset record
    const asset = await assetRepository.create({
      sourceType: AssetSourceType.ZIP_UPLOAD,
      status: AssetStatus.UPLOADING,
    });

    // Queue ZIP extraction job
    await assetRepository.createJob({
      assetId: asset.id,
      type: JobType.ZIP_EXTRACTION,
    });

    // Extract synchronously for now
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
      throw new BadRequestError(
        "No valid image files found inside the ZIP archive"
      );
    }

    if (constraints.maxImages && extracted.length > constraints.maxImages) {
      throw new BadRequestError(
        `ZIP contains ${extracted.length} images but maximum allowed is ${constraints.maxImages}`
      );
    }

    if (constraints.minImages && extracted.length < constraints.minImages) {
      throw new BadRequestError(
        `ZIP contains ${extracted.length} images but minimum required is ${constraints.minImages}`
      );
    }

    const savedFiles = [];

    for (let i = 0; i < extracted.length; i++) {
      const ef = extracted[i]!;

      const fullPath = path.join(process.cwd(), ef.storagePath);

      // Compute hash
      const checksum = await computeFileHash(fullPath);

      // Duplicate detection
      if (!constraints.allowDuplicateImages) {
        const duplicate = await assetRepository.findFileByChecksum(
          asset.id,
          checksum
        );
        if (duplicate) continue;
      }

      let width = 0;
      let height = 0;
      let previewPath: string | undefined;

      try {
        const processed = await processImage(fullPath);
        width = processed.width;
        height = processed.height;
        previewPath = processed.previewPath;
      } catch (err) {
        logger.warn(`Could not process extracted file ${ef.originalName}:`, err);
      }

      const assetFile = await assetRepository.createFile({
        assetId: asset.id,
        originalName: ef.originalName,
        storedName: ef.storedName,
        storagePath: ef.storagePath,
        previewPath,
        mimeType: ef.mimeType,
        fileSize: ef.fileSize,
        checksum,
        width,
        height,
        sortOrder: i,
      });

      savedFiles.push(assetFile);
    }

    // Clean up ZIP file from disk
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

  /**
   * Google Drive link — store reference only.
   * Actual download queued as a background job.
   */
  uploadDriveLink: async (driveUrl: string) => {
    if (!driveUrl) {
      throw new BadRequestError("Google Drive URL is required");
    }

    // Basic validation — must be a Google Drive share URL
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

    // Queue drive download job
    await assetRepository.createJob({
      assetId: asset.id,
      type: JobType.DRIVE_DOWNLOAD,
    });

    return assetRepository.findById(asset.id);
  },

  /**
   * Get asset by ID.
   */
  findById: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");
    return asset;
  },

  /**
   * Delete asset and all its files from disk.
   */
  delete: async (id: string) => {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");

    // Delete all physical files
    for (const file of asset.files) {
      const paths = [
        path.join(process.cwd(), file.storagePath),
        ...(file.previewPath
          ? [path.join(process.cwd(), file.previewPath)]
          : []),
        ...(file.printReadyPath
          ? [path.join(process.cwd(), file.printReadyPath)]
          : []),
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

  /**
   * Reorder files within an asset.
   */
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