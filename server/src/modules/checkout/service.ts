import crypto from "crypto";
import {
  ActorType,
  OrderStatus,
  PhotoStatus,
  OrderSource,
  CheckoutMethod,
  PaymentStatus,
  PricingStrategy,
  TimelineEventType,
  CustomFieldType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../prisma/client.js";
import { cartRepository } from "../cart/repository.js";
import { checkoutRepository } from "./repository.js";
import {
  calculateCartTotals,
  applyCouponDiscount,
  calculateUnitPrice,
} from "../cart/pricingCalculator.js";
import { generateOrderNumber } from "../../shared/utils/orderNumber.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/index.js";
import { emailService } from "../../shared/services/emailService.js";

// ── Common inputs ─────────────────────────────────────────────────────────

export interface CustomerShippingInput {
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
  customerNote?: string;
  driveLink?: string;
}

export interface WebsiteCheckoutInput extends CustomerShippingInput {
  sessionId: string;
  couponCode?: string;
  buyNowCheckoutId?: string;
}

export interface WhatsAppDraftInput extends CustomerShippingInput {
  sessionId: string;
  couponCode?: string;
  buyNowCheckoutId?: string;
}

export interface BuyNowInput {
  sessionId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  selectedTierQuantity?: number;
  notes?: string;
  customizations?: any[];
  assetId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const generateWhatsappToken = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

const determineInitialPhotoStatus = (
  items: {
    product: { configuration?: { uploadRequired?: boolean } | null };
    customizations?: {
      fieldType: CustomFieldType;
      assetId?: string | null;
    }[];
  }[],
  source: OrderSource
): PhotoStatus => {
  const anyRequiresUpload = items.some(
    (i) => i.product.configuration?.uploadRequired
  );

  if (!anyRequiresUpload) return PhotoStatus.NOT_REQUIRED;

  if (source === OrderSource.WHATSAPP) {
    return PhotoStatus.NOT_RECEIVED;
  }

  const allUploadsProvided = items.every((item) => {
    if (!item.product.configuration?.uploadRequired) return true;
    const photoField = item.customizations?.find(
      (c) => c.fieldType === CustomFieldType.PHOTO_UPLOAD
    );
    return !!photoField?.assetId;
  });

  return allUploadsProvided
    ? PhotoStatus.RECEIVED
    : PhotoStatus.NOT_RECEIVED;
};

// ── Shipping helpers ──────────────────────────────────────────────────────

const isKeralaAddress = (shipState: string): boolean => {
  return shipState.trim().toLowerCase().includes("kerala");
};

const calculateShippingCharge = (
  settings: {
    keralaShippingCharge: any;
    outsideKeralaShippingCharge: any;
  } | null,
  shipState: string
): Decimal => {
  if (!settings) return new Decimal(0);

  if (isKeralaAddress(shipState)) {
    return settings.keralaShippingCharge
      ? new Decimal(settings.keralaShippingCharge)
      : new Decimal(0);
  } else {
    return settings.outsideKeralaShippingCharge
      ? new Decimal(settings.outsideKeralaShippingCharge)
      : new Decimal(0);
  }
};

// ── Service ───────────────────────────────────────────────────────────────

export const checkoutService = {
  // ────────────────────────────────────────────────────────────────────────
  // BUY NOW — create temporary CheckoutSession
  // ────────────────────────────────────────────────────────────────────────
  createBuyNowSession: async (input: BuyNowInput) => {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, deletedAt: null, isActive: true },
      include: {
        pricingConfig: { include: { tiers: true } },
        variants: true,
      },
    });

    if (!product) throw new NotFoundError("Product not found");
    if (!product.pricingConfig)
      throw new BadRequestError("Product pricing not configured");

    let variantPrice: Decimal | null = null;
    if (input.variantId) {
      const variant = product.variants.find(
        (v) => v.id === input.variantId && v.isActive
      );
      if (!variant) throw new NotFoundError("Variant not found");
      variantPrice = new Decimal(variant.price);
    }

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

    const session = await checkoutRepository.createCheckoutSession({
      sessionId: input.sessionId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
      selectedTierQuantity: input.selectedTierQuantity,
      unitPrice,
      notes: input.notes,
      customizations: input.customizations ?? [],
      assetId: input.assetId,
    });

    logger.info(`Buy Now session created: ${session.id}`);
    return session;
  },

  // ────────────────────────────────────────────────────────────────────────
  // GET BUY NOW SESSION
  // ────────────────────────────────────────────────────────────────────────
  getBuyNowSession: async (id: string) => {
    const session = await checkoutRepository.findCheckoutSession(id);
    if (!session) throw new NotFoundError("Checkout session not found");
    if (session.expiresAt < new Date()) {
      await checkoutRepository.deleteCheckoutSession(id);
      throw new BadRequestError(
        "Checkout session has expired. Please start over."
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: session.productId },
      select: {
        configuration: {
          select: { uploadRequired: true },
        },
      },
    });

    return {
      ...session,
      uploadRequired: product?.configuration?.uploadRequired ?? false,
    };
  },

  updateBuyNowSession: async (
    id: string,
    data: { assetId?: string; customizations?: any }
  ) => {
    return checkoutRepository.updateCheckoutSession(id, data);
  },

  // ────────────────────────────────────────────────────────────────────────
  // WEBSITE CHECKOUT — creates AWAITING_PAYMENT order
  // ────────────────────────────────────────────────────────────────────────
  placeWebsiteOrder: async (input: WebsiteCheckoutInput) => {
    let itemsSource: "cart" | "buyNow";
    let cart: any = null;
    let buyNowSession: any = null;
    let buyNowProduct: any = null;

    if (input.buyNowCheckoutId) {
      itemsSource = "buyNow";
      buyNowSession = await checkoutRepository.findCheckoutSession(
        input.buyNowCheckoutId
      );
      if (!buyNowSession)
        throw new BadRequestError("Checkout session not found");
      if (buyNowSession.expiresAt < new Date()) {
        throw new BadRequestError(
          "Checkout session has expired. Please start over."
        );
      }
      buyNowProduct = await prisma.product.findUnique({
        where: { id: buyNowSession.productId },
        include: {
          pricingConfig: true,
          configuration: true,
          variants: true,
        },
      });
      if (!buyNowProduct) throw new NotFoundError("Product not found");
    } else {
      itemsSource = "cart";
      cart = await cartRepository.findBySessionId(input.sessionId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestError("Your cart is empty");
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      // ── 1. Calculate subtotal ────────────────────────────────────────
      let subtotal: Decimal;
      if (itemsSource === "cart") {
        const totals = calculateCartTotals(
          cart.items.map((i: any) => ({
            quantity: i.quantity,
            unitPrice: new Decimal(i.unitPrice),
          }))
        );
        subtotal = totals.subtotal;
      } else {
        subtotal = new Decimal(buyNowSession.unitPrice).mul(
          buyNowSession.quantity
        );
      }

      // ── 2. Coupon ────────────────────────────────────────────────────
      let discountAmount = new Decimal(0);
      let validatedCoupon: { id: string; code: string } | null = null;

      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });
        if (!coupon || !coupon.isActive) {
          throw new BadRequestError("Invalid coupon");
        }
        const now = new Date();
        if (coupon.startsAt && coupon.startsAt > now)
          throw new BadRequestError("Coupon not yet active");
        if (coupon.expiresAt && coupon.expiresAt < now)
          throw new BadRequestError("Coupon expired");
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
          throw new BadRequestError("Coupon usage limit reached");

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

        validatedCoupon = { id: coupon.id, code: coupon.code };
      }

      // ── 3. Shipping — Kerala vs outside Kerala ────────────────────────
      const shippingSettings = await tx.shippingSetting.findFirst();
      const shippingCharge = calculateShippingCharge(
        shippingSettings,
        input.shipState
      );

      const totalAmount = subtotal
        .sub(discountAmount)
        .add(shippingCharge)
        .toDecimalPlaces(2);

      // ── 4. Customer ──────────────────────────────────────────────────
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

      // ── 5. Determine PhotoStatus ─────────────────────────────────────
      let photoStatus: PhotoStatus;
      if (itemsSource === "cart") {
        photoStatus = determineInitialPhotoStatus(
          cart.items.map((i: any) => ({
            product: i.product,
            customizations: i.customizations,
          })),
          OrderSource.WEBSITE
        );
      } else {
        const uploadRequired =
          buyNowProduct.configuration?.uploadRequired ?? false;
        if (!uploadRequired) photoStatus = PhotoStatus.NOT_REQUIRED;
        else
          photoStatus = buyNowSession.assetId
            ? PhotoStatus.RECEIVED
            : PhotoStatus.NOT_RECEIVED;
      }

      // ── 6. Generate order number ─────────────────────────────────────
      const orderNumber = await generateOrderNumber(tx);

      // ── 7. Create Order ──────────────────────────────────────────────
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
          photoStatus,
          orderSource: OrderSource.WEBSITE,
          checkoutMethod:
            itemsSource === "buyNow"
              ? CheckoutMethod.BUY_NOW
              : CheckoutMethod.CART,
          subtotal,
          discountAmount,
          shippingCharge,
          totalAmount,
          currency: "INR",
          couponCode: validatedCoupon?.code ?? null,
          customerNote: input.customerNote ?? null,
          driveLink: input.driveLink ?? null,
        },
      });

      // ── 8. Create OrderItems + transfer customizations ───────────────
      if (itemsSource === "cart") {
        for (const cartItem of cart.items) {
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              variantId: cartItem.variantId ?? null,
              quantity: cartItem.quantity,
              unitPrice: new Decimal(cartItem.unitPrice),
              totalPrice: new Decimal(cartItem.unitPrice).mul(
                cartItem.quantity
              ),
              selectedTierQuantity: cartItem.selectedTierQuantity ?? null,
              productName: cartItem.product.name,
              variantName: cartItem.variant?.name ?? null,
              productDescription: cartItem.product.description ?? null,
              variantDescription: null,
              pricingStrategy:
                cartItem.product.pricingConfig?.strategy ??
                PricingStrategy.CUSTOM_QUOTE,
            },
          });

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
      } else {
        // Buy Now
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: buyNowProduct.id,
            variantId: buyNowSession.variantId ?? null,
            quantity: buyNowSession.quantity,
            unitPrice: new Decimal(buyNowSession.unitPrice),
            totalPrice: new Decimal(buyNowSession.unitPrice).mul(
              buyNowSession.quantity
            ),
            selectedTierQuantity:
              buyNowSession.selectedTierQuantity ?? null,
            productName: buyNowProduct.name,
            variantName:
              buyNowProduct.variants.find(
                (v: any) => v.id === buyNowSession.variantId
              )?.name ?? null,
            productDescription: buyNowProduct.description ?? null,
            variantDescription: null,
            pricingStrategy:
              buyNowProduct.pricingConfig?.strategy ??
              PricingStrategy.CUSTOM_QUOTE,
          },
        });

        const customizations = (buyNowSession.customizations as any[]) ?? [];
        let sessionAssetAssigned = false;

        for (const c of customizations) {
          let assetId: string | null = c.assetId ?? null;

          if (
            !assetId &&
            !sessionAssetAssigned &&
            c.fieldType === "PHOTO_UPLOAD" &&
            buyNowSession.assetId
          ) {
            assetId = buyNowSession.assetId;
            sessionAssetAssigned = true;
          }

          await tx.customization.create({
            data: {
              customFieldId: c.customFieldId,
              orderItemId: orderItem.id,
              fieldLabel: c.fieldLabel,
              fieldType: c.fieldType,
              textValue: c.textValue ?? null,
              numberValue:
                c.numberValue !== undefined
                  ? new Decimal(c.numberValue)
                  : null,
              dateValue: c.dateValue ? new Date(c.dateValue) : null,
              booleanValue: c.booleanValue ?? null,
              assetId,
            },
          });
        }
      }

      // ── 9. Coupon usage ──────────────────────────────────────────────
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

      // ── 10. Payment record ───────────────────────────────────────────
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          status: PaymentStatus.PENDING,
          amount: totalAmount,
          currency: "INR",
        },
      });

      // ── 11. Timeline ─────────────────────────────────────────────────
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

      // ── 12. Cleanup source ───────────────────────────────────────────
      if (itemsSource === "cart") {
        await tx.cart.delete({ where: { id: cart.id } });
      } else {
        await tx.checkoutSession.delete({
          where: { id: buyNowSession.id },
        });
      }

      logger.info(
        `Website order placed: ${orderNumber} (${itemsSource}) for ${customer.phone}`
      );

      return newOrder;
    });

    const fullOrder = await checkoutRepository.findOrderById(order.id);
    if (fullOrder) {
      emailService.sendOrderPlacedEmail(fullOrder).catch(() => {});
    }

    return fullOrder;
  },

  // ────────────────────────────────────────────────────────────────────────
  // WHATSAPP DRAFT — creates DRAFT order (no payment)
  // ────────────────────────────────────────────────────────────────────────
  placeWhatsAppDraft: async (input: WhatsAppDraftInput) => {
    let itemsSource: "cart" | "buyNow";
    let cart: any = null;
    let buyNowSession: any = null;
    let buyNowProduct: any = null;

    if (input.buyNowCheckoutId) {
      itemsSource = "buyNow";
      buyNowSession = await checkoutRepository.findCheckoutSession(
        input.buyNowCheckoutId
      );
      if (!buyNowSession)
        throw new BadRequestError("Checkout session not found");
      if (buyNowSession.expiresAt < new Date()) {
        throw new BadRequestError(
          "Checkout session has expired. Please start over."
        );
      }
      buyNowProduct = await prisma.product.findUnique({
        where: { id: buyNowSession.productId },
        include: {
          pricingConfig: true,
          configuration: true,
          variants: true,
        },
      });
      if (!buyNowProduct) throw new NotFoundError("Product not found");
    } else {
      itemsSource = "cart";
      cart = await cartRepository.findBySessionId(input.sessionId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestError("Your cart is empty");
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      // Subtotal
      let subtotal: Decimal;
      if (itemsSource === "cart") {
        subtotal = calculateCartTotals(
          cart.items.map((i: any) => ({
            quantity: i.quantity,
            unitPrice: new Decimal(i.unitPrice),
          }))
        ).subtotal;
      } else {
        subtotal = new Decimal(buyNowSession.unitPrice).mul(
          buyNowSession.quantity
        );
      }

      // Coupon
      let discountAmount = new Decimal(0);
      let validatedCoupon: { id: string; code: string } | null = null;
      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });
        if (coupon && coupon.isActive) {
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
          validatedCoupon = { id: coupon.id, code: coupon.code };
        }
      }

      // Shipping — Kerala vs outside Kerala
      const shippingSettings = await tx.shippingSetting.findFirst();
      const shippingCharge = calculateShippingCharge(
        shippingSettings,
        input.shipState
      );

      const totalAmount = subtotal
        .sub(discountAmount)
        .add(shippingCharge)
        .toDecimalPlaces(2);

      // Customer
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

      // PhotoStatus
      let photoStatus: PhotoStatus;
      if (itemsSource === "cart") {
        photoStatus = determineInitialPhotoStatus(
          cart.items.map((i: any) => ({
            product: i.product,
            customizations: i.customizations,
          })),
          OrderSource.WHATSAPP
        );
      } else {
        const uploadRequired =
          buyNowProduct.configuration?.uploadRequired ?? false;
        photoStatus = !uploadRequired
          ? PhotoStatus.NOT_REQUIRED
          : PhotoStatus.NOT_RECEIVED;
      }

      const orderNumber = await generateOrderNumber(tx);
      const whatsappToken = generateWhatsappToken();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          whatsappToken,
          customerId: customer.id,
          shipName: input.shipName,
          shipPhone: input.shipPhone,
          shipLine1: input.shipLine1,
          shipLine2: input.shipLine2 ?? null,
          shipCity: input.shipCity,
          shipState: input.shipState,
          shipPincode: input.shipPincode,
          shipCountry: input.shipCountry ?? "India",
          status: OrderStatus.DRAFT,
          photoStatus,
          orderSource: OrderSource.WHATSAPP,
          checkoutMethod:
            itemsSource === "buyNow"
              ? CheckoutMethod.BUY_NOW
              : CheckoutMethod.CART,
          subtotal,
          discountAmount,
          shippingCharge,
          totalAmount,
          currency: "INR",
          couponCode: validatedCoupon?.code ?? null,
          customerNote: input.customerNote ?? null,
          driveLink: input.driveLink ?? null,
        },
      });

      // Order items
      if (itemsSource === "cart") {
        for (const cartItem of cart.items) {
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              variantId: cartItem.variantId ?? null,
              quantity: cartItem.quantity,
              unitPrice: new Decimal(cartItem.unitPrice),
              totalPrice: new Decimal(cartItem.unitPrice).mul(
                cartItem.quantity
              ),
              selectedTierQuantity: cartItem.selectedTierQuantity ?? null,
              productName: cartItem.product.name,
              variantName: cartItem.variant?.name ?? null,
              productDescription: cartItem.product.description ?? null,
              variantDescription: null,
              pricingStrategy:
                cartItem.product.pricingConfig?.strategy ??
                PricingStrategy.CUSTOM_QUOTE,
            },
          });

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
      } else {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: buyNowProduct.id,
            variantId: buyNowSession.variantId ?? null,
            quantity: buyNowSession.quantity,
            unitPrice: new Decimal(buyNowSession.unitPrice),
            totalPrice: new Decimal(buyNowSession.unitPrice).mul(
              buyNowSession.quantity
            ),
            selectedTierQuantity:
              buyNowSession.selectedTierQuantity ?? null,
            productName: buyNowProduct.name,
            variantName:
              buyNowProduct.variants.find(
                (v: any) => v.id === buyNowSession.variantId
              )?.name ?? null,
            productDescription: buyNowProduct.description ?? null,
            variantDescription: null,
            pricingStrategy:
              buyNowProduct.pricingConfig?.strategy ??
              PricingStrategy.CUSTOM_QUOTE,
          },
        });

        const customizations = (buyNowSession.customizations as any[]) ?? [];
        let sessionAssetAssigned = false;

        for (const c of customizations) {
          let assetId: string | null = c.assetId ?? null;

          if (
            !assetId &&
            !sessionAssetAssigned &&
            c.fieldType === "PHOTO_UPLOAD" &&
            buyNowSession.assetId
          ) {
            assetId = buyNowSession.assetId;
            sessionAssetAssigned = true;
          }

          await tx.customization.create({
            data: {
              customFieldId: c.customFieldId,
              orderItemId: orderItem.id,
              fieldLabel: c.fieldLabel,
              fieldType: c.fieldType,
              textValue: c.textValue ?? null,
              numberValue:
                c.numberValue !== undefined
                  ? new Decimal(c.numberValue)
                  : null,
              dateValue: c.dateValue ? new Date(c.dateValue) : null,
              booleanValue: c.booleanValue ?? null,
              assetId,
            },
          });
        }
      }

      // Coupon usage
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

      // Payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          status: PaymentStatus.PENDING,
          amount: totalAmount,
          currency: "INR",
        },
      });

      // Timeline
      await tx.orderTimeline.create({
        data: {
          orderId: newOrder.id,
          eventType: TimelineEventType.DRAFT_CREATED,
          title: "Draft Order Created",
          description: `Order ${orderNumber} created — continuing on WhatsApp`,
          actorType: ActorType.CUSTOMER,
          isVisibleToCustomer: true,
        },
      });

      // Cleanup source
      if (itemsSource === "cart") {
        await tx.cart.delete({ where: { id: cart.id } });
      } else {
        await tx.checkoutSession.delete({
          where: { id: buyNowSession.id },
        });
      }

      logger.info(
        `WhatsApp draft order: ${orderNumber} (${itemsSource}) for ${customer.phone}`
      );

      return newOrder;
    });

    const fullOrder = await checkoutRepository.findOrderById(order.id);
    if (fullOrder) {
      emailService.sendOrderPlacedEmail(fullOrder).catch(() => {});
    }

    return fullOrder;
  },

  // ────────────────────────────────────────────────────────────────────────
  // Order tracking
  // ────────────────────────────────────────────────────────────────────────
  trackOrder: async (orderNumber: string, phone: string) => {
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    const order = await checkoutRepository.findOrderByNumber(orderNumber);
    if (!order) throw new NotFoundError("Order not found");
    if (order.customer.phone !== normalizedPhone) {
      throw new NotFoundError("Order not found");
    }
    return order;
  },

  // ────────────────────────────────────────────────────────────────────────
  // Create Razorpay Order
  // ────────────────────────────────────────────────────────────────────────
  createRazorpayOrder: async (orderNumber: string) => {
    const Razorpay = (await import("razorpay")).default;

    const settings = await prisma.paymentSetting.findFirst();
    const keyId = settings?.apiKey || process.env.RAZORPAY_KEY_ID;
    const keySecret =
      settings?.apiSecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new BadRequestError("Payment gateway is not configured");
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true, customer: true },
    });

    if (!order) throw new NotFoundError("Order not found");
    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestError(
        `Cannot create payment. Order is currently "${order.status}"`
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: order.currency || "INR",
      receipt: order.orderNumber,
      payment_capture: true,
      notes: {
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
    });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        gatewayName: "razorpay",
        gatewayOrderId: rzpOrder.id,
        status: PaymentStatus.INITIATED,
      },
    });

    return {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
    };
  },
};