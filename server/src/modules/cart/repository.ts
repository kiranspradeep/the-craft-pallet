import { prisma } from "../../prisma/client.js";
import { Prisma } from "@prisma/client";

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: true;
            configuration: true;
            pricingConfig: {
              include: { tiers: true };
            };
          };
        };
        variant: true;
        customizations: {
          include: { asset: { include: { files: true } } };
        };
      };
    };
  };
}>;

export type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        images: true;
        configuration: true;
        pricingConfig: {
          include: { tiers: true };
        };
      };
    };
    variant: true;
    customizations: {
      include: { asset: { include: { files: true } } };
    };
  };
}>;

export const cartRepository = {
  // ── Cart ──────────────────────────────────────────────────────────────

  findBySessionId: async (sessionId: string): Promise<CartWithItems | null> => {
    return prisma.cart.findUnique({
      where: { sessionId },
      include: cartInclude,
    });
  },

  findById: async (id: string): Promise<CartWithItems | null> => {
    return prisma.cart.findUnique({
      where: { id },
      include: cartInclude,
    });
  },

  create: async (sessionId: string): Promise<CartWithItems> => {
    return prisma.cart.create({
      data: {
        sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(),
      },
      include: cartInclude,
    });
  },

  touchActivity: async (cartId: string): Promise<void> => {
    await prisma.cart.update({
      where: { id: cartId },
      data: { lastActivityAt: new Date() },
    });
  },

  deleteById: async (cartId: string): Promise<void> => {
    await prisma.cart.delete({ where: { id: cartId } });
  },

  // ── Cart Items ────────────────────────────────────────────────────────

  findItemById: async (
    itemId: string
  ): Promise<CartItemWithRelations | null> => {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: itemInclude,
    });
  },

  createItem: async (data: {
    cartId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: Prisma.Decimal | number;
    selectedTierQuantity?: number;
    notes?: string;
  }): Promise<CartItemWithRelations> => {
    return prisma.cartItem.create({
      data: {
        cartId: data.cartId,
        productId: data.productId,
        variantId: data.variantId ?? null,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        selectedTierQuantity: data.selectedTierQuantity ?? null,
        notes: data.notes ?? null,
      },
      include: itemInclude,
    });
  },

  updateItem: async (
    itemId: string,
    data: {
      quantity?: number;
      notes?: string;
    }
  ): Promise<CartItemWithRelations> => {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: itemInclude,
    });
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await prisma.cartItem.delete({ where: { id: itemId } });
  },

  // ── Customizations ────────────────────────────────────────────────────

  createCustomization: async (data: Prisma.CustomizationCreateInput) => {
    return prisma.customization.create({ data });
  },

  findCustomizationsByCartItemId: async (cartItemId: string) => {
    return prisma.customization.findMany({
      where: { cartItemId },
      orderBy: { unitIndex: "asc" }, // always return in unit order
      include: { asset: { include: { files: true } } },
    });
  },

  deleteCustomizationsByCartItemId: async (cartItemId: string) => {
    await prisma.customization.deleteMany({ where: { cartItemId } });
  },

  // ── Coupon ────────────────────────────────────────────────────────────

  findCouponByCode: async (code: string) => {
    return prisma.coupon.findUnique({ where: { code } });
  },
};

// ── Shared includes ───────────────────────────────────────────────────────

const itemInclude = {
  product: {
    include: {
      images: true,
      configuration: true,
      pricingConfig: {
        include: { tiers: true },
      },
    },
  },
  variant: true,
  customizations: {
    orderBy: { unitIndex: "asc" as const }, // ordered by unit so upload page is consistent
    include: {
      asset: { include: { files: true } },
    },
  },
} satisfies Prisma.CartItemInclude;

const cartInclude = {
  items: {
    include: itemInclude,
  },
} satisfies Prisma.CartInclude;