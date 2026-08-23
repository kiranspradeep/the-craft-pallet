import { prisma } from "../../../prisma/client.js";
import {
  OrderStatus,
  PhotoStatus,
  ProductionStage,
  Prisma,
  PaymentStatus,
  PaymentMethod,
  OrderSource,
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
  photoStatus?: PhotoStatus;
  orderSource?: OrderSource;
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
      photoStatus,
      orderSource,
      productionStage,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(photoStatus && { photoStatus }),
      ...(orderSource && { orderSource }),
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

  updatePhotoStatus: async (id: string, photoStatus: PhotoStatus) => {
    return prisma.order.update({
      where: { id },
      data: { photoStatus },
      include: orderFullInclude,
    });
  },

  updateProductionStage: async (
    id: string,
    productionStage: ProductionStage
  ) => {
    return prisma.order.update({
      where: { id },
      data: { productionStage },
      include: orderFullInclude,
    });
  },

  updateAdminNote: async (id: string, adminNote: string) => {
    return prisma.order.update({
      where: { id },
      data: { adminNote },
      include: orderFullInclude,
    });
  },

  findProductionQueue: async (): Promise<OrderSummary[]> => {
    return prisma.order.findMany({
      where: { status: OrderStatus.IN_PRODUCTION },
      orderBy: { createdAt: "asc" },
      include: orderSummaryInclude,
    });
  },

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

  getPaymentSettings: async () => {
    return prisma.paymentSetting.findFirst();
  },

  getStats: async () => {
    const [
      totalOrders,
      draft,
      pendingPayment,
      confirmed,
      inProduction,
      shipped,
      delivered,
      cancelled,
      whatsappOrders,
      awaitingPhotos,
      photosToVerify,
    ] = await prisma.$transaction([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.DRAFT } }),
      prisma.order.count({ where: { status: OrderStatus.AWAITING_PAYMENT } }),
      prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { status: OrderStatus.IN_PRODUCTION } }),
      prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      prisma.order.count({ where: { orderSource: OrderSource.WHATSAPP } }),
      prisma.order.count({
        where: { photoStatus: PhotoStatus.NOT_RECEIVED },
      }),
      prisma.order.count({
        where: { photoStatus: PhotoStatus.RECEIVED },
      }),
    ]);

    return {
      totalOrders,
      draft,
      pendingPayment,
      confirmed,
      inProduction,
      shipped,
      delivered,
      cancelled,
      whatsappOrders,
      awaitingPhotos,
      photosToVerify,
    };
  },

  createShipment: async (data: {
  orderId: string;
  trackingNumber: string;
  shippingPartnerId?: string;
  estimatedDelivery?: Date;
}) => {
  // Find or create a default shipping partner if none provided
  let partnerId = data.shippingPartnerId;
  if (!partnerId) {
    // Use India Post as default
    let partner = await prisma.shippingPartner.findFirst({
      where: { code: "INDIA_POST" },
    });
    if (!partner) {
      partner = await prisma.shippingPartner.create({
        data: {
          name: "India Post",
          code: "INDIA_POST",
          trackingUrl: "https://www.indiapost.gov.in/",
          isActive: true,
        },
      });
    }
    partnerId = partner.id;
  }

  return prisma.shipment.upsert({
    where: { orderId: data.orderId },
    create: {
      orderId: data.orderId,
      shippingPartnerId: partnerId,
      trackingNumber: data.trackingNumber,
      status: "PENDING",
      shippedAt: new Date(),
      estimatedDelivery: data.estimatedDelivery,
    },
    update: {
      trackingNumber: data.trackingNumber,
      shippingPartnerId: partnerId,
      shippedAt: new Date(),
      estimatedDelivery: data.estimatedDelivery,
    },
  });
},

};