import {
  OrderStatus,
  PhotoStatus,
  ProductionStage,
} from "@prisma/client";
import { BadRequestError } from "../../../shared/errors/AppError.js";

// ── Valid Order Status Transitions ────────────────────────────────────────

export const validOrderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [
    OrderStatus.AWAITING_PAYMENT,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.AWAITING_PAYMENT]: [
    OrderStatus.CONFIRMED,
    OrderStatus.PAYMENT_FAILED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PAYMENT_FAILED]: [
    OrderStatus.AWAITING_PAYMENT,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.IN_PRODUCTION,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.IN_PRODUCTION]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

// ── Valid Photo Status Transitions ────────────────────────────────────────

export const validPhotoStatusTransitions: Record<PhotoStatus, PhotoStatus[]> = {
  [PhotoStatus.NOT_REQUIRED]: [],
  [PhotoStatus.NOT_RECEIVED]: [PhotoStatus.RECEIVED],
  [PhotoStatus.RECEIVED]: [PhotoStatus.VERIFIED, PhotoStatus.NOT_RECEIVED],
  [PhotoStatus.VERIFIED]: [PhotoStatus.RECEIVED], // allow revert if issues found
};

// ── Valid Production Stage Transitions ────────────────────────────────────

export const validProductionStageTransitions: Record<
  ProductionStage,
  ProductionStage[]
> = {
  [ProductionStage.QUEUED]: [ProductionStage.DESIGN],
  [ProductionStage.DESIGN]: [ProductionStage.PRINTING],
  [ProductionStage.PRINTING]: [ProductionStage.CRAFTING],
  [ProductionStage.CRAFTING]: [ProductionStage.PACKING],
  [ProductionStage.PACKING]: [ProductionStage.READY],
  [ProductionStage.READY]: [],
};

// ── Validators ────────────────────────────────────────────────────────────

export const assertValidStatusTransition = (
  current: OrderStatus,
  next: OrderStatus
): void => {
  const allowed = validOrderStatusTransitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new BadRequestError(
      `Cannot transition order from "${current}" to "${next}". ` +
        `Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none"}`
    );
  }
};

export const assertValidPhotoStatusTransition = (
  current: PhotoStatus,
  next: PhotoStatus
): void => {
  const allowed = validPhotoStatusTransitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new BadRequestError(
      `Cannot transition photo status from "${current}" to "${next}". ` +
        `Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none"}`
    );
  }
};

export const assertValidProductionStageTransition = (
  current: ProductionStage,
  next: ProductionStage
): void => {
  const allowed = validProductionStageTransitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new BadRequestError(
      `Cannot transition production stage from "${current}" to "${next}". ` +
        `Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none"}`
    );
  }
};

// ── Guard: Order must have photos VERIFIED to enter production ─────────────

export const assertReadyForProduction = (
  photoStatus: PhotoStatus
): void => {
  if (
    photoStatus !== PhotoStatus.NOT_REQUIRED &&
    photoStatus !== PhotoStatus.VERIFIED
  ) {
    throw new BadRequestError(
      `Cannot move to production. Photos must be verified first (current: ${photoStatus})`
    );
  }
};

export const getInitialProductionStage = (
  status: OrderStatus
): ProductionStage | null => {
  if (status === OrderStatus.IN_PRODUCTION) {
    return ProductionStage.QUEUED;
  }
  return null;
};