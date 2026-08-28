// src/modules/asset/cleanupJob.ts
import fs from "fs";
import path from "path";
import { prisma } from "../../prisma/client.js";
import { logger } from "../../shared/logger/index.js";
import { AssetSourceType, OrderStatus } from "@prisma/client";

/**
 * Sweeps the database for expired local customer assets.
 * 
 * Safely filters assets using relational queries to make sure we only delete:
 *  1. Orphaned uploads (assets not linked to any order/customization at all).
 *  2. Abandoned cart uploads (assets linked only to shopping carts, never purchased).
 *  3. DELIVERED order uploads (linked to orders where the status is explicitly DELIVERED).
 * 
 * This guarantees images for active orders (CONFIRMED, IN_PRODUCTION, SHIPPED) are NEVER lost.
 */
export const runAssetRetentionCleanup = async (): Promise<void> => {
  try {
    const config = await prisma.imageRetentionSetting.findFirst();
    if (!config) {
      logger.info("No ImageRetentionSetting found in database. Skipping retention cleanup.");
      return;
    }

    const retentionDays = config.retentionDays;

    // 0 or negative days means keep customer uploads forever
    if (retentionDays <= 0) {
      logger.info("Image retention configured to keep files forever (retentionDays = 0). Cleanup skipped.");
      return;
    }

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - retentionDays);

    logger.info(
      `Running Safe Customer Asset Retention Job: Target date is before ${thresholdDate.toISOString()} (${retentionDays} days limit).`
    );

    // Query expired local customer assets ONLY.
    const expiredAssets = await prisma.asset.findMany({
      where: {
        createdAt: { lt: thresholdDate },
        status: { notIn: ["UPLOADING", "PROCESSING"] },
        sourceType: {
          in: [
            AssetSourceType.DIRECT_UPLOAD,
            AssetSourceType.ZIP_UPLOAD,
            AssetSourceType.GOOGLE_DRIVE,
            AssetSourceType.WHATSAPP,
          ],
        },
        // ── STRICT RETENTION SAFETY CONTROLS ─────────────────────────────────
        // Only fetch assets that meet one of these conditional requirements:
        OR: [
          {
            customization: null, // Case A: Orphaned upload (no customization record exists)
          },
          {
            customization: {
              orderItemId: null, // Case B: Abandoned cart customization (never linked to a placed order)
            },
          },
          {
            customization: {
              orderItem: {
                order: {
                  status: OrderStatus.DELIVERED, // Case C: Completed order (safely shipped & delivered)
                },
              },
            },
          },
        ],
        // ─────────────────────────────────────────────────────────────────────
      },
      include: {
        files: true,
        customization: {
          include: {
            orderItem: {
              select: {
                orderId: true,
              },
            },
          },
        },
      },
    });

    if (expiredAssets.length === 0) {
      logger.info("No expired customer assets met the cleanup safety criteria.");
      return;
    }

    logger.info(`Found ${expiredAssets.length} eligible customer assets to clean up.`);
    let filesDeletedCount = 0;

    for (const asset of expiredAssets) {
      for (const file of asset.files) {
        // Build absolute paths to locate files inside the local "uploads/" folder
        const localPathsToPurge = [
          path.join(process.cwd(), file.storagePath),
          ...(file.previewPath ? [path.join(process.cwd(), file.previewPath)] : []),
          ...(file.printReadyPath ? [path.join(process.cwd(), file.printReadyPath)] : []),
        ];

        for (const filePath of localPathsToPurge) {
          try {
            // Strictly check that we are inside the 'uploads' directory to prevent path traversal
            if (filePath.includes("uploads") && fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              filesDeletedCount++;
            }
          } catch (err) {
            logger.error(`Error deleting local file path: ${filePath}`, err);
          }
        }
      }

      // Cascade deletes the Asset and its linked AssetFile records from the database
      await prisma.asset.delete({
        where: { id: asset.id },
      });
    }

    logger.info(
      `Customer Asset Retention Purge Complete. Deleted ${expiredAssets.length} database assets and ${filesDeletedCount} files from disk.`
    );
  } catch (error) {
    logger.error("An error occurred during customer image retention cleanup:", error);
  }
};

/**
 * Initiates the interval scheduler for the image retention job.
 */
export const startAssetRetentionCleanupJob = (): void => {
  // Run once immediately on startup
  runAssetRetentionCleanup();

  // Run once every 24 hours
  const INTERVAL_24H = 24 * 60 * 60 * 1000;
  setInterval(() => {
    logger.info("Triggering scheduled 24h Customer Asset Retention Purge...");
    runAssetRetentionCleanup();
  }, INTERVAL_24H);
};