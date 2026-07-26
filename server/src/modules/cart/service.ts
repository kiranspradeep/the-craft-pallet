import { CustomFieldType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { cartRepository } from "./repository.js";
import {
  calculateUnitPrice,
  calculateCartTotals,
  applyCouponDiscount,
} from "./pricingCalculator.js";
import { prisma } from "../../prisma/client.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../shared/errors/AppError.js";

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Get or create cart for a session.
 */
const getOrCreateCart = async (sessionId: string) => {
  const existing = await cartRepository.findBySessionId(sessionId);
  if (existing) return existing;
  return cartRepository.create(sessionId);
};

/**
 * Assert a cart item belongs to the given session's cart.
 */
const assertItemOwnership = async (sessionId: string, itemId: string) => {
  const cart = await cartRepository.findBySessionId(sessionId);
  if (!cart) throw new NotFoundError("Cart not found");

  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError("Cart item not found");

  return { cart, item };
};

// ── Service ───────────────────────────────────────────────────────────────

export const cartService = {
  // ── Get Cart ──────────────────────────────────────────────────────────

  getCart: async (sessionId: string) => {
    const cart = await getOrCreateCart(sessionId);
    const totals = calculateCartTotals(
      cart.items.map((i) => ({
        quantity: i.quantity,
        unitPrice: new Decimal(i.unitPrice),
      }))
    );
    return { cart, totals };
  },

  // ── Add Item ──────────────────────────────────────────────────────────

  addItem: async (
    sessionId: string,
    input: {
      productId: string;
      variantId?: string;
      quantity: number;
      notes?: string;
      customizations?: {
        customFieldId: string;
        fieldLabel: string;
        fieldType: CustomFieldType;
        textValue?: string;
        numberValue?: number;
        dateValue?: string;
        booleanValue?: boolean;
        assetId?: string;
      }[];
    }
  ) => {
    // 1. Load product with pricing and configuration
    const product = await prisma.product.findFirst({
      where: { id: input.productId, deletedAt: null, isActive: true },
      include: {
        pricingConfig: true,
        configuration: true,
        variants: true,
        customFields: { include: { options: true } },
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found or inactive");
    }

    if (!product.pricingConfig) {
      throw new BadRequestError("Product pricing is not configured");
    }

    // 2. Validate variant if required
    let variantPrice: Decimal | null = null;

    if (input.variantId) {
      const variant = product.variants.find(
        (v) => v.id === input.variantId && v.isActive
      );
      if (!variant) {
        throw new NotFoundError("Variant not found or inactive");
      }
      variantPrice = new Decimal(variant.price);
    }

    // 3. Calculate unit price
    const unitPrice = calculateUnitPrice(
      product.pricingConfig.strategy,
      input.quantity,
      product.pricingConfig
        ? {
            strategy: product.pricingConfig.strategy,
            unitPrice: product.pricingConfig.unitPrice
              ? new Decimal(product.pricingConfig.unitPrice)
              : null,
            incrementQuantity: product.pricingConfig.incrementQuantity,
            incrementPrice: product.pricingConfig.incrementPrice
              ? new Decimal(product.pricingConfig.incrementPrice)
              : null,
            minimumOrderQuantity: product.pricingConfig.minimumOrderQuantity,
          }
        : null,
      variantPrice
    );

    // 4. Validate required custom fields
    const requiredFields = product.customFields.filter((f) => f.isRequired);
    for (const field of requiredFields) {
      const provided = input.customizations?.find(
        (c) => c.customFieldId === field.id
      );
      if (!provided) {
        throw new BadRequestError(
          `Required field "${field.label}" is missing`
        );
      }
    }

    // 5. Get or create cart
    const cart = await getOrCreateCart(sessionId);

    // 6. Create cart item
    const cartItem = await cartRepository.createItem({
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitPrice,
      notes: input.notes,
    });

    // 7. Save customizations
    if (input.customizations && input.customizations.length > 0) {
      for (const c of input.customizations) {
        await cartRepository.createCustomization({
          customField: { connect: { id: c.customFieldId } },
          cartItem: { connect: { id: cartItem.id } },
          fieldLabel: c.fieldLabel,
          fieldType: c.fieldType,
          textValue: c.textValue ?? null,
          numberValue: c.numberValue !== undefined
            ? new Decimal(c.numberValue)
            : null,
          dateValue: c.dateValue ? new Date(c.dateValue) : null,
          booleanValue: c.booleanValue ?? null,
          asset: c.assetId
            ? { connect: { id: c.assetId } }
            : undefined,
        });
      }
    }

    // 8. Touch cart activity
    await cartRepository.touchActivity(cart.id);

    // 9. Return updated cart
    return cartRepository.findBySessionId(sessionId);
  },

  // ── Update Item ───────────────────────────────────────────────────────

  updateItem: async (
    sessionId: string,
    itemId: string,
    input: { quantity?: number; notes?: string }
  ) => {
    const { cart, item } = await assertItemOwnership(sessionId, itemId);

    // If quantity is changing, recalculate price
    if (input.quantity !== undefined && input.quantity !== item.quantity) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
        include: { pricingConfig: true },
      });

      if (product?.pricingConfig) {
        const variantPrice = item.variant
          ? new Decimal(item.variant.price)
          : null;

        const newUnitPrice = calculateUnitPrice(
          product.pricingConfig.strategy,
          input.quantity,
          {
            strategy: product.pricingConfig.strategy,
            unitPrice: product.pricingConfig.unitPrice
              ? new Decimal(product.pricingConfig.unitPrice)
              : null,
            incrementQuantity: product.pricingConfig.incrementQuantity,
            incrementPrice: product.pricingConfig.incrementPrice
              ? new Decimal(product.pricingConfig.incrementPrice)
              : null,
            minimumOrderQuantity: product.pricingConfig.minimumOrderQuantity,
          },
          variantPrice
        );

        // Update with recalculated price
        await prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity: input.quantity, unitPrice: newUnitPrice },
        });
      } else {
        await cartRepository.updateItem(itemId, { quantity: input.quantity });
      }
    }

    if (input.notes !== undefined) {
      await cartRepository.updateItem(itemId, { notes: input.notes });
    }

    await cartRepository.touchActivity(cart.id);

    return cartRepository.findBySessionId(sessionId);
  },

  // ── Remove Item ───────────────────────────────────────────────────────

  removeItem: async (sessionId: string, itemId: string) => {
    const { cart } = await assertItemOwnership(sessionId, itemId);

    // Customizations cascade-delete via DB constraint
    await cartRepository.deleteItem(itemId);
    await cartRepository.touchActivity(cart.id);

    return cartRepository.findBySessionId(sessionId);
  },

  // ── Apply Coupon ──────────────────────────────────────────────────────

  applyCoupon: async (sessionId: string, code: string) => {
    const cart = await cartRepository.findBySessionId(sessionId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError("Your cart is empty");
    }

    const coupon = await cartRepository.findCouponByCode(code);

    if (!coupon) throw new NotFoundError("Coupon not found");
    if (!coupon.isActive) throw new BadRequestError("This coupon is inactive");

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestError("This coupon is not yet active");
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestError("This coupon has expired");
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestError("This coupon has reached its usage limit");
    }

    const { subtotal } = calculateCartTotals(
      cart.items.map((i) => ({
        quantity: i.quantity,
        unitPrice: new Decimal(i.unitPrice),
      }))
    );

    const discountAmount = applyCouponDiscount(subtotal, {
      discountPercent: coupon.discountPercent
        ? new Decimal(coupon.discountPercent)
        : null,
      discountFlat: coupon.discountFlat
        ? new Decimal(coupon.discountFlat)
        : null,
      minOrderAmount: coupon.minOrderAmount
        ? new Decimal(coupon.minOrderAmount)
        : null,
    });

    return {
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        discountFlat: coupon.discountFlat,
      },
      subtotal,
      discountAmount,
      total: subtotal.sub(discountAmount),
    };
  },

  // ── Clear Cart ────────────────────────────────────────────────────────

  clearCart: async (sessionId: string) => {
    const cart = await cartRepository.findBySessionId(sessionId);
    if (cart) {
      await cartRepository.deleteById(cart.id);
    }
  },
};