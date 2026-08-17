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

const getOrCreateCart = async (sessionId: string) => {
  const existing = await cartRepository.findBySessionId(sessionId);
  if (existing) return existing;
  return cartRepository.create(sessionId);
};

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
      selectedTierQuantity?: number;
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
    // 1. Load product
    const product = await prisma.product.findFirst({
      where: { id: input.productId, deletedAt: null, isActive: true },
      include: {
        pricingConfig: { include: { tiers: true } },
        configuration: true,
        variants: true,
        customFields: { include: { options: true } },
      },
    });

    if (!product) throw new NotFoundError("Product not found or inactive");
    if (!product.pricingConfig)
      throw new BadRequestError("Product pricing is not configured");

    // 2. Validate variant
    let variantPrice: Decimal | null = null;
    if (input.variantId) {
      const variant = product.variants.find(
        (v) => v.id === input.variantId && v.isActive
      );
      if (!variant) throw new NotFoundError("Variant not found or inactive");
      variantPrice = new Decimal(variant.price);
    }

    // 3. Calculate unit price
    const unitPrice = calculateUnitPrice(
      product.pricingConfig.strategy,
      input.quantity,
      {
        strategy: product.pricingConfig.strategy,
        unitPrice: product.pricingConfig.unitPrice
          ? new Decimal(product.pricingConfig.unitPrice)
          : null,
        baseUnitPrice: product.pricingConfig.baseUnitPrice
          ? new Decimal(product.pricingConfig.baseUnitPrice)
          : null,
        incrementQuantity: product.pricingConfig.incrementQuantity,
        incrementPrice: product.pricingConfig.incrementPrice
          ? new Decimal(product.pricingConfig.incrementPrice)
          : null,
        minimumOrderQuantity: product.pricingConfig.minimumOrderQuantity,
        tiers: product.pricingConfig.tiers.map((t) => ({
          quantity: t.quantity,
          price: new Decimal(t.price),
          label: t.label,
          isSpecialOffer: t.isSpecialOffer,
        })),
      },
      variantPrice,
      input.selectedTierQuantity
    );

    // 4. Validate required custom fields (excluding PHOTO_UPLOAD)
    const requiredFields = product.customFields.filter(
      (f) => f.isRequired && f.type !== "PHOTO_UPLOAD"
    );
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
      selectedTierQuantity: input.selectedTierQuantity,
      notes: input.notes,
    });

    // 7. Determine per-unit customization strategy
    //
    // FIXED_VARIANTS / PER_UNIT:
    //   quantity = number of physical items → one set of rows per unit
    // INCREMENTAL_QUANTITY / TIERED_PRICING / CUSTOM_QUOTE:
    //   quantity = number of prints/photos → one set of rows total
    const strategy = product.pricingConfig.strategy;
    const needsPerUnitCustomization =
      strategy === "FIXED_VARIANTS" || strategy === "PER_UNIT";
    const unitCount = needsPerUnitCustomization ? input.quantity : 1;

    // 7a. Non-PHOTO_UPLOAD fields — create per unit
    if (input.customizations && input.customizations.length > 0) {
      for (let unitIndex = 0; unitIndex < unitCount; unitIndex++) {
        for (const c of input.customizations) {
          if (c.fieldType === "PHOTO_UPLOAD") continue;

          await cartRepository.createCustomization({
            customField: { connect: { id: c.customFieldId } },
            cartItem: { connect: { id: cartItem.id } },
            fieldLabel: c.fieldLabel,
            fieldType: c.fieldType,
            unitIndex,
            textValue: unitIndex === 0 ? (c.textValue ?? null) : null,
            numberValue:
              unitIndex === 0 && c.numberValue !== undefined
                ? new Decimal(c.numberValue)
                : null,
            dateValue:
              unitIndex === 0 && c.dateValue
                ? new Date(c.dateValue)
                : null,
            booleanValue:
              unitIndex === 0 ? (c.booleanValue ?? null) : null,
          });
        }
      }
    }

    // 7b. PHOTO_UPLOAD placeholder rows — one per unit per upload field
    if (product.configuration?.uploadRequired) {
      const photoUploadFields = product.customFields.filter(
        (f) => f.type === "PHOTO_UPLOAD"
      );

      const uploadUnitCount = needsPerUnitCustomization
        ? input.quantity
        : 1;

      for (const field of photoUploadFields) {
        for (let unitIndex = 0; unitIndex < uploadUnitCount; unitIndex++) {
          await cartRepository.createCustomization({
            customField: { connect: { id: field.id } },
            cartItem: { connect: { id: cartItem.id } },
            fieldLabel: field.label,
            fieldType: "PHOTO_UPLOAD",
            unitIndex,
          });
        }
      }
    }

    // 8. Touch cart activity
    await cartRepository.touchActivity(cart.id);

    // 9. Return updated cart
    return cartRepository.findBySessionId(sessionId);
  },

  // ── Update Item ───────────────────────────────────────────────────────
  //
  // When quantity changes on a per-unit product (FIXED_VARIANTS / PER_UNIT),
  // we also create or remove customization rows to match the new quantity.

  updateItem: async (
    sessionId: string,
    itemId: string,
    input: { quantity?: number; notes?: string }
  ) => {
    const { cart, item } = await assertItemOwnership(sessionId, itemId);

    if (input.quantity !== undefined && input.quantity !== item.quantity) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
        include: {
          pricingConfig: { include: { tiers: true } },
          configuration: true,
          customFields: true,
        },
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
            baseUnitPrice: product.pricingConfig.baseUnitPrice
              ? new Decimal(product.pricingConfig.baseUnitPrice)
              : null,
            incrementQuantity: product.pricingConfig.incrementQuantity,
            incrementPrice: product.pricingConfig.incrementPrice
              ? new Decimal(product.pricingConfig.incrementPrice)
              : null,
            minimumOrderQuantity: product.pricingConfig.minimumOrderQuantity,
            tiers: product.pricingConfig.tiers.map((t) => ({
              quantity: t.quantity,
              price: new Decimal(t.price),
              label: t.label,
              isSpecialOffer: t.isSpecialOffer,
            })),
          },
          variantPrice,
          item.selectedTierQuantity ?? undefined
        );

        await prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity: input.quantity, unitPrice: newUnitPrice },
        });

        // Sync customization rows when quantity changes on per-unit products
        const strategy = product.pricingConfig.strategy;
        const needsPerUnit =
          strategy === "FIXED_VARIANTS" || strategy === "PER_UNIT";

        if (needsPerUnit) {
          if (input.quantity > item.quantity) {
            // Quantity increased — add rows for new units
            const photoUploadFields = product.customFields.filter(
              (f) => f.type === "PHOTO_UPLOAD"
            );
            const otherFields = product.customFields.filter(
              (f) => f.type !== "PHOTO_UPLOAD"
            );

            for (
              let unitIndex = item.quantity;
              unitIndex < input.quantity;
              unitIndex++
            ) {
              // PHOTO_UPLOAD placeholders
              for (const field of photoUploadFields) {
                await cartRepository.createCustomization({
                  customField: { connect: { id: field.id } },
                  cartItem: { connect: { id: itemId } },
                  fieldLabel: field.label,
                  fieldType: "PHOTO_UPLOAD",
                  unitIndex,
                });
              }

              // Other field placeholders (empty — customer fills later)
              for (const field of otherFields) {
                await cartRepository.createCustomization({
                  customField: { connect: { id: field.id } },
                  cartItem: { connect: { id: itemId } },
                  fieldLabel: field.label,
                  fieldType: field.type as CustomFieldType,
                  unitIndex,
                });
              }
            }
          } else {
            // Quantity decreased — remove rows for units that no longer exist
            await prisma.customization.deleteMany({
              where: {
                cartItemId: itemId,
                unitIndex: { gte: input.quantity },
              },
            });
          }
        }
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
    if (!coupon.isActive)
      throw new BadRequestError("This coupon is inactive");

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now)
      throw new BadRequestError("This coupon is not yet active");
    if (coupon.expiresAt && coupon.expiresAt < now)
      throw new BadRequestError("This coupon has expired");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      throw new BadRequestError("This coupon has reached its usage limit");

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
    if (cart) await cartRepository.deleteById(cart.id);
  },

  // ── Link Asset to Upload Field ────────────────────────────────────────

  linkAssetToCustomization: async (
    sessionId: string,
    itemId: string,
    customizationId: string,
    assetId: string
  ) => {
    const { cart } = await assertItemOwnership(sessionId, itemId);

    const customization = await prisma.customization.findFirst({
      where: {
        id: customizationId,
        cartItemId: itemId,
        fieldType: "PHOTO_UPLOAD",
      },
    });

    if (!customization)
      throw new NotFoundError("Upload field not found on this cart item");

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundError("Asset not found");

    await prisma.customization.update({
      where: { id: customizationId },
      data: { assetId },
    });

    await cartRepository.touchActivity(cart.id);
    return cartRepository.findBySessionId(sessionId);
  },
};