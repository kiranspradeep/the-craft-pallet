import { prisma } from "../../../prisma/client.js";
import {
  OrderStatus,
  ProductionStage,
  Prisma,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: true;
        variant: true;
        customizations: {
          include: {
            asset: { include: { files: true } };
          };
        };
      };
    };
    payment: true;
    shipment: { include: { shippingPartner: true } };
    timeline: { orderBy: { createdAt: "asc" } };
  };
}>;

export interface FindAllOrdersOptions {
  page: number;
  limit: number;
  search?: string;
  status?: OrderStatus;
  productionStage?: ProductionStage;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt" | "updatedAt" | "totalAmount";
  sortOrder?: "asc" | "desc";
}

export interface FindAllOrdersResult {
  orders: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lightweight type for list view
export type OrderSummary = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    payment: true;
    _count: { select: { items: true } };
  };
}>;

const orderFullInclude = {
  customer: true,
  items: {
    include: {
      product: true,
      variant: true,
      customizations: {
        include: {
          asset: { include: { files: true } },
        },
      },
    },
  },
  payment: true,
  shipment: { include: { shippingPartner: true } },
  timeline: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

const orderSummaryInclude = {
  customer: true,
  payment: true,
  _count: { select: { items: true } },
} satisfies Prisma.OrderInclude;

export const orderRepository = {
  // ── Find All ──────────────────────────────────────────────────────────
  findAll: async (
    options: FindAllOrdersOptions
  ): Promise<FindAllOrdersResult> => {
    const {
      page,
      limit,
      search,
      status,
      productionStage,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(productionStage && { productionStage }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customer: { phone: { contains: search } } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { shipName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: orderSummaryInclude,
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
  findById: async (id: string): Promise<OrderWithRelations | null> => {
    return prisma.order.findUnique({
      where: { id },
      include: orderFullInclude,
    });
  },

  findByOrderNumber: async (
    orderNumber: string
  ): Promise<OrderWithRelations | null> => {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: orderFullInclude,
    });
  },

  // ── Update Status ─────────────────────────────────────────────────────
  updateStatus: async (
    id: string,
    status: OrderStatus,
    productionStage?: ProductionStage | null
  ) => {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        ...(productionStage !== undefined && { productionStage }),
      },
      include: orderFullInclude,
    });
  },

  // ── Update Production Stage ───────────────────────────────────────────
  updateProductionStage: async (id: string, productionStage: ProductionStage) => {
    return prisma.order.update({
      where: { id },
      data: { productionStage },
      include: orderFullInclude,
    });
  },

  // ── Update Admin Note ─────────────────────────────────────────────────
  updateAdminNote: async (id: string, adminNote: string) => {
    return prisma.order.update({
      where: { id },
      data: { adminNote },
      include: orderFullInclude,
    });
  },

  // ── Production Queue ──────────────────────────────────────────────────
  findProductionQueue: async (): Promise<OrderSummary[]> => {
    return prisma.order.findMany({
      where: { status: OrderStatus.IN_PRODUCTION },
      orderBy: { createdAt: "asc" },
      include: orderSummaryInclude,
    });
  },

  // ── Timeline ──────────────────────────────────────────────────────────
  createTimelineEvent: async (data: {
    orderId: string;
    eventType: string;
    title: string;
    description?: string;
    actorType: string;
    actorId?: string;
    isVisibleToCustomer?: boolean;
    metadata?: Record<string, unknown>;
  }) => {
    return prisma.orderTimeline.create({
      data: {
        orderId: data.orderId,
        eventType: data.eventType as any,
        title: data.title,
        description: data.description,
        actorType: data.actorType as any,
        actorId: data.actorId,
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
    data: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      gatewayName?: string;
      gatewayOrderId?: string;
      gatewayPaymentId?: string;
      gatewaySignature?: string;
      gatewayResponse?: Record<string, unknown>;
      referenceNumber?: string;
      paidAt?: Date;
      verifiedBy?: string;
      verifiedAt?: Date;
      failureReason?: string;
    }
  ) => {
    return prisma.payment.update({
      where: { orderId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.method && { method: data.method }),
        ...(data.gatewayName !== undefined && {
          gatewayName: data.gatewayName,
        }),
        ...(data.gatewayOrderId !== undefined && {
          gatewayOrderId: data.gatewayOrderId,
        }),
        ...(data.gatewayPaymentId !== undefined && {
          gatewayPaymentId: data.gatewayPaymentId,
        }),
        ...(data.gatewaySignature !== undefined && {
          gatewaySignature: data.gatewaySignature,
        }),
        ...(data.gatewayResponse !== undefined && {
          gatewayResponse: data.gatewayResponse as any,
        }),
        ...(data.referenceNumber !== undefined && {
          referenceNumber: data.referenceNumber,
        }),
        ...(data.paidAt && { paidAt: data.paidAt }),
        ...(data.verifiedBy !== undefined && {
          verifiedBy: data.verifiedBy,
        }),
        ...(data.verifiedAt && { verifiedAt: data.verifiedAt }),
        ...(data.failureReason !== undefined && {
          failureReason: data.failureReason,
        }),
      },
    });
  },

  // ── Razorpay settings ─────────────────────────────────────────────────
  getPaymentSettings: async () => {
    return prisma.paymentSetting.findFirst();
  },

  // ── Stats for dashboard ───────────────────────────────────────────────
  getStats: async () => {
    const [
      totalOrders,
      pendingPayment,
      confirmed,
      inProduction,
      shipped,
      delivered,
      cancelled,
    ] = await prisma.$transaction([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.AWAITING_PAYMENT } }),
      prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { status: OrderStatus.IN_PRODUCTION } }),
      prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    return {
      totalOrders,
      pendingPayment,
      confirmed,
      inProduction,
      shipped,
      delivered,
      cancelled,
    };
  },
};