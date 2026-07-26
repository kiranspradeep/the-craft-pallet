import { prisma } from "../../../prisma/client.js";
import { OrderStatus, Prisma } from "@prisma/client";

export type AdminOrderSummary = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    payment: true;
    shipment: { include: { shippingPartner: true } };
    _count: { select: { items: true } };
  };
}>;

export type AdminOrderDetail = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: { include: { images: true } };
        variant: true;
        customizations: {
          include: {
            customField: true;
            asset: { include: { files: true } };
          };
        };
      };
    };
    payment: true;
    shipment: { include: { shippingPartner: true } };
    timeline: true;
  };
}>;

export interface FindAllOrdersOptions {
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
}

export interface FindAllOrdersResult {
  orders: AdminOrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const orderRepository = {
  // ── List ──────────────────────────────────────────────────────────────

  findAll: async (
    options: FindAllOrdersOptions
  ): Promise<FindAllOrdersResult> => {
    const {
      page,
      limit,
      search,
      status,
      paymentStatus,
      customerId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { customer: { phone: { contains: search } } },
        ],
      }),
      ...(paymentStatus && {
        payment: { status: paymentStatus as any },
      }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: true,
          payment: true,
          shipment: { include: { shippingPartner: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Find One ──────────────────────────────────────────────────────────

  findById: async (id: string): Promise<AdminOrderDetail | null> => {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
            customizations: {
              include: {
                customField: true,
                asset: { include: { files: true } },
              },
            },
          },
        },
        payment: true,
        shipment: { include: { shippingPartner: true } },
        timeline: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  // ── Update Order ──────────────────────────────────────────────────────

  updateStatus: async (
    id: string,
    status: OrderStatus,
    extra?: { adminNote?: string; productionStage?: any }
  ) => {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        ...(extra?.adminNote && { adminNote: extra.adminNote }),
        ...(extra?.productionStage !== undefined && {
          productionStage: extra.productionStage,
        }),
      },
    });
  },

  updateAdminNote: async (id: string, adminNote: string) => {
    return prisma.order.update({
      where: { id },
      data: { adminNote },
    });
  },

  // ── Timeline ──────────────────────────────────────────────────────────

  appendTimeline: async (data: {
    orderId: string;
    eventType: any;
    title: string;
    description?: string;
    actorType: any;
    actorId?: string;
    isVisibleToCustomer?: boolean;
    metadata?: Record<string, unknown>;
  }) => {
    return prisma.orderTimeline.create({
      data: {
        orderId: data.orderId,
        eventType: data.eventType,
        title: data.title,
        description: data.description,
        actorType: data.actorType,
        actorId: data.actorId ?? null,
        isVisibleToCustomer: data.isVisibleToCustomer ?? false,
        metadata: data.metadata as any,
      },
    });
  },

  // ── Payment ───────────────────────────────────────────────────────────

  findPaymentByOrderId: async (orderId: string) => {
    return prisma.payment.findUnique({ where: { orderId } });
  },

  updatePayment: async (
    orderId: string,
    data: Prisma.PaymentUpdateInput
  ) => {
    return prisma.payment.update({ where: { orderId }, data });
  },

  // ── Shipment ──────────────────────────────────────────────────────────

  findShipmentByOrderId: async (orderId: string) => {
    return prisma.shipment.findUnique({ where: { orderId } });
  },

  createShipment: async (data: {
    orderId: string;
    shippingPartnerId: string;
    trackingNumber: string;
    estimatedDelivery?: Date;
  }) => {
    return prisma.shipment.create({ data });
  },

  updateShipment: async (
    orderId: string,
    data: Prisma.ShipmentUpdateInput
  ) => {
    return prisma.shipment.update({ where: { orderId }, data });
  },

  // ── Shipping Partners ──────────────────────────────────────────────────

  findAllShippingPartners: async () => {
    return prisma.shippingPartner.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
    });
  },
};