import Razorpay from "razorpay";
import {
  OrderStatus,
  ProductionStage,
  PaymentStatus,
  PaymentMethod,
  TimelineEventType,
  ActorType,
} from "@prisma/client";
import { orderRepository, FindAllOrdersOptions } from "./repository.js";
import {
  assertValidStatusTransition,
  assertValidProductionStageTransition,
  getInitialProductionStage,
} from "./statusTransitions.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";
import { logger } from "../../../shared/logger/index.js";

// ── Helpers ───────────────────────────────────────────────────────────────

const assertOrderExists = async (id: string) => {
  const order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError("Order not found");
  return order;
};

const getRazorpayInstance = async (): Promise<Razorpay> => {
  // Try DB settings first
  const settings = await orderRepository.getPaymentSettings();

  const keyId =
    settings?.apiKey || process.env.RAZORPAY_KEY_ID;
  const keySecret =
    settings?.apiSecret || process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new BadRequestError(
      "Payment gateway is not configured. Please add Razorpay credentials in Settings → Payment or .env file."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};
// ── Service ───────────────────────────────────────────────────────────────

export const orderService = {
  // ── List Orders ───────────────────────────────────────────────────────
  findAll: async (options: FindAllOrdersOptions) => {
    return orderRepository.findAll(options);
  },

  // ── Get Single Order ──────────────────────────────────────────────────
  findById: async (id: string) => {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  },

  // ── Production Queue ──────────────────────────────────────────────────
  getProductionQueue: async () => {
    return orderRepository.findProductionQueue();
  },

  // ── Get Stats ─────────────────────────────────────────────────────────
  getStats: async () => {
    return orderRepository.getStats();
  },

  // ── Update Order Status ───────────────────────────────────────────────
  updateStatus: async (
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
    note?: string
  ) => {
    const order = await assertOrderExists(orderId);

    // Enforce valid transition
    assertValidStatusTransition(order.status, newStatus);

    // Auto-set production stage when moving to IN_PRODUCTION
    const newProductionStage = getInitialProductionStage(newStatus);

    // If moving away from IN_PRODUCTION — clear production stage
    const productionStage =
      newStatus !== OrderStatus.IN_PRODUCTION &&
      newStatus !== OrderStatus.SHIPPED &&
      newStatus !== OrderStatus.DELIVERED
        ? null
        : newProductionStage ?? order.productionStage;

    const updated = await orderRepository.updateStatus(
      orderId,
      newStatus,
      newProductionStage ?? undefined
    );

    // Timeline event
    await orderRepository.createTimelineEvent({
      orderId,
      eventType: getTimelineEventForStatus(newStatus),
      title: getStatusTitle(newStatus),
      description:
        note ||
        `Order status updated to ${newStatus.replace(/_/g, " ")}`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: isCustomerVisible(newStatus),
      metadata: { previousStatus: order.status, newStatus },
    });

    // If cancelled — also add note to timeline
    if (note && newStatus === OrderStatus.CANCELLED) {
      await orderRepository.createTimelineEvent({
        orderId,
        eventType: TimelineEventType.NOTE_ADDED,
        title: "Cancellation Note",
        description: note,
        actorType: ActorType.ADMIN,
        actorId: adminId,
        isVisibleToCustomer: true,
      });
    }

    logger.info(
      `Order ${order.orderNumber} status: ${order.status} → ${newStatus} by admin ${adminId}`
    );

    return updated;
  },

  // ── Update Production Stage ───────────────────────────────────────────
  updateProductionStage: async (
    orderId: string,
    newStage: ProductionStage,
    adminId: string
  ) => {
    const order = await assertOrderExists(orderId);

    // Order must be IN_PRODUCTION
    if (order.status !== OrderStatus.IN_PRODUCTION) {
      throw new BadRequestError(
        "Production stage can only be updated when order is IN_PRODUCTION"
      );
    }

    // Must have current stage to validate transition
    if (!order.productionStage) {
      throw new BadRequestError(
        "Order has no current production stage set"
      );
    }

    // Enforce valid stage transition
    assertValidProductionStageTransition(order.productionStage, newStage);

    const updated = await orderRepository.updateProductionStage(
      orderId,
      newStage
    );

    // Timeline event
    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PRODUCTION_STAGE_CHANGED,
      title: `Production: ${formatStage(newStage)}`,
      description: `Production stage updated from ${formatStage(
        order.productionStage
      )} to ${formatStage(newStage)}`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: false,
      metadata: {
        previousStage: order.productionStage,
        newStage,
      },
    });

    logger.info(
      `Order ${order.orderNumber} production stage: ${order.productionStage} → ${newStage}`
    );

    return updated;
  },

  // ── Add Admin Note ────────────────────────────────────────────────────
  addNote: async (orderId: string, note: string, adminId: string) => {
    const order = await assertOrderExists(orderId);

    const updated = await orderRepository.updateAdminNote(orderId, note);

    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.NOTE_ADDED,
      title: "Admin Note Added",
      description: note,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: false,
    });

    logger.info(`Admin note added to order ${order.orderNumber}`);

    return updated;
  },

  // ── Mark as Paid (Manual — WhatsApp) ──────────────────────────────────
  markAsPaid: async (
    orderId: string,
    adminId: string,
    input: {
      referenceNumber?: string;
      note?: string;
    }
  ) => {
    const order = await assertOrderExists(orderId);

    // Only allowed from AWAITING_PAYMENT
    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestError(
        `Cannot mark as paid. Order is currently "${order.status}"`
      );
    }

    const now = new Date();

    // Update payment record
    await orderRepository.updatePayment(orderId, {
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.MANUAL,
      paidAt: now,
      verifiedBy: adminId,
      verifiedAt: now,
      referenceNumber: input.referenceNumber,
      gatewayName: "manual",
    });

    // Update order status → CONFIRMED
    const updated = await orderRepository.updateStatus(
      orderId,
      OrderStatus.CONFIRMED
    );

    // Timeline — payment success
    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PAYMENT_SUCCESS,
      title: "Payment Verified",
      description:
        input.referenceNumber
          ? `Payment manually verified. Reference: ${input.referenceNumber}`
          : "Payment manually verified by admin",
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
      metadata: { referenceNumber: input.referenceNumber },
    });

    // Timeline — order confirmed
    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.ORDER_CONFIRMED,
      title: "Order Confirmed",
      description: "Your order has been confirmed and will enter production soon.",
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
    });

    if (input.note) {
      await orderRepository.createTimelineEvent({
        orderId,
        eventType: TimelineEventType.NOTE_ADDED,
        title: "Payment Note",
        description: input.note,
        actorType: ActorType.ADMIN,
        actorId: adminId,
        isVisibleToCustomer: false,
      });
    }

    logger.info(
      `Order ${order.orderNumber} manually marked as paid by admin ${adminId}`
    );

    return updated;
  },

  // ── Generate Razorpay Payment Link ────────────────────────────────────
  generatePaymentLink: async (orderId: string, adminId: string) => {
    const order = await assertOrderExists(orderId);

    // Only for AWAITING_PAYMENT orders
    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestError(
        `Cannot generate payment link. Order is currently "${order.status}"`
      );
    }

    const payment = await orderRepository.findPaymentByOrderId(orderId);
    if (!payment) {
      throw new BadRequestError("Payment record not found for this order");
    }

    // Get Razorpay instance — throws if not configured
    const razorpay = await getRazorpayInstance();

    // Amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    // Create Razorpay Payment Link
    const paymentLink = await (razorpay.paymentLink as any).create({
      amount: amountInPaise,
      currency: order.currency,
      description: `Payment for Order ${order.orderNumber} — The Craft Pallet`,
      customer: {
        name: order.customer.name,
        contact: `+91${order.customer.phone}`,
        email: order.customer.email || undefined,
      },
      notify: {
        sms: true,
        email: !!order.customer.email,
      },
      reminder_enable: true,
      notes: {
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
      callback_url: `${process.env.CLIENT_URL || "http://localhost:3001"}/order-confirmation/${order.orderNumber}`,
      callback_method: "get",
    });

    // Save Razorpay details to payment record
    await orderRepository.updatePayment(orderId, {
      status: PaymentStatus.INITIATED,
      gatewayName: "razorpay",
      gatewayOrderId: paymentLink.id,
      gatewayResponse: paymentLink as Record<string, unknown>,
    });

    // Timeline event
    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PAYMENT_INITIATED,
      title: "Payment Link Generated",
      description: `Razorpay payment link generated and sent to customer`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: false,
      metadata: {
        paymentLinkId: paymentLink.id,
        paymentLinkUrl: paymentLink.short_url,
        amount: order.totalAmount,
      },
    });

    logger.info(
      `Payment link generated for order ${order.orderNumber}: ${paymentLink.short_url}`
    );

    return {
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
      amount: order.totalAmount,
      currency: order.currency,
      expiresAt: paymentLink.expire_by
        ? new Date(paymentLink.expire_by * 1000)
        : null,
    };
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

const getTimelineEventForStatus = (
  status: OrderStatus
): TimelineEventType => {
  const map: Partial<Record<OrderStatus, TimelineEventType>> = {
    [OrderStatus.CONFIRMED]: TimelineEventType.ORDER_CONFIRMED,
    [OrderStatus.IN_PRODUCTION]: TimelineEventType.PRODUCTION_STAGE_CHANGED,
    [OrderStatus.SHIPPED]: TimelineEventType.SHIPPED,
    [OrderStatus.DELIVERED]: TimelineEventType.DELIVERED,
    [OrderStatus.CANCELLED]: TimelineEventType.CANCELLED,
    [OrderStatus.REFUNDED]: TimelineEventType.REFUNDED,
  };
  return map[status] ?? TimelineEventType.NOTE_ADDED;
};

const getStatusTitle = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.AWAITING_PAYMENT]: "Awaiting Payment",
    [OrderStatus.PAYMENT_FAILED]: "Payment Failed",
    [OrderStatus.CONFIRMED]: "Order Confirmed",
    [OrderStatus.IN_PRODUCTION]: "In Production",
    [OrderStatus.SHIPPED]: "Order Shipped",
    [OrderStatus.DELIVERED]: "Order Delivered",
    [OrderStatus.CANCELLED]: "Order Cancelled",
    [OrderStatus.REFUNDED]: "Order Refunded",
  };
  return map[status] ?? status;
};

const isCustomerVisible = (status: OrderStatus): boolean => {
  const visibleStatuses: OrderStatus[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.IN_PRODUCTION,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ];
  return visibleStatuses.includes(status);
};

const formatStage = (stage: ProductionStage): string => {
  const map: Record<ProductionStage, string> = {
    [ProductionStage.QUEUED]: "Queued",
    [ProductionStage.DESIGN]: "Design",
    [ProductionStage.PRINTING]: "Printing",
    [ProductionStage.CRAFTING]: "Crafting",
    [ProductionStage.PACKING]: "Packing",
    [ProductionStage.READY]: "Ready",
  };
  return map[stage] ?? stage;
};