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
};

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