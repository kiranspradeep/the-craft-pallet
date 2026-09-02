import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../../prisma/client.js";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TimelineEventType,
  ActorType,
} from "@prisma/client";
import { logger } from "../../../shared/logger/index.js";
import { emailService } from "../../../shared/services/emailService.js";

// ── Signature Verification ────────────────────────────────────────────────

const verifyWebhookSignature = (
  rawBody: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature);
  const signatureBuf = Buffer.from(signature);

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
};

// ── Main Webhook Handler ──────────────────────────────────────────────────

export const razorpayWebhookHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("RAZORPAY_WEBHOOK_SECRET is not set");
    res.status(500).json({ success: false, message: "Webhook secret not configured" });
    return;
  }

  if (!signature) {
    logger.warn("Razorpay webhook received without signature");
    res.status(400).json({ success: false, message: "Missing signature" });
    return;
  }

  const rawBody = (req as any).rawBody as string;
  if (!rawBody) {
    logger.warn("Razorpay webhook: raw body not available");
    res.status(400).json({ success: false, message: "Raw body missing" });
    return;
  }

  const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    logger.warn("Razorpay webhook signature verification failed");
    res.status(400).json({ success: false, message: "Invalid signature" });
    return;
  }

  const event = req.body;
  const eventType = event.event as string;

  logger.info(`Razorpay webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "payment_link.paid":
        await handlePaymentLinkPaid(event);
        break;

      case "payment.authorized":
      case "payment.captured":
      case "order.paid":
        await handlePaymentSuccess(event);
        break;

      case "payment.failed":
        await handlePaymentFailed(event);
        break;

      default:
        logger.info(`Razorpay webhook: unhandled event type "${eventType}"`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Razorpay webhook handler error for event ${eventType}:`, err);
    res.status(200).json({ success: true });
  }
};

// ── Helper: Find order via multiple methods ──────────────────────────────

const findOrderForPayment = async (payment: any) => {
  const paymentLinkId = payment.payment_link_id as string | undefined;
  const razorpayOrderId = payment.order_id as string | undefined;
  const orderNumber = payment.notes?.orderNumber as string | undefined;
  const orderId = payment.notes?.orderId as string | undefined;

  // 1. By razorpay order_id (customer checkout with Razorpay Orders API)
  if (razorpayOrderId) {
    const rec = await prisma.payment.findFirst({
      where: { gatewayOrderId: razorpayOrderId },
      include: { order: { include: { customer: true, items: true } } },
    });
    if (rec) return rec;
  }

  // 2. By payment link ID (WhatsApp admin flow)
  if (paymentLinkId) {
    const rec = await prisma.payment.findFirst({
      where: { gatewayOrderId: paymentLinkId },
      include: { order: { include: { customer: true, items: true } } },
    });
    if (rec) return rec;
  }

  // 3. By orderId from Razorpay notes
  if (orderId) {
    const rec = await prisma.payment.findFirst({
      where: { orderId },
      include: { order: { include: { customer: true, items: true } } },
    });
    if (rec) return rec;
  }

  // 4. By orderNumber from Razorpay notes
  if (orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { customer: true, items: true, payment: true },
    });
    if (order?.payment) {
      return { ...order.payment, order };
    }
  }

  return null;
};

// ── payment_link.paid — WhatsApp admin payment link flow ─────────────────

const handlePaymentLinkPaid = async (event: any): Promise<void> => {
  const paymentLink = event.payload?.payment_link?.entity;
  const payment = event.payload?.payment?.entity;

  if (!paymentLink) {
    logger.warn("payment_link.paid: missing payment_link entity");
    return;
  }

  const paymentLinkId = paymentLink.id as string;
  const razorpayPaymentId = payment?.id as string | undefined;
  const razorpaySignature = payment?.signature as string | undefined;

  const paymentRecord = await prisma.payment.findFirst({
    where: { gatewayOrderId: paymentLinkId },
    include: { order: { include: { customer: true, items: true } } },
  });

  if (!paymentRecord) {
    logger.warn(
      `payment_link.paid: no payment record found for link ID ${paymentLinkId}`
    );
    return;
  }

  const order = paymentRecord.order;

  // Idempotency: Already confirmed by browser verify route
  if (order.status === OrderStatus.CONFIRMED) {
    logger.info(
      `payment_link.paid: order ${order.orderNumber} already confirmed — skipping`
    );
    return;
  }

  const now = new Date();

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.UPI,
      gatewayName: "razorpay",
      gatewayPaymentId: razorpayPaymentId ?? null,
      gatewaySignature: razorpaySignature ?? null,
      gatewayResponse: event.payload as any,
      paidAt: now,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CONFIRMED },
  });

  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.PAYMENT_SUCCESS,
      title: "Payment Successful",
      description: `Payment of ₹${Number(order.totalAmount).toFixed(
        2
      )} received successfully via Razorpay`,
      actorType: ActorType.SYSTEM,
      isVisibleToCustomer: true,
      metadata: {
        paymentLinkId,
        razorpayPaymentId,
        amount: order.totalAmount,
      } as any,
    },
  });

  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.ORDER_CONFIRMED,
      title: "Order Confirmed",
      description:
        "Your order has been confirmed and will enter production soon.",
      actorType: ActorType.SYSTEM,
      isVisibleToCustomer: true,
    },
  });

  // Dispatch confirmation email
  emailService.sendOrderConfirmedEmail(order).catch(() => {});

  logger.info(
    `Order ${order.orderNumber} confirmed via payment_link.paid webhook`
  );
};

// ── payment.authorized / payment.captured / order.paid ──────────────────

const handlePaymentSuccess = async (event: any): Promise<void> => {
  const payment = event.payload?.payment?.entity;

  if (!payment) {
    logger.warn("payment.success: missing payment entity");
    return;
  }

  const razorpayPaymentId = payment.id as string;
  const amount = payment.amount as number;
  const method = payment.method as string | undefined;

  const paymentRecord = await findOrderForPayment(payment);

  if (!paymentRecord) {
    logger.warn(
      `payment webhook: no payment record found for payment ${razorpayPaymentId}`
    );
    return;
  }

  const order = paymentRecord.order;

  // Idempotency: Already confirmed by browser verify route
  if (order.status === OrderStatus.CONFIRMED) {
    logger.info(
      `payment webhook: order ${order.orderNumber} already confirmed — skipping`
    );
    return;
  }

  const now = new Date();

  const methodMap: Record<string, PaymentMethod> = {
    upi: PaymentMethod.UPI,
    card: PaymentMethod.CARD,
    netbanking: PaymentMethod.NET_BANKING,
    wallet: PaymentMethod.WALLET,
  };

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: PaymentStatus.SUCCESS,
      method: methodMap[method ?? ""] ?? PaymentMethod.UPI,
      gatewayName: "razorpay",
      gatewayPaymentId: razorpayPaymentId,
      gatewayResponse: event.payload as any,
      paidAt: now,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CONFIRMED },
  });

  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.PAYMENT_SUCCESS,
      title: "Payment Successful",
      description: `Payment of ₹${(amount / 100).toFixed(
        2
      )} received via ${method?.toUpperCase() ?? "Razorpay"}`,
      actorType: ActorType.SYSTEM,
      isVisibleToCustomer: true,
      metadata: {
        razorpayPaymentId,
        method,
        amount,
      } as any,
    },
  });

  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.ORDER_CONFIRMED,
      title: "Order Confirmed",
      description:
        "Your order has been confirmed and will enter production soon.",
      actorType: ActorType.SYSTEM,
      isVisibleToCustomer: true,
    },
  });

  // Dispatch confirmation email
  emailService.sendOrderConfirmedEmail(order).catch(() => {});

  logger.info(
    `Order ${order.orderNumber} confirmed via payment webhook (payment: ${razorpayPaymentId}, method: ${method})`
  );
};

// ── payment.failed ────────────────────────────────────────────────────────

const handlePaymentFailed = async (event: any): Promise<void> => {
  const payment = event.payload?.payment?.entity;

  if (!payment) {
    logger.warn("payment.failed: missing payment entity");
    return;
  }

  const razorpayPaymentId = payment.id as string;
  const errorDescription = payment.error_description as string | undefined;
  const errorCode = payment.error_code as string | undefined;

  const paymentRecord = await findOrderForPayment(payment);

  if (!paymentRecord) {
    logger.warn(
      `payment.failed: no payment record found for payment ${razorpayPaymentId}`
    );
    return;
  }

  const order = paymentRecord.order;

  if (paymentRecord.status === PaymentStatus.SUCCESS) {
    logger.info(
      `payment.failed: payment for order ${order.orderNumber} already SUCCESS — ignoring failure event`
    );
    return;
  }

  if (
    order.status === OrderStatus.CONFIRMED ||
    order.status === OrderStatus.IN_PRODUCTION ||
    order.status === OrderStatus.SHIPPED ||
    order.status === OrderStatus.DELIVERED
  ) {
    logger.info(
      `payment.failed: order ${order.orderNumber} already progressed (${order.status}) — ignoring failure event`
    );
    return;
  }

  if (order.status === OrderStatus.PAYMENT_FAILED) {
    logger.info(
      `payment.failed: order ${order.orderNumber} already in PAYMENT_FAILED — skipping`
    );
    return;
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: PaymentStatus.FAILED,
      gatewayPaymentId: razorpayPaymentId,
      failureReason: errorDescription ?? errorCode ?? "Payment failed",
      gatewayResponse: event.payload as any,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PAYMENT_FAILED },
  });

  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.PAYMENT_FAILED,
      title: "Payment Failed",
      description:
        errorDescription ?? "Payment attempt failed. Please try again.",
      actorType: ActorType.SYSTEM,
      isVisibleToCustomer: true,
      metadata: {
        razorpayPaymentId,
        errorCode,
        errorDescription,
      } as any,
    },
  });

  logger.info(
    `Order ${order.orderNumber} payment failed: ${errorDescription ?? errorCode}`
  );
};