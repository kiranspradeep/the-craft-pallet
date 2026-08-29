// src/server.ts

import "dotenv/config";
import app from "./app";
import { prisma } from "./prisma/client";
import { logger } from "./shared/logger";
import { startCheckoutCleanupJob } from "./modules/checkout/cleanupJob.js";
import { startAssetRetentionCleanupJob } from "./modules/asset/cleanupJob.js";

const PORT = parseInt(process.env.PORT || "4000", 10);

const start = async (): Promise<void> => {
  try {
    // Connect to database before starting the server
    await prisma.$connect();
    logger.info("Database connected successfully");

    // Start background cleanup jobs
    startCheckoutCleanupJob(); // Purges abandoned checkout sessions (30 mins)
    startAssetRetentionCleanupJob(); // Purges expired customer uploads based on retentionDays

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);

    await prisma.$disconnect();

    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down via SIGINT...");

  await prisma.$disconnect();

  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down via SIGTERM...");

  await prisma.$disconnect();

  process.exit(0);
});

start();