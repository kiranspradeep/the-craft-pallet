import {
  ActorType,
  OrderStatus,
  PaymentStatus,
  PricingStrategy,
  TimelineEventType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../prisma/client.js";
import { cartRepository } from "../cart/repository.js";
import { checkoutRepository } from "./repository.js";
import {
  calculateCartTotals,
  applyCouponDiscount,
} from "../cart/pricingCalculator.js";
import { generateOrderNumber } from "../../shared/utils/orderNumber.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/index.js";

export interface CheckoutInput {
  sessionId: string;
  name: string;
  phone: string;
  email?: string;
  shipName: string;
  shipPhone: string;
  shipLine1: string;
  shipLine2?: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  shipCountry?: string;
  couponCode?: string;
  customerNote?: string;
}

export const checkoutService = {
  /**
   * Place an order from the current cart.
   *
   * Everything runs inside a single Prisma transaction:
   * 1. Load and validate cart
   * 2. Find or create customer
   * 3. Generate order number
   * 4. Validate coupon (if provided)
   * 5. Create Order
   * 6. Create OrderItems (with snapshots)
   * 7. Transfer Customizations (cart → order)
   * 8. Create Payment record
   * 9. Append first timeline event
   * 10. Delete cart
   */
  placeOrder: async (input: CheckoutInput) => {
    // ── Pre-transaction: load cart ──────────────────────────────────────
    const cart = await cartRepository.findBySessionId(input.sessionId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError("Your cart is empty");
    }

    // ── Single transaction ──────────────────────────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      // 1. Calculate subtotal
      const { subtotal } = calculateCartTotals(
        cart.items.map((i) => ({
          quantity: i.quantity,
          unitPrice: new Decimal(i.unitPrice),
        }))
      );

      // 2. Validate coupon if provided
      let discountAmount = new Decimal(0);
      let validatedCoupon: {
        id: string;
        code: string;
        discountPercent: Decimal | null;
        discountFlat: Decimal | null;
        minOrderAmount: Decimal | null;
      } | null = null;

      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });

        if (!coupon) {
          throw new BadRequestError("Coupon not found");
        }
        if (!coupon.isActive) {
          throw new BadRequestError("Coupon is inactive");
        }
        const now = new Date();
        if (coupon.startsAt && coupon.startsAt > now) {
          throw new BadRequestError("Coupon is not yet active");
        }
        if (coupon.expiresAt && coupon.expiresAt < now) {
          throw new BadRequestError("Coupon has expired");
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw new BadRequestError("Coupon usage limit reached");
        }

        discountAmount = applyCouponDiscount(subtotal, {
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

        validatedCoupon = {
          id: coupon.id,
          code: coupon.code,
          discountPercent: coupon.discountPercent
            ? new Decimal(coupon.discountPercent)
            : null,
          discountFlat: coupon.discountFlat
            ? new Decimal(coupon.discountFlat)
            : null,
          minOrderAmount: coupon.minOrderAmount
            ? new Decimal(coupon.minOrderAmount)
            : null,
        };
      }

      // 3. Load shipping settings for shipping charge
      const shippingSettings = await tx.shippingSetting.findFirst();
      let shippingCharge = new Decimal(0);

      if (shippingSettings) {
        const threshold = shippingSettings.freeShippingThreshold
          ? new Decimal(shippingSettings.freeShippingThreshold)
          : null;
        const defaultCharge = shippingSettings.defaultShippingCharge
          ? new Decimal(shippingSettings.defaultShippingCharge)
          : new Decimal(0);

        if (!threshold || subtotal.lt(threshold)) {
          shippingCharge = defaultCharge;
        }
      }

      const totalAmount = subtotal
        .sub(discountAmount)
        .add(shippingCharge)
        .toDecimalPlaces(2);

      // 4. Find or create customer
      // Phone normalized — strip spaces, dashes, country code
      const normalizedPhone = input.phone.replace(/\D/g, "").slice(-10);

      const customer = await tx.customer.upsert({
        where: { phone: normalizedPhone },
        create: {
          name: input.name,
          phone: normalizedPhone,
          email: input.email ?? null,
        },
        update: {
          name: input.name,
          ...(input.email && { email: input.email }),
        },
      });

      // 5. Generate order number
      const orderNumber = await generateOrderNumber(tx);

      // 6. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          shipName: input.shipName,
          shipPhone: input.shipPhone,
          shipLine1: input.shipLine1,
          shipLine2: input.shipLine2 ?? null,
          shipCity: input.shipCity,
          shipState: input.shipState,
          shipPincode: input.shipPincode,
          shipCountry: input.shipCountry ?? "India",
          status: OrderStatus.AWAITING_PAYMENT,
          subtotal,
          discountAmount,
          shippingCharge,
          totalAmount,
          currency: "INR",
          couponCode: validatedCoupon?.code ?? null,
          customerNote: input.customerNote ?? null,
        },
      });

      // 7. Create OrderItems + transfer Customizations
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        const variant = cartItem.variant;

        // Snapshot product + variant details at time of order
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: product.id,
            variantId: variant?.id ?? null,
            quantity: cartItem.quantity,
            unitPrice: new Decimal(cartItem.unitPrice),
            totalPrice: new Decimal(cartItem.unitPrice).mul(cartItem.quantity),
            productName: product.name,
            variantName: variant?.name ?? null,
            productDescription: product.description ?? null,
            variantDescription: null,
            pricingStrategy: product.pricingConfig?.strategy ?? PricingStrategy.CUSTOM_QUOTE,
          },
        });

        // Transfer customizations — cart → order (FK swap, files stay put)
        if (cartItem.customizations.length > 0) {
          await tx.customization.updateMany({
            where: { cartItemId: cartItem.id },
            data: {
              orderItemId: orderItem.id,
              cartItemId: null,
            },
          });
        }
      }

      // 8. Increment coupon usage + record CouponUsage
      if (validatedCoupon) {
        await tx.coupon.update({
          where: { id: validatedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: validatedCoupon.id,
            customerId: customer.id,
            orderId: newOrder.id,
          },
        });
      }

      // 9. Create Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          status: PaymentStatus.PENDING,
          amount: totalAmount,
          currency: "INR",
        },
      });

      // 10. Append timeline event
      await tx.orderTimeline.create({
        data: {
          orderId: newOrder.id,
          eventType: TimelineEventType.ORDER_PLACED,
          title: "Order Placed",
          description: `Order ${orderNumber} was placed successfully`,
          actorType: ActorType.CUSTOMER,
          isVisibleToCustomer: true,
        },
      });

      // 11. Delete cart (items + customizations cascade via DB)
      await tx.cart.delete({ where: { id: cart.id } });

      logger.info(`Order placed: ${orderNumber} for customer ${customer.phone}`);

      return newOrder;
    });

    // Return full order with all relations
    return checkoutRepository.findOrderById(order.id);
  },

  /**
   * Get order by order number — for customer order tracking.
   * Phone is required to verify ownership.
   */
  trackOrder: async (orderNumber: string, phone: string) => {
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

    const order = await checkoutRepository.findOrderByNumber(orderNumber);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Verify customer phone matches
    if (order.customer.phone !== normalizedPhone) {
      throw new NotFoundError("Order not found");
    }

    return order;
  },
};