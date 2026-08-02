import { checkoutRepository } from "./repository.js";
import { logger } from "../../shared/logger/index.js";

/**
 * Runs every 15 minutes — deletes CheckoutSessions past their expiresAt.
 * Also could be used to delete stale DRAFT orders in the future.
 */
export const startCheckoutCleanupJob = () => {
  const runCleanup = async () => {
    try {
      const result = await checkoutRepository.cleanupExpiredSessions();
      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} expired checkout sessions`);
      }
    } catch (err) {
      logger.error("Checkout cleanup job failed:", err);
    }
  };

  // Run immediately on start
  runCleanup();

  // Then every 15 min
  setInterval(runCleanup, 15 * 60 * 1000);

  logger.info("Checkout cleanup job started (runs every 15 min)");
};