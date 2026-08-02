import { prisma } from "../../prisma/client.js";
import { Order, Prisma } from "@prisma/client";

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
    shipment: true;
    timeline: true;
  };
}>;

const orderInclude = {
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
  shipment: true,
  timeline: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

export const checkoutRepository = {
  findOrderById: async (id: string): Promise<OrderWithRelations | null> => {
    return prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  findOrderByNumber: async (
    orderNumber: string
  ): Promise<OrderWithRelations | null> => {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: orderInclude,
    });
  },

  findOrderByWhatsappToken: async (
    token: string
  ): Promise<OrderWithRelations | null> => {
    return prisma.order.findUnique({
      where: { whatsappToken: token },
      include: orderInclude,
    });
  },

  // ── Checkout Sessions (Buy Now) ────────────────────────────────────────

  createCheckoutSession: async (data: {
    sessionId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    selectedTierQuantity?: number;
    unitPrice: Prisma.Decimal | number;
    notes?: string;
    customizations?: any;
    assetId?: string;
  }) => {
    return prisma.checkoutSession.create({
      data: {
        sessionId: data.sessionId,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        selectedTierQuantity: data.selectedTierQuantity,
        unitPrice: data.unitPrice,
        notes: data.notes,
        customizations: data.customizations,
        assetId: data.assetId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      },
    });
  },

  findCheckoutSession: async (id: string) => {
    return prisma.checkoutSession.findUnique({
      where: { id },
    });
  },

  updateCheckoutSession: async (
    id: string,
    data: {
      assetId?: string;
      customizations?: any;
    }
  ) => {
    return prisma.checkoutSession.update({
      where: { id },
      data: {
        ...(data.assetId !== undefined && { assetId: data.assetId }),
        ...(data.customizations !== undefined && {
          customizations: data.customizations,
        }),
      },
    });
  },

  deleteCheckoutSession: async (id: string) => {
    return prisma.checkoutSession.delete({ where: { id } });
  },

  cleanupExpiredSessions: async () => {
    return prisma.checkoutSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};