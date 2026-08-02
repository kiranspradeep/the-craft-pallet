import { PricingStrategy } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { BadRequestError } from "../../shared/errors/AppError.js";

export interface PricingTier {
  quantity: number;
  price: Decimal;
  label?: string | null;
  isSpecialOffer?: boolean;
}

export interface PricingConfig {
  strategy: PricingStrategy;
  unitPrice?: Decimal | null;
  baseUnitPrice?: Decimal | null;
  incrementQuantity?: number | null;
  incrementPrice?: Decimal | null;
  minimumOrderQuantity?: number | null;
  tiers?: PricingTier[];
}

/**
 * Calculate the unit price for a cart item based on
 * the product's pricing strategy.
 *
 * For TIERED_PRICING:
 * - Customer must explicitly select a tier (pass selectedTierQuantity)
 * - If no tier selected and baseUnitPrice exists → baseUnitPrice per unit
 * - If no tier and no baseUnitPrice → error
 */
export const calculateUnitPrice = (
  strategy: PricingStrategy,
  quantity: number,
  pricingConfig?: PricingConfig | null,
  variantPrice?: Decimal | null,
  selectedTierQuantity?: number | null
): Decimal => {
  switch (strategy) {
    case PricingStrategy.FIXED_VARIANTS: {
      if (!variantPrice) {
        throw new BadRequestError(
          "A variant must be selected for this product"
        );
      }
      return variantPrice;
    }

    case PricingStrategy.PER_UNIT: {
      if (!pricingConfig?.unitPrice) {
        throw new BadRequestError(
          "Unit price is not configured for this product"
        );
      }
      return pricingConfig.unitPrice;
    }

    case PricingStrategy.INCREMENTAL_QUANTITY: {
      if (
        !pricingConfig?.incrementQuantity ||
        !pricingConfig?.incrementPrice
      ) {
        throw new BadRequestError(
          "Incremental pricing is not configured for this product"
        );
      }

      const minQty = pricingConfig.minimumOrderQuantity ?? 1;
      if (quantity < minQty) {
        throw new BadRequestError(
          `Minimum order quantity is ${minQty}`
        );
      }

      const increments = Math.ceil(
        quantity / pricingConfig.incrementQuantity
      );
      const total = pricingConfig.incrementPrice.mul(increments);
      // Store as unit price = total / quantity
      return total.div(quantity).toDecimalPlaces(2);
    }

    case PricingStrategy.TIERED_PRICING: {
      const tiers = pricingConfig?.tiers ?? [];

      // Customer selected a specific tier
      if (selectedTierQuantity !== null && selectedTierQuantity !== undefined) {
        const tier = tiers.find((t) => t.quantity === selectedTierQuantity);
        if (!tier) {
          throw new BadRequestError(
            `No pricing tier found for quantity ${selectedTierQuantity}`
          );
        }
        // Validate the ordered quantity matches the tier
        if (quantity !== tier.quantity) {
          throw new BadRequestError(
            `Quantity must be exactly ${tier.quantity} for the selected tier`
          );
        }
        // unit price = tier total price / quantity
        return tier.price.div(quantity).toDecimalPlaces(2);
      }

      // No tier selected — fall back to base per-unit price
      if (!pricingConfig?.baseUnitPrice) {
        throw new BadRequestError(
          "Please select a pricing tier for this product"
        );
      }

      return pricingConfig.baseUnitPrice;
    }

    case PricingStrategy.CUSTOM_QUOTE: {
      return new Decimal(0);
    }

    default: {
      throw new BadRequestError("Unknown pricing strategy");
    }
  }
};

/**
 * Calculate cart totals.
 */
export const calculateCartTotals = (
  items: {
    quantity: number;
    unitPrice: Decimal;
  }[]
): {
  subtotal: Decimal;
} => {
  const subtotal = items.reduce((sum, item) => {
    return sum.add(item.unitPrice.mul(item.quantity));
  }, new Decimal(0));

  return { subtotal };
};

/**
 * Apply coupon discount to subtotal.
 */
export const applyCouponDiscount = (
  subtotal: Decimal,
  coupon: {
    discountPercent?: Decimal | null;
    discountFlat?: Decimal | null;
    minOrderAmount?: Decimal | null;
  }
): Decimal => {
  if (coupon.minOrderAmount && subtotal.lt(coupon.minOrderAmount)) {
    throw new BadRequestError(
      `Minimum order amount for this coupon is ₹${coupon.minOrderAmount.toFixed(2)}`
    );
  }

  if (coupon.discountPercent) {
    const discount = subtotal.mul(coupon.discountPercent).div(100);
    return discount.toDecimalPlaces(2);
  }

  if (coupon.discountFlat) {
    const discount = Decimal.min(coupon.discountFlat, subtotal);
    return discount.toDecimalPlaces(2);
  }

  return new Decimal(0);
};

/**
 * Get available tiers for a product — for displaying to customer.
 * Returns sorted list with base unit price option if configured.
 */
export const getAvailableTiers = (
  pricingConfig: PricingConfig
): {
  type: "tier" | "base";
  quantity?: number;
  totalPrice: Decimal;
  unitPrice: Decimal;
  label?: string | null;
  isSpecialOffer?: boolean;
}[] => {
  const result: {
    type: "tier" | "base";
    quantity?: number;
    totalPrice: Decimal;
    unitPrice: Decimal;
    label?: string | null;
    isSpecialOffer?: boolean;
  }[] = [];

  // Add all tiers sorted by quantity
  const sortedTiers = [...(pricingConfig.tiers ?? [])].sort(
    (a, b) => a.quantity - b.quantity
  );

  for (const tier of sortedTiers) {
    result.push({
      type: "tier",
      quantity: tier.quantity,
      totalPrice: tier.price,
      unitPrice: tier.price.div(tier.quantity).toDecimalPlaces(2),
      label: tier.label,
      isSpecialOffer: tier.isSpecialOffer ?? false,
    });
  }

  // Add base unit price option if configured
  if (pricingConfig.baseUnitPrice) {
    result.push({
      type: "base",
      totalPrice: pricingConfig.baseUnitPrice,
      unitPrice: pricingConfig.baseUnitPrice,
      label: "Per print (custom quantity)",
      isSpecialOffer: false,
    });
  }

  return result;
};