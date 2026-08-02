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
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
};

// ── Main Webhook Handler ──────────────────────────────────────────────────

export const razorpayWebhookHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Verify secret is configured
  if (!webhookSecret) {
    logger.error("RAZORPAY_WEBHOOK_SECRET is not set");
    res.status(500).json({ success: false, message: "Webhook secret not configured" });
    return;
  }

  // 2. Verify signature
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

  // 3. Parse event
  const event = req.body;
  const eventType = event.event as string;

  logger.info(`Razorpay webhook received: ${eventType}`);

  // 4. Route to handler
  try {
    switch (eventType) {
      case "payment_link.paid":
        await handlePaymentLinkPaid(event);
        break;

      case "payment.captured":
        await handlePaymentCaptured(event);
        break;

      case "payment.failed":
        await handlePaymentFailed(event);
        break;

      default:
        logger.info(`Razorpay webhook: unhandled event type "${eventType}"`);
    }

    // Always respond 200 to Razorpay quickly
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Razorpay webhook handler error for event ${eventType}:`, err);
    // Still return 200 — Razorpay will retry on non-200
    // We log the error but don't want infinite retries for logic errors
    res.status(200).json({ success: true });
  }
};

// ── payment_link.paid ─────────────────────────────────────────────────────

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

  // Find order by gatewayOrderId (we stored payment link ID there)
  const paymentRecord = await prisma.payment.findFirst({
    where: { gatewayOrderId: paymentLinkId },
    include: { order: { include: { customer: true } } },
  });

  if (!paymentRecord) {
    logger.warn(
      `payment_link.paid: no payment record found for link ID ${paymentLinkId}`
    );
    return;
  }

  const order = paymentRecord.order;

  // Idempotency check — don't process if already confirmed
  if (order.status === OrderStatus.CONFIRMED) {
    logger.info(
      `payment_link.paid: order ${order.orderNumber} already confirmed — skipping`
    );
    return;
  }

  const now = new Date();

  // Update payment record
  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: PaymentStatus.SUCCESS,
      method: PaymentMethod.UPI, // default — Razorpay handles method
      gatewayName: "razorpay",
      gatewayPaymentId: razorpayPaymentId ?? null,
      gatewaySignature: razorpaySignature ?? null,
      gatewayResponse: event.payload as any,
      paidAt: now,
    },
  });

  // Update order status → CONFIRMED
  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CONFIRMED },
  });

  // Timeline — payment success
  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.PAYMENT_SUCCESS,
      title: "Payment Successful",
      description: `Payment of ₹${Number(order.totalAmount).toFixed(2)} received successfully via Razorpay`,
      actorType: ActorType.SYSTEM,
      isVisibleToCustomer: true,
      metadata: {
        paymentLinkId,
        razorpayPaymentId,
        amount: order.totalAmount,
      } as any,
    },
  });

  // Timeline — order confirmed
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

  logger.info(
    `Order ${order.orderNumber} confirmed via payment_link.paid webhook`
  );
};

// ── payment.captured ──────────────────────────────────────────────────────

const handlePaymentCaptured = async (event: any): Promise<void> => {
  const payment = event.payload?.payment?.entity;

  if (!payment) {
    logger.warn("payment.captured: missing payment entity");
    return;
  }

  const razorpayPaymentId = payment.id as string;
  const paymentLinkId = payment.payment_link_id as string | undefined;

  if (!paymentLinkId) {
    // Not a payment link payment — skip
    logger.info(
      `payment.captured: no payment_link_id on payment ${razorpayPaymentId} — skipping`
    );
    return;
  }

  // Find payment record
  const paymentRecord = await prisma.payment.findFirst({
    where: { gatewayOrderId: paymentLinkId },
    include: { order: true },
  });

  if (!paymentRecord) {
    logger.warn(
      `payment.captured: no payment record found for link ${paymentLinkId}`
    );
    return;
  }

  // Already handled by payment_link.paid — just update payment ID if missing
  if (!paymentRecord.gatewayPaymentId) {
    await prisma.payment.update({
      where: { orderId: paymentRecord.orderId },
      data: {
        gatewayPaymentId: razorpayPaymentId,
        status: PaymentStatus.SUCCESS,
      },
    });
  }

  logger.info(
    `payment.captured: payment ${razorpayPaymentId} captured for order ${paymentRecord.order.orderNumber}`
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
  const paymentLinkId = payment.payment_link_id as string | undefined;
  const errorDescription =
    payment.error_description as string | undefined;
  const errorCode = payment.error_code as string | undefined;

  if (!paymentLinkId) {
    logger.info(
      `payment.failed: no payment_link_id on payment ${razorpayPaymentId} — skipping`
    );
    return;
  }

  // Find payment record
  const paymentRecord = await prisma.payment.findFirst({
    where: { gatewayOrderId: paymentLinkId },
    include: { order: true },
  });

  if (!paymentRecord) {
    logger.warn(
      `payment.failed: no payment record found for link ${paymentLinkId}`
    );
    return;
  }

  const order = paymentRecord.order;

  // Idempotency — skip if already failed
  if (order.status === OrderStatus.PAYMENT_FAILED) {
    logger.info(
      `payment.failed: order ${order.orderNumber} already in PAYMENT_FAILED — skipping`
    );
    return;
  }

  // Update payment record
  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: PaymentStatus.FAILED,
      gatewayPaymentId: razorpayPaymentId,
      failureReason: errorDescription ?? errorCode ?? "Payment failed",
      gatewayResponse: event.payload as any,
    },
  });

  // Update order status → PAYMENT_FAILED
  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PAYMENT_FAILED },
  });

  // Timeline
  await prisma.orderTimeline.create({
    data: {
      orderId: order.id,
      eventType: TimelineEventType.PAYMENT_FAILED,
      title: "Payment Failed",
      description:
        errorDescription ??
        "Payment attempt failed. A new payment link can be generated.",
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