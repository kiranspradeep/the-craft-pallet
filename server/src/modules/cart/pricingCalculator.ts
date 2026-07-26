import { PricingStrategy } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { BadRequestError } from "../../shared/errors/AppError.js";

export interface PricingConfig {
  strategy: PricingStrategy;
  unitPrice?: Decimal | null;
  incrementQuantity?: number | null;
  incrementPrice?: Decimal | null;
  minimumOrderQuantity?: number | null;
}

export interface VariantPrice {
  price: Decimal;
}

/**
 * Calculate the unit price for a cart item based on
 * the product's pricing strategy.
 *
 * Returns: price per logical "unit" (i.e. what gets stored
 * in CartItem.unitPrice). Total = unitPrice * quantity.
 */
export const calculateUnitPrice = (
  strategy: PricingStrategy,
  quantity: number,
  pricingConfig?: PricingConfig | null,
  variantPrice?: Decimal | null
): Decimal => {
  switch (strategy) {
    case PricingStrategy.FIXED_VARIANTS: {
      // Price comes from the selected variant
      if (!variantPrice) {
        throw new BadRequestError(
          "A variant must be selected for this product"
        );
      }
      return variantPrice;
    }

    case PricingStrategy.PER_UNIT: {
      if (!pricingConfig?.unitPrice) {
        throw new BadRequestError("Unit price is not configured for this product");
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

      // price = ceil(qty / incrementQty) * incrementPrice
      const increments = Math.ceil(
        quantity / pricingConfig.incrementQuantity
      );
      const total = pricingConfig.incrementPrice.mul(increments);
      // unit price = total / quantity (for line item storage)
      return total.div(quantity).toDecimalPlaces(2);
    }

    case PricingStrategy.CUSTOM_QUOTE: {
      // No price — quote on request
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