import Razorpay from "razorpay";
import {
  OrderStatus,
  PhotoStatus,
  ProductionStage,
  PaymentStatus,
  PaymentMethod,
  TimelineEventType,
  ActorType,
} from "@prisma/client";
import { orderRepository, FindAllOrdersOptions } from "./repository.js";
import {
  assertValidStatusTransition,
  assertValidPhotoStatusTransition,
  assertValidProductionStageTransition,
  assertReadyForProduction,
  getInitialProductionStage,
} from "./statusTransitions.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";
import { logger } from "../../../shared/logger/index.js";

const assertOrderExists = async (id: string) => {
  const order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError("Order not found");
  return order;
};

const getRazorpayInstance = async (): Promise<Razorpay> => {
  const settings = await orderRepository.getPaymentSettings();

  const keyId = settings?.apiKey || process.env.RAZORPAY_KEY_ID;
  const keySecret = settings?.apiSecret || process.env.RAZORPAY_KEY_SECRET;

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

export const orderService = {
  findAll: async (options: FindAllOrdersOptions) => {
    return orderRepository.findAll(options);
  },

  findById: async (id: string) => {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  },

  getProductionQueue: async () => {
    return orderRepository.findProductionQueue();
  },

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

    assertValidStatusTransition(order.status, newStatus);

    // If moving to IN_PRODUCTION — check photos are ready
    if (newStatus === OrderStatus.IN_PRODUCTION) {
      assertReadyForProduction(order.photoStatus);
    }

    const newProductionStage = getInitialProductionStage(newStatus);

    const updated = await orderRepository.updateStatus(
      orderId,
      newStatus,
      newProductionStage ?? undefined
    );

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

    if (order.status !== OrderStatus.IN_PRODUCTION) {
      throw new BadRequestError(
        "Production stage can only be updated when order is IN_PRODUCTION"
      );
    }

    if (!order.productionStage) {
      throw new BadRequestError("Order has no current production stage");
    }

    assertValidProductionStageTransition(order.productionStage, newStage);

    const updated = await orderRepository.updateProductionStage(
      orderId,
      newStage
    );

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
      metadata: { previousStage: order.productionStage, newStage },
    });

    return updated;
  },

  // ── Photo Status ──────────────────────────────────────────────────────
  markPhotosReceived: async (orderId: string, adminId: string) => {
    const order = await assertOrderExists(orderId);

    assertValidPhotoStatusTransition(
      order.photoStatus,
      PhotoStatus.RECEIVED
    );

    const updated = await orderRepository.updatePhotoStatus(
      orderId,
      PhotoStatus.RECEIVED
    );

    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PHOTOS_RECEIVED,
      title: "Photos Received",
      description: "Customer photos have been received and are pending review.",
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
    });

    logger.info(`Order ${order.orderNumber} photos marked RECEIVED`);
    return updated;
  },

  markPhotosVerified: async (orderId: string, adminId: string) => {
    const order = await assertOrderExists(orderId);

    assertValidPhotoStatusTransition(
      order.photoStatus,
      PhotoStatus.VERIFIED
    );

    const updated = await orderRepository.updatePhotoStatus(
      orderId,
      PhotoStatus.VERIFIED
    );

    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PHOTOS_VERIFIED,
      title: "Photos Verified",
      description:
        "Your photos have been reviewed and approved. Production will begin soon.",
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
    });

    logger.info(`Order ${order.orderNumber} photos marked VERIFIED`);
    return updated;
  },

  // ── Add Admin Note ────────────────────────────────────────────────────
  addNote: async (orderId: string, note: string, adminId: string) => {
    await assertOrderExists(orderId);

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

    return updated;
  },

  // ── Mark as Paid (Manual — WhatsApp) ──────────────────────────────────
  markAsPaid: async (
    orderId: string,
    adminId: string,
    input: { referenceNumber?: string; note?: string }
  ) => {
    const order = await assertOrderExists(orderId);

    if (
      order.status !== OrderStatus.AWAITING_PAYMENT &&
      order.status !== OrderStatus.DRAFT
    ) {
      throw new BadRequestError(
        `Cannot mark as paid. Order is currently "${order.status}"`
      );
    }

    const now = new Date();

    await orderRepository.updatePayment(orderId, {
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.MANUAL,
      paidAt: now,
      verifiedBy: adminId,
      verifiedAt: now,
      referenceNumber: input.referenceNumber,
      gatewayName: "manual",
    });

    const updated = await orderRepository.updateStatus(
      orderId,
      OrderStatus.CONFIRMED
    );

    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PAYMENT_SUCCESS,
      title: "Payment Verified",
      description: input.referenceNumber
        ? `Payment manually verified. Reference: ${input.referenceNumber}`
        : "Payment manually verified by admin",
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
      metadata: { referenceNumber: input.referenceNumber },
    });

    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.ORDER_CONFIRMED,
      title: "Order Confirmed",
      description: "Your order has been confirmed.",
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

    if (
      order.status !== OrderStatus.AWAITING_PAYMENT &&
      order.status !== OrderStatus.DRAFT
    ) {
      throw new BadRequestError(
        `Cannot generate payment link. Order is currently "${order.status}"`
      );
    }

    const payment = await orderRepository.findPaymentByOrderId(orderId);
    if (!payment) {
      throw new BadRequestError("Payment record not found for this order");
    }

    const razorpay = await getRazorpayInstance();
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

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
      callback_url: `${process.env.CLIENT_URL || "http://localhost:3001"}/order-confirmation/${order.orderNumber}?phone=${order.customer.phone}`,
      callback_method: "get",
    });

    await orderRepository.updatePayment(orderId, {
      status: PaymentStatus.INITIATED,
      gatewayName: "razorpay",
      gatewayOrderId: paymentLink.id,
      gatewayResponse: paymentLink as Record<string, unknown>,
    });

    // If it was DRAFT — move to AWAITING_PAYMENT
    if (order.status === OrderStatus.DRAFT) {
      await orderRepository.updateStatus(orderId, OrderStatus.AWAITING_PAYMENT);
    }

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
    [OrderStatus.IN_PRODUCTION]:
      TimelineEventType.PRODUCTION_STAGE_CHANGED,
    [OrderStatus.SHIPPED]: TimelineEventType.SHIPPED,
    [OrderStatus.DELIVERED]: TimelineEventType.DELIVERED,
    [OrderStatus.CANCELLED]: TimelineEventType.CANCELLED,
    [OrderStatus.REFUNDED]: TimelineEventType.REFUNDED,
  };
  return map[status] ?? TimelineEventType.NOTE_ADDED;
};

const getStatusTitle = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: "Draft Order",
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