import { OrderStatus } from "@prisma/client";

/**
 * Defines which status transitions are valid.
 * Key   = current status
 * Value = allowed next statuses
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.AWAITING_PAYMENT]: [
    OrderStatus.CONFIRMED,      // manual payment verification
    OrderStatus.PAYMENT_FAILED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PAYMENT_FAILED]: [
    OrderStatus.AWAITING_PAYMENT, // customer retries
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.IN_PRODUCTION,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.IN_PRODUCTION]: [
    OrderStatus.SHIPPED,          // packed → shipped (combined)
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [
    OrderStatus.DELIVERED,
  ],
  [OrderStatus.DELIVERED]: [
    OrderStatus.REFUNDED,
  ],
  [OrderStatus.CANCELLED]: [
    // Terminal — no further transitions
  ],
  [OrderStatus.REFUNDED]: [
    // Terminal — no further transitions
  ],
};

export const isValidTransition = (
  from: OrderStatus,
  to: OrderStatus
): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};

/**
 * Human-readable label for each status.
 */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.AWAITING_PAYMENT]: "Awaiting Payment",
  [OrderStatus.PAYMENT_FAILED]: "Payment Failed",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.IN_PRODUCTION]: "In Production",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
  [OrderStatus.REFUNDED]: "Refunded",
};