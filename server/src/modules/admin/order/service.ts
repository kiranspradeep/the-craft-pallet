import Razorpay from "razorpay";
import fs from "fs";
import path from "path";
import {
  OrderStatus,
  PhotoStatus,
  ProductionStage,
  PaymentStatus,
  PaymentMethod,
  TimelineEventType,
  ActorType,
} from "@prisma/client";
import { Response } from "express";
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
import { emailService } from "../../../shared/services/emailService.js";

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
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
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

  updateStatus: async (
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
    note?: string
  ) => {
    const order = await assertOrderExists(orderId);
    assertValidStatusTransition(order.status, newStatus);
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
      description: note || `Order status updated to ${newStatus.replace(/_/g, " ")}`,
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

    if (newStatus === OrderStatus.CONFIRMED) {
      emailService.sendOrderConfirmedEmail(updated).catch(() => {});
    } else if (newStatus === OrderStatus.DELIVERED) {
      emailService.sendOrderDeliveredEmail(updated).catch(() => {});
    }

    return updated;
  },

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
    const updated = await orderRepository.updateProductionStage(orderId, newStage);
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

  markPhotosReceived: async (orderId: string, adminId: string) => {
    const order = await assertOrderExists(orderId);
    assertValidPhotoStatusTransition(order.photoStatus, PhotoStatus.RECEIVED);
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
    assertValidPhotoStatusTransition(order.photoStatus, PhotoStatus.VERIFIED);
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

    emailService.sendOrderConfirmedEmail(updated).catch(() => {});

    return updated;
  },

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
      notify: { sms: true, email: !!order.customer.email },
      reminder_enable: true,
      notes: { orderNumber: order.orderNumber, orderId: order.id },
      callback_url: `${
        process.env.CLIENT_URL || "http://localhost:3001"
      }/order-confirmation/${order.orderNumber}?phone=${order.customer.phone}`,
      callback_method: "get",
    });
    await orderRepository.updatePayment(orderId, {
      status: PaymentStatus.INITIATED,
      gatewayName: "razorpay",
      gatewayOrderId: paymentLink.id,
      gatewayResponse: paymentLink as Record<string, unknown>,
    });
    if (order.status === OrderStatus.DRAFT) {
      await orderRepository.updateStatus(orderId, OrderStatus.AWAITING_PAYMENT);
    }
    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.PAYMENT_INITIATED,
      title: "Payment Link Generated",
      description: "Razorpay payment link generated and sent to customer",
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

  // ── Mark as Shipped (with tracking number) ────────────────────────────
  markAsShipped: async (
    orderId: string,
    adminId: string,
    input: { trackingNumber: string; estimatedDelivery?: string }
  ) => {
    const order = await assertOrderExists(orderId);
    assertValidStatusTransition(order.status, OrderStatus.SHIPPED);

    await orderRepository.createShipment({
      orderId,
      trackingNumber: input.trackingNumber,
      estimatedDelivery: input.estimatedDelivery
        ? new Date(input.estimatedDelivery)
        : undefined,
    });

    const updated = await orderRepository.updateStatus(
      orderId,
      OrderStatus.SHIPPED
    );

    await orderRepository.createTimelineEvent({
      orderId,
      eventType: TimelineEventType.SHIPPED,
      title: "Order Shipped",
      description: `Your order has been shipped. Tracking number: ${input.trackingNumber}`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
      metadata: { trackingNumber: input.trackingNumber },
    });

    logger.info(
      `Order ${order.orderNumber} marked as SHIPPED with tracking ${input.trackingNumber}`
    );

    emailService.sendOrderShippedEmail(updated, input.trackingNumber).catch(() => {});

    return updated;
  },

  // ── Stream unit photos as ZIP ─────────────────────────────────────────
  streamUnitPhotosZip: async (
    orderId: string,
    itemId: string,
    unitIndex: number,
    res: Response
  ) => {
    const order = await assertOrderExists(orderId);

    const item = order.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundError("Order item not found");

    const photoCustomizations = item.customizations.filter(
      (c) =>
        c.fieldType === "PHOTO_UPLOAD" &&
        ((c as any).unitIndex ?? 0) === unitIndex &&
        c.asset?.files?.length
    );

    if (photoCustomizations.length === 0) {
      throw new NotFoundError("No photos found for this unit");
    }

    const allFiles = photoCustomizations.flatMap((c) => c.asset!.files);

    if (allFiles.length === 0) {
      throw new NotFoundError("No files found for this unit");
    }

    const unitLabel = item.quantity > 1 ? `_Unit${unitIndex + 1}` : "";
    const productSlug = item.productName
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "");
    const zipName = `${order.orderNumber}_${productSlug}${unitLabel}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const archiverLib = await import("archiver");
    const archive = new (archiverLib as any).ZipArchive({
      zlib: { level: 5 },
    });

    archive.on("error", (err: Error) => {
      logger.error("ZIP archive error:", err);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: "Failed to create ZIP" });
      }
    });

    archive.pipe(res);

    for (const file of allFiles) {
      const filePath = path.join(process.cwd(), file.storagePath);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file.originalName });
      }
    }

    await archive.finalize();

    logger.info(
      `ZIP downloaded: ${zipName} (${allFiles.length} files) for order ${order.orderNumber}`
    );
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

const getTimelineEventForStatus = (status: OrderStatus): TimelineEventType => {
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