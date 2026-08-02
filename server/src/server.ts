import "dotenv/config";
import app from "./app";
import { prisma } from "./prisma/client";
import { logger } from "./shared/logger";
import { startCheckoutCleanupJob } from "./modules/checkout/cleanupJob.js";

const PORT = parseInt(process.env.PORT || "4000", 10);

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    // Start background jobs
    startCheckoutCleanupJob();

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

process.on("SIGINT", async () => {
  logger.info("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

start();