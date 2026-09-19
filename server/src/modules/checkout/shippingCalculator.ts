import { Decimal } from "@prisma/client/runtime/library.js";
import { ShippingCategory } from "@prisma/client";

export interface CalculatorItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    shippingCategory: ShippingCategory;
    deliveryIncrement: Decimal;
    additionalUnitIncrement: Decimal;
  };
  variant?: {
    id: string;
    name: string;
    shippingCategory: ShippingCategory | null;
    deliveryIncrement: Decimal | null;
    additionalUnitIncrement: Decimal | null;
  } | null;
}

export interface ShippingSettingsInput {
  keralaShippingCharge: Decimal | null;
  outsideKeralaShippingCharge: Decimal | null;
}

const CATEGORY_HIERARCHY: Record<ShippingCategory, number> = {
  LARGE_HEAVY: 4,
  REGULAR_FRAME: 3,
  MINI_FRAME: 2,
  SMALL: 1,
};

const isKeralaAddress = (shipState: string): boolean => {
  return shipState.trim().toLowerCase().includes("kerala");
};

/**
 * Resolves the effective shipping parameters for an item,
 * checking variant overrides before falling back to product defaults.
 */
const resolveItemParams = (item: CalculatorItem) => {
  const category = item.variant?.shippingCategory ?? item.product.shippingCategory;
  const deliveryInc = item.variant?.deliveryIncrement 
    ? new Decimal(item.variant.deliveryIncrement) 
    : new Decimal(item.product.deliveryIncrement);
  const additionalInc = item.variant?.additionalUnitIncrement 
    ? new Decimal(item.variant.additionalUnitIncrement) 
    : new Decimal(item.product.additionalUnitIncrement);

  return { category, deliveryInc, additionalInc };
};

export const calculateShipping = (
  items: CalculatorItem[],
  shipState: string,
  settings: ShippingSettingsInput | null
): Decimal => {
  if (!settings) return new Decimal(0);

  // 1. Resolve base shipping rate
  const baseRate = isKeralaAddress(shipState)
    ? new Decimal(settings.keralaShippingCharge ?? 0)
    : new Decimal(settings.outsideKeralaShippingCharge ?? 0);

  if (items.length === 0) return baseRate;

  // 2. Identify dominant category using resolved items (checking variant override first)
  let dominantCategory: ShippingCategory = ShippingCategory.SMALL;
  let highestPriorityValue = 0;

  for (const item of items) {
    const { category } = resolveItemParams(item);
    const priority = CATEGORY_HIERARCHY[category] ?? 0;
    if (priority > highestPriorityValue) {
      highestPriorityValue = priority;
      dominantCategory = category;
    }
  }

  // 3. Filter items belonging to resolved dominant category
  const dominantCategoryItems = items.filter((item) => {
    const { category } = resolveItemParams(item);
    return category === dominantCategory;
  });

  // 4. Calculate increments of products within the dominant category independently, using Approach A Max
  let maxDominantIncrement = new Decimal(0);
  for (const item of dominantCategoryItems) {
    const { deliveryInc, additionalInc } = resolveItemParams(item);
    const qty = new Decimal(item.quantity);

    const productIncrement = qty.greaterThan(1)
      ? deliveryInc.add(qty.sub(1).mul(additionalInc))
      : deliveryInc;

    if (productIncrement.greaterThan(maxDominantIncrement)) {
      maxDominantIncrement = productIncrement;
    }
  }

  // 5. Mixed category exception (SMALL + MINI_FRAME)
  let smallProductAddon = new Decimal(0);
  if (dominantCategory === ShippingCategory.MINI_FRAME) {
    const hasSmallProduct = items.some((item) => {
      const { category } = resolveItemParams(item);
      return category === ShippingCategory.SMALL;
    });

    if (hasSmallProduct) {
      const smallItems = items.filter((item) => {
        const { category } = resolveItemParams(item);
        return category === ShippingCategory.SMALL;
      });

      let maxSmallInc = new Decimal(0);
      for (const item of smallItems) {
        const { deliveryInc } = resolveItemParams(item);
        if (deliveryInc.greaterThan(maxSmallInc)) {
          maxSmallInc = deliveryInc;
        }
      }
      smallProductAddon = maxSmallInc;
    }
  }

  return baseRate.add(maxDominantIncrement).add(smallProductAddon);
};