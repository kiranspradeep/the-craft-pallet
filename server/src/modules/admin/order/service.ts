import {
  ActorType,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  TimelineEventType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { orderRepository } from "./repository.js";
import { isValidTransition, STATUS_LABELS } from "./statusTransitions.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../../shared/errors/AppError.js";

// ── Helpers ───────────────────────────────────────────────────────────────

const assertOrderExists = async (id: string) => {
  const order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError("Order not found");
  return order;
};

// ── Service ───────────────────────────────────────────────────────────────

export const orderService = {
  // ── List ────────────────────────────────────────────────────────────────

  findAll: async (options: {
    page: number;
    limit: number;
    search?: string;
    status?: OrderStatus;
    paymentStatus?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "createdAt" | "totalAmount" | "orderNumber";
    sortOrder?: "asc" | "desc";
  }) => {
    return orderRepository.findAll(options);
  },

  // ── Get One ──────────────────────────────────────────────────────────────

  findById: async (id: string) => {
    const order = await assertOrderExists(id);
    return order;
  },

  // ── Update Status ────────────────────────────────────────────────────────

  updateStatus: async (
    id: string,
    newStatus: OrderStatus,
    adminId: string,
    note?: string
  ) => {
    const order = await assertOrderExists(id);

    // Validate transition
    if (!isValidTransition(order.status, newStatus)) {
      throw new BadRequestError(
        `Cannot transition from "${STATUS_LABELS[order.status]}" to "${STATUS_LABELS[newStatus]}"`
      );
    }

    // Update order status
    await orderRepository.updateStatus(id, newStatus, {
      adminNote: note,
    });

    // Map status → timeline event type
    const eventTypeMap: Partial<Record<OrderStatus, TimelineEventType>> = {
      [OrderStatus.CONFIRMED]: TimelineEventType.ORDER_CONFIRMED,
      [OrderStatus.IN_PRODUCTION]: TimelineEventType.PRODUCTION_STAGE_CHANGED,
      [OrderStatus.SHIPPED]: TimelineEventType.SHIPPED,
      [OrderStatus.DELIVERED]: TimelineEventType.DELIVERED,
      [OrderStatus.CANCELLED]: TimelineEventType.CANCELLED,
      [OrderStatus.REFUNDED]: TimelineEventType.REFUNDED,
      [OrderStatus.PAYMENT_FAILED]: TimelineEventType.PAYMENT_FAILED,
    };

    const eventType =
      eventTypeMap[newStatus] ?? TimelineEventType.ORDER_CONFIRMED;

    const customerVisibleStatuses: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];
const isCustomerVisible = customerVisibleStatuses.includes(newStatus);

    await orderRepository.appendTimeline({
      orderId: id,
      eventType,
      title: STATUS_LABELS[newStatus],
      description:
        note ?? `Order status updated to ${STATUS_LABELS[newStatus]}`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: isCustomerVisible,
    });

    return orderRepository.findById(id);
  },

  // ── Verify Payment ────────────────────────────────────────────────────────

  verifyPayment: async (
    id: string,
    adminId: string,
    input: {
      approved: boolean;
      note?: string;
      referenceNumber?: string;
    }
  ) => {
    const order = await assertOrderExists(id);

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestError(
        "Payment can only be verified for orders awaiting payment"
      );
    }

    const payment = await orderRepository.findPaymentByOrderId(id);
    if (!payment) throw new NotFoundError("Payment record not found");

    if (input.approved) {
      // Mark payment as success
      await orderRepository.updatePayment(id, {
  status: PaymentStatus.SUCCESS,
  paidAt: new Date(),
  verifiedByAdmin: { connect: { id: adminId } },
  verifiedAt: new Date(),
  referenceNumber: input.referenceNumber ?? null,
  method: "MANUAL",
});

      // Move order to CONFIRMED
      await orderRepository.updateStatus(id, OrderStatus.CONFIRMED);

      // Timeline events
      await orderRepository.appendTimeline({
        orderId: id,
        eventType: TimelineEventType.PAYMENT_SUCCESS,
        title: "Payment Verified",
        description: input.note ?? "Payment has been verified by admin",
        actorType: ActorType.ADMIN,
        actorId: adminId,
        isVisibleToCustomer: true,
        metadata: { referenceNumber: input.referenceNumber },
      });

      await orderRepository.appendTimeline({
        orderId: id,
        eventType: TimelineEventType.ORDER_CONFIRMED,
        title: "Order Confirmed",
        description: "Your order has been confirmed and will be processed",
        actorType: ActorType.ADMIN,
        actorId: adminId,
        isVisibleToCustomer: true,
      });
    } else {
      // Rejected — stay at AWAITING_PAYMENT, mark payment failed
      await orderRepository.updatePayment(id, {
  status: PaymentStatus.FAILED,
  failureReason: input.note ?? "Payment rejected by admin",
  verifiedByAdmin: { connect: { id: adminId } },
  verifiedAt: new Date(),
});

      await orderRepository.appendTimeline({
        orderId: id,
        eventType: TimelineEventType.PAYMENT_FAILED,
        title: "Payment Rejected",
        description:
          input.note ??
          "Payment could not be verified. Please upload a valid screenshot.",
        actorType: ActorType.ADMIN,
        actorId: adminId,
        isVisibleToCustomer: true,
      });
    }

    return orderRepository.findById(id);
  },

  // ── Assign Shipment ──────────────────────────────────────────────────────

  assignShipment: async (
    id: string,
    adminId: string,
    input: {
      shippingPartnerId: string;
      trackingNumber: string;
      estimatedDelivery?: string;
      note?: string;
    }
  ) => {
    const order = await assertOrderExists(id);

    // Must be confirmed or in production before shipping
    const allowedStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PRODUCTION,
    ];

    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestError(
        "Order must be Confirmed or In Production before assigning shipment"
      );
    }

    const existingShipment = await orderRepository.findShipmentByOrderId(id);

    if (existingShipment) {
      // Update existing
      await orderRepository.updateShipment(id, {
        shippingPartner: { connect: { id: input.shippingPartnerId } },
        trackingNumber: input.trackingNumber,
        status: ShipmentStatus.DISPATCHED,
        shippedAt: new Date(),
        ...(input.estimatedDelivery && {
          estimatedDelivery: new Date(input.estimatedDelivery),
        }),
      });
    } else {
      // Create new
      await orderRepository.createShipment({
        orderId: id,
        shippingPartnerId: input.shippingPartnerId,
        trackingNumber: input.trackingNumber,
        estimatedDelivery: input.estimatedDelivery
          ? new Date(input.estimatedDelivery)
          : undefined,
      });
    }

    // Move order to SHIPPED
    await orderRepository.updateStatus(id, OrderStatus.SHIPPED);

    // Load shipping partner name for timeline
    const partners = await orderRepository.findAllShippingPartners();
    const partner = partners.find((p) => p.id === input.shippingPartnerId);

    await orderRepository.appendTimeline({
      orderId: id,
      eventType: TimelineEventType.SHIPPED,
      title: "Order Shipped",
      description: `Shipped via ${partner?.name ?? "courier"}. Tracking: ${input.trackingNumber}`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
      metadata: {
        courier: partner?.name,
        trackingNumber: input.trackingNumber,
        trackingUrl: partner?.trackingUrl,
      },
    });

    return orderRepository.findById(id);
  },

  // ── Cancel Order ──────────────────────────────────────────────────────────

  cancelOrder: async (
    id: string,
    adminId: string,
    reason: string
  ) => {
    const order = await assertOrderExists(id);

    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.AWAITING_PAYMENT,
      OrderStatus.PAYMENT_FAILED,
      OrderStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError(
        `Orders in "${STATUS_LABELS[order.status]}" status cannot be cancelled`
      );
    }

    await orderRepository.updateStatus(id, OrderStatus.CANCELLED, {
      adminNote: reason,
    });

    await orderRepository.appendTimeline({
      orderId: id,
      eventType: TimelineEventType.CANCELLED,
      title: "Order Cancelled",
      description: reason,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
      metadata: { reason },
    });

    return orderRepository.findById(id);
  },

  // ── Refund Order ──────────────────────────────────────────────────────────

  refundOrder: async (
    id: string,
    adminId: string,
    input: { refundAmount: number; reason: string }
  ) => {
    const order = await assertOrderExists(id);

    const refundableStatuses: OrderStatus[] = [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ];

    if (!refundableStatuses.includes(order.status)) {
      throw new BadRequestError(
        "Only delivered or cancelled orders can be refunded"
      );
    }

    const payment = await orderRepository.findPaymentByOrderId(id);
    if (!payment) throw new NotFoundError("Payment record not found");

    const refundDecimal = new Decimal(input.refundAmount);

    if (refundDecimal.gt(new Decimal(payment.amount))) {
      throw new BadRequestError(
        "Refund amount cannot exceed the original payment amount"
      );
    }

    // Update payment
    await orderRepository.updatePayment(id, {
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date(),
      refundAmount: refundDecimal,
      failureReason: input.reason,
    });

    // Update order status
    await orderRepository.updateStatus(id, OrderStatus.REFUNDED);

    await orderRepository.appendTimeline({
      orderId: id,
      eventType: TimelineEventType.REFUNDED,
      title: "Refund Processed",
      description: `₹${refundDecimal.toFixed(2)} refunded. Reason: ${input.reason}`,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: true,
      metadata: {
        refundAmount: input.refundAmount,
        reason: input.reason,
      },
    });

    return orderRepository.findById(id);
  },

  // ── Add Note ──────────────────────────────────────────────────────────────

  addNote: async (
    id: string,
    adminId: string,
    input: { note: string; isVisibleToCustomer: boolean }
  ) => {
    await assertOrderExists(id);

    await orderRepository.updateAdminNote(id, input.note);

    await orderRepository.appendTimeline({
      orderId: id,
      eventType: TimelineEventType.NOTE_ADDED,
      title: "Note Added",
      description: input.note,
      actorType: ActorType.ADMIN,
      actorId: adminId,
      isVisibleToCustomer: input.isVisibleToCustomer,
    });

    return orderRepository.findById(id);
  },

  // ── Update Shipment Status ────────────────────────────────────────────────

  updateShipmentStatus: async (
    id: string,
    adminId: string,
    input: { status: ShipmentStatus; note?: string }
  ) => {
    await assertOrderExists(id);

    const shipment = await orderRepository.findShipmentByOrderId(id);
    if (!shipment) throw new NotFoundError("Shipment not found for this order");

    const updateData: any = { status: input.status };

    if (input.status === ShipmentStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
      // Also update order status to DELIVERED
      await orderRepository.updateStatus(id, OrderStatus.DELIVERED);

      await orderRepository.appendTimeline({
        orderId: id,
        eventType: TimelineEventType.DELIVERED,
        title: "Order Delivered",
        description: input.note ?? "Your order has been delivered",
        actorType: ActorType.ADMIN,
        actorId: adminId,
        isVisibleToCustomer: true,
      });
    }

    await orderRepository.updateShipment(id, updateData);

    return orderRepository.findById(id);
  },

  // ── Shipping Partners ─────────────────────────────────────────────────────

  getShippingPartners: async () => {
    return orderRepository.findAllShippingPartners();
  },
};