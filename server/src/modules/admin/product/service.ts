import { PricingStrategy, ProductImageType, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/client.js";
import { Decimal } from "@prisma/client/runtime/library";
import { productRepository } from "./repository.js";
import { generateUniqueSlug } from "../../../shared/utils/slug.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../shared/errors/AppError.js";

// ── Helpers ───────────────────────────────────────────────────────────────

const assertProductExists = async (id: string) => {
  const product = await productRepository.findById(id);
  if (!product) throw new NotFoundError("Product not found");
  return product;
};

const assertCategoryExists = async (categoryId: string) => {
  const category = await productRepository.findCategoryById(categoryId);
  if (!category) throw new NotFoundError("Category not found");
};

const assertSkuUnique = async (sku: string, excludeVariantId?: string) => {
  const existing = await productRepository.findVariantBySku(sku);
  if (existing && existing.id !== excludeVariantId) {
    throw new ConflictError(`SKU "${sku}" is already in use`);
  }
};

// ── Service ───────────────────────────────────────────────────────────────

export const productService = {
  // ── Core ──────────────────────────────────────────────────────────────

  create: async (input: {
    categoryId: string;
    name: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImageUrl?: string;
  }) => {
    await assertCategoryExists(input.categoryId);

    let slug: string;
    if (input.slug) {
      const existing = await productRepository.findBySlug(input.slug);
      if (existing) {
        throw new ConflictError(`Slug "${input.slug}" is already in use`);
      }
      slug = input.slug;
    } else {
      slug = await generateUniqueSlug(input.name, async (candidate) => {
        const found = await productRepository.findBySlug(candidate);
        return !!found;
      });
    }

    return productRepository.create({
      category: { connect: { id: input.categoryId } },
      name: input.name,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      sortOrder: input.sortOrder ?? 0,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      metaKeywords: input.metaKeywords,
      ogImageUrl: input.ogImageUrl || null,
    });
  },

  findAll: async (options: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortBy?: "name" | "createdAt" | "sortOrder";
    sortOrder?: "asc" | "desc";
  }) => {
    return productRepository.findAll(options);
  },

  findById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  update: async (
    id: string,
    input: {
      categoryId?: string;
      name?: string;
      slug?: string;
      description?: string;
      shortDescription?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      sortOrder?: number;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      ogImageUrl?: string;
    }
  ) => {
    const existing = await assertProductExists(id);

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      await assertCategoryExists(input.categoryId);
    }

    let slug = input.slug;

    if (slug) {
      const conflict = await productRepository.findBySlugExcludingId(slug, id);
      if (conflict) {
        throw new ConflictError(`Slug "${slug}" is already in use`);
      }
    } else if (input.name && input.name !== existing.name) {
      slug = await generateUniqueSlug(input.name, async (candidate) => {
        const found = await productRepository.findBySlugExcludingId(
          candidate,
          id
        );
        return !!found;
      });
    }

    await productRepository.update(id, {
      ...(input.categoryId && {
        category: { connect: { id: input.categoryId } },
      }),
      ...(input.name && { name: input.name }),
      ...(slug && { slug }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.shortDescription !== undefined && {
        shortDescription: input.shortDescription,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.metaTitle !== undefined && { metaTitle: input.metaTitle }),
      ...(input.metaDescription !== undefined && {
        metaDescription: input.metaDescription,
      }),
      ...(input.metaKeywords !== undefined && {
        metaKeywords: input.metaKeywords,
      }),
      ...(input.ogImageUrl !== undefined && {
        ogImageUrl: input.ogImageUrl || null,
      }),
    });

    return await productRepository.findById(id);
  },

  softDelete: async (id: string) => {
    await assertProductExists(id);
    return productRepository.softDelete(id);
  },

  // ── Product Images ────────────────────────────────────────────────────

  addImage: async (
    productId: string,
    input: {
      url: string;
      altText?: string;
      type?: ProductImageType;
      width?: number;
      height?: number;
      sortOrder?: number;
    }
  ) => {
    await assertProductExists(productId);

    return productRepository.addImage({
      product: { connect: { id: productId } },
      url: input.url,
      altText: input.altText,
      type: input.type ?? ProductImageType.GALLERY,
      width: input.width,
      height: input.height,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  deleteImage: async (productId: string, imageId: string) => {
    await assertProductExists(productId);

    const image = await productRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundError("Image not found on this product");
    }

    await productRepository.deleteImage(imageId);
  },

  reorderImages: async (
    productId: string,
    updates: { id: string; sortOrder: number }[]
  ) => {
    await assertProductExists(productId);
    return productRepository.updateImageSortOrders(updates);
  },

  // ── Variants ──────────────────────────────────────────────────────────

  createVariant: async (
    productId: string,
    input: {
      name: string;
      sku?: string;
      price: number;
      processingDays?: number;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) => {
    await assertProductExists(productId);

    if (input.sku) {
      await assertSkuUnique(input.sku);
    }

    return productRepository.createVariant({
      product: { connect: { id: productId } },
      name: input.name,
      sku: input.sku,
      price: new Decimal(input.price),
      processingDays: input.processingDays,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  updateVariant: async (
    productId: string,
    variantId: string,
    input: {
      name?: string;
      sku?: string;
      price?: number;
      processingDays?: number;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) => {
    await assertProductExists(productId);

    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Variant not found on this product");
    }

    if (input.sku && input.sku !== variant.sku) {
      await assertSkuUnique(input.sku, variantId);
    }

    return productRepository.updateVariant(variantId, {
      ...(input.name && { name: input.name }),
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.price !== undefined && { price: new Decimal(input.price) }),
      ...(input.processingDays !== undefined && {
        processingDays: input.processingDays,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    });
  },

  deleteVariant: async (productId: string, variantId: string) => {
    await assertProductExists(productId);

    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Variant not found on this product");
    }

    await productRepository.deleteVariant(variantId);
  },

  // ── Variant Images ────────────────────────────────────────────────────

  addVariantImage: async (
    productId: string,
    variantId: string,
    input: {
      url: string;
      altText?: string;
      sortOrder?: number;
    }
  ) => {
    await assertProductExists(productId);

    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Variant not found on this product");
    }

    return productRepository.addVariantImage({
      variant: { connect: { id: variantId } },
      url: input.url,
      altText: input.altText,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  deleteVariantImage: async (
    productId: string,
    variantId: string,
    imageId: string
  ) => {
    await assertProductExists(productId);

    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Variant not found on this product");
    }

    const image = await productRepository.findVariantImageById(imageId);
    if (!image || image.variantId !== variantId) {
      throw new NotFoundError("Image not found on this variant");
    }

    await productRepository.deleteVariantImage(imageId);
  },

  // ── Configuration ─────────────────────────────────────────────────────

  upsertConfiguration: async (
    productId: string,
    input: {
      uploadRequired?: boolean;
      minImages?: number;
      maxImages?: number;
      maxFileSizeMb?: number;
      maxZipSizeMb?: number;
      allowedExtensions?: string[];
      allowedSources?: string[];
      allowDuplicateImages?: boolean;
      allowImageReordering?: boolean;
      estimatedProductionDays?: number;
      extraRules?: Record<string, unknown>;
    }
  ) => {
    await assertProductExists(productId);

    if (
      input.minImages !== undefined &&
      input.maxImages !== undefined &&
      input.minImages > input.maxImages
    ) {
      throw new BadRequestError("minImages cannot exceed maxImages");
    }

    return productRepository.upsertConfiguration(productId, {
      uploadRequired: input.uploadRequired ?? false,
      minImages: input.minImages,
      maxImages: input.maxImages,
      maxFileSizeMb: input.maxFileSizeMb,
      maxZipSizeMb: input.maxZipSizeMb,
      allowedExtensions: input.allowedExtensions ?? [],
      allowedSources: (input.allowedSources as any) ?? [],
      allowDuplicateImages: input.allowDuplicateImages ?? false,
      allowImageReordering: input.allowImageReordering ?? true,
      estimatedProductionDays: input.estimatedProductionDays,
      extraRules:
        input.extraRules !== undefined
          ? (input.extraRules as Prisma.InputJsonValue)
          : undefined,
    });
  },

  // ── Pricing ───────────────────────────────────────────────────────────

  upsertPricing: async (
    productId: string,
    input: {
      strategy: PricingStrategy;
      minimumOrderQuantity?: number;
      incrementQuantity?: number;
      incrementPrice?: number;
      unitPrice?: number;
      baseUnitPrice?: number;
    }
  ) => {
    await assertProductExists(productId);

    return productRepository.upsertPricing(productId, {
      strategy: input.strategy,
      minimumOrderQuantity: input.minimumOrderQuantity ?? null,
      incrementQuantity: input.incrementQuantity ?? null,
      incrementPrice:
        input.incrementPrice !== undefined
          ? new Decimal(input.incrementPrice)
          : null,
      unitPrice:
        input.unitPrice !== undefined ? new Decimal(input.unitPrice) : null,
      baseUnitPrice:
        input.baseUnitPrice !== undefined
          ? new Decimal(input.baseUnitPrice)
          : null,
    });
  },

  // ── Pricing Tiers ─────────────────────────────────────────────────────

  createPricingTier: async (
    productId: string,
    input: {
      quantity: number;
      price: number;
      label?: string;
      isSpecialOffer?: boolean;
      sortOrder?: number;
    }
  ) => {
    await assertProductExists(productId);

    const pricingConfig = await prisma.pricingConfiguration.findUnique({
      where: { productId },
    });

    if (!pricingConfig) {
      throw new BadRequestError(
        "Configure pricing strategy first before adding tiers"
      );
    }

    if (pricingConfig.strategy !== PricingStrategy.TIERED_PRICING) {
      throw new BadRequestError(
        "Tiers can only be added to products with TIERED_PRICING strategy"
      );
    }

    const existing = await prisma.pricingTier.findFirst({
      where: {
        pricingConfigId: pricingConfig.id,
        quantity: input.quantity,
      },
    });

    if (existing) {
      throw new ConflictError(
        `A tier for quantity ${input.quantity} already exists`
      );
    }

    return productRepository.createPricingTier({
      pricingConfig: { connect: { id: pricingConfig.id } },
      quantity: input.quantity,
      price: new Decimal(input.price),
      label: input.label ?? null,
      isSpecialOffer: input.isSpecialOffer ?? false,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  updatePricingTier: async (
    productId: string,
    tierId: string,
    input: {
      quantity?: number;
      price?: number;
      label?: string;
      isSpecialOffer?: boolean;
      sortOrder?: number;
    }
  ) => {
    await assertProductExists(productId);

    const tier = await productRepository.findPricingTierById(tierId);
    if (!tier) throw new NotFoundError("Pricing tier not found");

    const pricingConfig = await prisma.pricingConfiguration.findUnique({
      where: { productId },
    });

    if (!pricingConfig || tier.pricingConfigId !== pricingConfig.id) {
      throw new NotFoundError("Pricing tier not found on this product");
    }

    if (input.quantity && input.quantity !== tier.quantity) {
      const duplicate = await prisma.pricingTier.findFirst({
        where: {
          pricingConfigId: pricingConfig.id,
          quantity: input.quantity,
          NOT: { id: tierId },
        },
      });
      if (duplicate) {
        throw new ConflictError(
          `A tier for quantity ${input.quantity} already exists`
        );
      }
    }

    return productRepository.updatePricingTier(tierId, {
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.price !== undefined && { price: new Decimal(input.price) }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.isSpecialOffer !== undefined && {
        isSpecialOffer: input.isSpecialOffer,
      }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    });
  },

  deletePricingTier: async (productId: string, tierId: string) => {
    await assertProductExists(productId);

    const tier = await productRepository.findPricingTierById(tierId);
    if (!tier) throw new NotFoundError("Pricing tier not found");

    const pricingConfig = await prisma.pricingConfiguration.findUnique({
      where: { productId },
    });

    if (!pricingConfig || tier.pricingConfigId !== pricingConfig.id) {
      throw new NotFoundError("Pricing tier not found on this product");
    }

    await productRepository.deletePricingTier(tierId);
  },

  // ── Custom Fields ─────────────────────────────────────────────────────

  createCustomField: async (
    productId: string,
    input: {
      name: string;
      label: string;
      type: string;
      placeholder?: string;
      helpText?: string;
      isRequired?: boolean;
      sortOrder?: number;
      validationJson?: Record<string, unknown>;
    }
  ) => {
    await assertProductExists(productId);

    return productRepository.createCustomField({
      product: { connect: { id: productId } },
      name: input.name,
      label: input.label,
      type: input.type as any,
      placeholder: input.placeholder,
      helpText: input.helpText,
      isRequired: input.isRequired ?? false,
      sortOrder: input.sortOrder ?? 0,
      validationJson:
        input.validationJson !== undefined
          ? (input.validationJson as Prisma.InputJsonValue)
          : undefined,
    });
  },

  updateCustomField: async (
    productId: string,
    fieldId: string,
    input: {
      name?: string;
      label?: string;
      type?: string;
      placeholder?: string;
      helpText?: string;
      isRequired?: boolean;
      sortOrder?: number;
      validationJson?: Record<string, unknown>;
    }
  ) => {
    await assertProductExists(productId);

    const field = await productRepository.findCustomFieldById(fieldId);
    if (!field || field.productId !== productId) {
      throw new NotFoundError("Custom field not found on this product");
    }

    return productRepository.updateCustomField(fieldId, {
      ...(input.name && { name: input.name }),
      ...(input.label && { label: input.label }),
      ...(input.type && { type: input.type as any }),
      ...(input.placeholder !== undefined && {
        placeholder: input.placeholder,
      }),
      ...(input.helpText !== undefined && { helpText: input.helpText }),
      ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.validationJson !== undefined && {
        validationJson: input.validationJson as Prisma.InputJsonValue,
      }),
    });
  },

  deleteCustomField: async (productId: string, fieldId: string) => {
    await assertProductExists(productId);

    const field = await productRepository.findCustomFieldById(fieldId);
    if (!field || field.productId !== productId) {
      throw new NotFoundError("Custom field not found on this product");
    }

    await productRepository.deleteCustomField(fieldId);
  },

  reorderCustomFields: async (
    productId: string,
    updates: { id: string; sortOrder: number }[]
  ) => {
    await assertProductExists(productId);
    return productRepository.updateCustomFieldSortOrders(updates);
  },

  // ── Custom Field Options ─────────────────────────────────────────────

  createCustomFieldOption: async (
    productId: string,
    fieldId: string,
    input: { label: string; value: string; sortOrder?: number }
  ) => {
    await assertProductExists(productId);

    const field = await productRepository.findCustomFieldById(fieldId);
    if (!field || field.productId !== productId) {
      throw new NotFoundError("Custom field not found on this product");
    }

    const allowedTypes = ["SELECT", "RADIO"];
    if (!allowedTypes.includes(field.type)) {
      throw new BadRequestError(
        "Options can only be added to SELECT or RADIO fields"
      );
    }

    return productRepository.createCustomFieldOption({
      customField: { connect: { id: fieldId } },
      label: input.label,
      value: input.value,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  updateCustomFieldOption: async (
    productId: string,
    fieldId: string,
    optionId: string,
    input: { label?: string; value?: string; sortOrder?: number }
  ) => {
    await assertProductExists(productId);

    const field = await productRepository.findCustomFieldById(fieldId);
    if (!field || field.productId !== productId) {
      throw new NotFoundError("Custom field not found on this product");
    }

    const option = await productRepository.findCustomFieldOptionById(optionId);
    if (!option || option.customFieldId !== fieldId) {
      throw new NotFoundError("Option not found on this field");
    }

    return productRepository.updateCustomFieldOption(optionId, {
      ...(input.label && { label: input.label }),
      ...(input.value && { value: input.value }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    });
  },

  deleteCustomFieldOption: async (
    productId: string,
    fieldId: string,
    optionId: string
  ) => {
    await assertProductExists(productId);

    const field = await productRepository.findCustomFieldById(fieldId);
    if (!field || field.productId !== productId) {
      throw new NotFoundError("Custom field not found on this product");
    }

    const option = await productRepository.findCustomFieldOptionById(optionId);
    if (!option || option.customFieldId !== fieldId) {
      throw new NotFoundError("Option not found on this field");
    }

    await productRepository.deleteCustomFieldOption(optionId);
  },
};