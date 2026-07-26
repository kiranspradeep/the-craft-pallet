import { prisma } from "../../prisma/client.js";

/**
 * Generates a sequential order number for the current year.
 * Format: TCP-2026-0001
 *
 * Uses a row-level lock on OrderSequence to prevent duplicates
 * under concurrent requests. Must be called inside a transaction.
 */
export const generateOrderNumber = async (
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<string> => {
  const year = new Date().getFullYear();

  // Upsert the sequence row for this year, then increment atomically
  const sequence = await tx.orderSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  const padded = String(sequence.lastNumber).padStart(4, "0");
  return `TCP-${year}-${padded}`;
};