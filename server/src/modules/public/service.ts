import { publicRepository } from "./repository.js";
import { checkoutService } from "../checkout/service.js";
import { NotFoundError } from "../../shared/errors/AppError.js";

export const publicService = {
  // ── Categories ────────────────────────────────────────────────────────

  getCategories: async () => {
    const categories = await publicRepository.findAllCategories();
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      sortOrder: cat.sortOrder,
      productCount: cat._count.products,
    }));
  },

  getCategoryBySlug: async (slug: string) => {
    const category = await publicRepository.findCategoryBySlug(slug);
    if (!category) throw new NotFoundError("Category not found");
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category._count.products,
    };
  },

  // ── Products ──────────────────────────────────────────────────────────

  getProducts: async (options: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const result = await publicRepository.findAllProducts({
      page: options.page,
      limit: options.limit,
      search: options.search,
      categorySlug: options.category,
      isFeatured: options.featured,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    });

    return {
      ...result,
      products: result.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        isFeatured: p.isFeatured,
        category: p.category,
        thumbnail: p.images[0] ?? null,
        variants: p.variants,
        pricingConfig: p.pricingConfig
          ? {
              strategy: p.pricingConfig.strategy,
              unitPrice: p.pricingConfig.unitPrice,
              baseUnitPrice: p.pricingConfig.baseUnitPrice,
              minimumOrderQuantity: p.pricingConfig.minimumOrderQuantity,
              incrementQuantity: p.pricingConfig.incrementQuantity,
              incrementPrice: p.pricingConfig.incrementPrice,
              tiers: p.pricingConfig.tiers.map((t) => ({
                id: t.id,
                quantity: t.quantity,
                price: t.price,
                label: t.label,
                isSpecialOffer: t.isSpecialOffer,
                sortOrder: t.sortOrder,
              })),
            }
          : null,
        variantCount: p._count.variants,
      })),
    };
  },

  getProductBySlug: async (slug: string) => {
    const product = await publicRepository.findProductBySlug(slug);
    if (!product) throw new NotFoundError("Product not found");

    // Related products — same category
    const related = await publicRepository.findRelatedProducts(
      product.categoryId,
      product.id
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      isFeatured: product.isFeatured,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      metaKeywords: product.metaKeywords,
      ogImageUrl: product.ogImageUrl,
      category: product.category,
      images: product.images,
      variants: product.variants,

      // Full pricing config including tiers
      pricingConfig: product.pricingConfig
        ? {
            strategy: product.pricingConfig.strategy,
            unitPrice: product.pricingConfig.unitPrice,
            baseUnitPrice: product.pricingConfig.baseUnitPrice,
            minimumOrderQuantity:
              product.pricingConfig.minimumOrderQuantity,
            incrementQuantity: product.pricingConfig.incrementQuantity,
            incrementPrice: product.pricingConfig.incrementPrice,
            tiers: product.pricingConfig.tiers.map((t) => ({
              id: t.id,
              quantity: t.quantity,
              price: t.price,
              label: t.label,
              isSpecialOffer: t.isSpecialOffer,
              sortOrder: t.sortOrder,
            })),
          }
        : null,

      configuration: product.configuration
        ? {
            uploadRequired: product.configuration.uploadRequired,
            minImages: product.configuration.minImages,
            maxImages: product.configuration.maxImages,
            maxFileSizeMb: product.configuration.maxFileSizeMb,
            maxZipSizeMb: product.configuration.maxZipSizeMb,
            allowedExtensions: product.configuration.allowedExtensions,
            allowedSources: product.configuration.allowedSources,
            allowDuplicateImages:
              product.configuration.allowDuplicateImages,
            allowImageReordering:
              product.configuration.allowImageReordering,
            estimatedProductionDays:
              product.configuration.estimatedProductionDays,
            extraRules: product.configuration.extraRules,
          }
        : null,

      customFields: product.customFields.map((field) => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        helpText: field.helpText,
        isRequired: field.isRequired,
        sortOrder: field.sortOrder,
        validationJson: field.validationJson,
        options: field.options,
      })),

      // Related products — lightweight
      relatedProducts: related.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        thumbnail: r.images[0] ?? null,
        pricingConfig: r.pricingConfig
          ? {
              strategy: r.pricingConfig.strategy,
              unitPrice: r.pricingConfig.unitPrice,
              baseUnitPrice: r.pricingConfig.baseUnitPrice,
              incrementPrice: r.pricingConfig.incrementPrice,
              incrementQuantity: r.pricingConfig.incrementQuantity,
              tiers: r.pricingConfig.tiers.map((t) => ({
                quantity: t.quantity,
                price: t.price,
                label: t.label,
                isSpecialOffer: t.isSpecialOffer,
              })),
            }
          : null,
        variants: r.variants,
      })),
    };
  },

  // ── Settings ──────────────────────────────────────────────────────────

  getBusinessSettings: async () => {
    const settings = await publicRepository.getBusinessSettings();
    if (!settings) return null;
    return {
      businessName: settings.businessName,
      tagline: settings.tagline,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      instagramUrl: settings.instagramUrl,
      currency: settings.currency,
      minOrderAmount: settings.minOrderAmount,
    };
  },

  getShippingSettings: async () => {
    const settings = await publicRepository.getShippingSettings();
    if (!settings) return null;
    return {
      freeShippingThreshold: settings.freeShippingThreshold,
      defaultShippingCharge: settings.defaultShippingCharge,
      defaultProcessingDays: settings.defaultProcessingDays,
    };
  },

  getWhatsAppSettings: async () => {
    return publicRepository.getWhatsAppSettings();
  },

  // ── Order Tracking ────────────────────────────────────────────────────

  trackOrder: async (orderNumber: string, phone: string) => {
    const order = await checkoutService.trackOrder(orderNumber, phone);

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      productionStage: order.productionStage,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingCharge: order.shippingCharge,
      totalAmount: order.totalAmount,
      currency: order.currency,
      customerNote: order.customerNote,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      payment: order.payment
        ? {
            status: order.payment.status,
            method: order.payment.method,
            paidAt: order.payment.paidAt,
          }
        : null,
      shipment: order.shipment
        ? {
            trackingNumber: order.shipment.trackingNumber,
            status: order.shipment.status,
            shippedAt: order.shipment.shippedAt,
            estimatedDelivery: order.shipment.estimatedDelivery,
            deliveredAt: order.shipment.deliveredAt,
          }
        : null,
      timeline: order.timeline
        .filter((t) => t.isVisibleToCustomer)
        .map((t) => ({
          eventType: t.eventType,
          title: t.title,
          description: t.description,
          createdAt: t.createdAt,
        })),
    };
  },
};