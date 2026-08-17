import { prisma } from "../../../prisma/client.js";
import { Prisma, Product } from "@prisma/client";

export interface FindAllProductsOptions {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: "name" | "createdAt" | "sortOrder";
  sortOrder?: "asc" | "desc";
}

export interface FindAllProductsResult {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: {
      include: { images: true };
    };
    pricingConfig: {
      include: { tiers: true };
    };
    configuration: true;
    customFields: {
      include: { options: true };
    };
    _count: { select: { variants: true } };
  };
}>;

export const productRepository = {
  // ── Create ────────────────────────────────────────────────────────────
  create: async (data: Prisma.ProductCreateInput): Promise<Product> => {
    return prisma.product.create({ data });
  },

  // ── Find All ──────────────────────────────────────────────────────────
  findAll: async (
    options: FindAllProductsOptions
  ): Promise<FindAllProductsResult> => {
    const {
      page,
      limit,
      search,
      categoryId,
      isActive,
      isFeatured,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: {
            orderBy: { sortOrder: "asc" },
            include: { images: { orderBy: { sortOrder: "asc" } } },
          },
          pricingConfig: {
            include: { tiers: { orderBy: { sortOrder: "asc" } } },
          },
          configuration: true,
          customFields: {
            orderBy: { sortOrder: "asc" },
            include: { options: { orderBy: { sortOrder: "asc" } } },
          },
          _count: { select: { variants: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Find One ──────────────────────────────────────────────────────────
  findById: async (id: string): Promise<ProductWithRelations | null> => {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          orderBy: { sortOrder: "asc" },
          include: { images: { orderBy: { sortOrder: "asc" } } },
        },
        pricingConfig: {
          include: { tiers: { orderBy: { sortOrder: "asc" } } },
        },
        configuration: true,
        customFields: {
          orderBy: { sortOrder: "asc" },
          include: { options: { orderBy: { sortOrder: "asc" } } },
        },
        _count: { select: { variants: true } },
      },
    });
  },

  // ── Find by Slug ──────────────────────────────────────────────────────
  findBySlug: async (slug: string): Promise<Product | null> => {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
    });
  },

  findBySlugExcludingId: async (
    slug: string,
    excludeId: string
  ): Promise<Product | null> => {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null, NOT: { id: excludeId } },
    });
  },

  // ── Update ────────────────────────────────────────────────────────────
  update: async (
    id: string,
    data: Prisma.ProductUpdateInput
  ): Promise<Product> => {
    return prisma.product.update({ where: { id }, data });
  },

  // ── Soft Delete ───────────────────────────────────────────────────────
  softDelete: async (id: string): Promise<Product> => {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  // ── Product Images ────────────────────────────────────────────────────
  addImage: async (data: Prisma.ProductImageCreateInput) => {
    return prisma.productImage.create({ data });
  },

  deleteImage: async (imageId: string) => {
    return prisma.productImage.delete({ where: { id: imageId } });
  },

  findImageById: async (imageId: string) => {
    return prisma.productImage.findUnique({ where: { id: imageId } });
  },

  updateImageSortOrders: async (
    updates: { id: string; sortOrder: number }[]
  ) => {
    return prisma.$transaction(
      updates.map(({ id, sortOrder }) =>
        prisma.productImage.update({ where: { id }, data: { sortOrder } })
      )
    );
  },

  // ── Variants ──────────────────────────────────────────────────────────
  createVariant: async (data: Prisma.ProductVariantCreateInput) => {
    return prisma.productVariant.create({ data });
  },

  updateVariant: async (
    variantId: string,
    data: Prisma.ProductVariantUpdateInput
  ) => {
    return prisma.productVariant.update({ where: { id: variantId }, data });
  },

  deleteVariant: async (variantId: string) => {
    return prisma.productVariant.delete({ where: { id: variantId } });
  },

  findVariantById: async (variantId: string) => {
    return prisma.productVariant.findUnique({ where: { id: variantId } });
  },

  // ── Variant Images ────────────────────────────────────────────────────
  addVariantImage: async (data: Prisma.VariantImageCreateInput) => {
    return prisma.variantImage.create({ data });
  },

  findVariantImageById: async (imageId: string) => {
    return prisma.variantImage.findUnique({ where: { id: imageId } });
  },

  deleteVariantImage: async (imageId: string) => {
    return prisma.variantImage.delete({ where: { id: imageId } });
  },

  findVariantImages: async (variantId: string) => {
    return prisma.variantImage.findMany({
      where: { variantId },
      orderBy: { sortOrder: "asc" },
    });
  },

  // ── Configuration ─────────────────────────────────────────────────────
  upsertConfiguration: async (
    productId: string,
    data: Omit<Prisma.ProductConfigurationCreateInput, "product">
  ) => {
    return prisma.productConfiguration.upsert({
      where: { productId },
      create: { ...data, product: { connect: { id: productId } } },
      update: data,
    });
  },

  // ── Pricing ───────────────────────────────────────────────────────────
  upsertPricing: async (
    productId: string,
    data: Omit<Prisma.PricingConfigurationCreateInput, "product">
  ) => {
    return prisma.pricingConfiguration.upsert({
      where: { productId },
      create: { ...data, product: { connect: { id: productId } } },
      update: data,
      include: { tiers: { orderBy: { sortOrder: "asc" } } },
    });
  },

  // ── Pricing Tiers ─────────────────────────────────────────────────────
  createPricingTier: async (data: Prisma.PricingTierCreateInput) => {
    return prisma.pricingTier.create({ data });
  },

  updatePricingTier: async (
    tierId: string,
    data: Prisma.PricingTierUpdateInput
  ) => {
    return prisma.pricingTier.update({ where: { id: tierId }, data });
  },

  deletePricingTier: async (tierId: string) => {
    return prisma.pricingTier.delete({ where: { id: tierId } });
  },

  findPricingTierById: async (tierId: string) => {
    return prisma.pricingTier.findUnique({ where: { id: tierId } });
  },

  deleteAllTiersForConfig: async (pricingConfigId: string) => {
    return prisma.pricingTier.deleteMany({ where: { pricingConfigId } });
  },

  // ── Custom Fields ─────────────────────────────────────────────────────
  createCustomField: async (data: Prisma.CustomFieldCreateInput) => {
    return prisma.customField.create({
      data,
      include: { options: true },
    });
  },

  updateCustomField: async (
    fieldId: string,
    data: Prisma.CustomFieldUpdateInput
  ) => {
    return prisma.customField.update({
      where: { id: fieldId },
      data,
      include: { options: true },
    });
  },

  deleteCustomField: async (fieldId: string) => {
    return prisma.customField.delete({ where: { id: fieldId } });
  },

  findCustomFieldById: async (fieldId: string) => {
    return prisma.customField.findUnique({
      where: { id: fieldId },
      include: { options: true },
    });
  },

  updateCustomFieldSortOrders: async (
    updates: { id: string; sortOrder: number }[]
  ) => {
    return prisma.$transaction(
      updates.map(({ id, sortOrder }) =>
        prisma.customField.update({ where: { id }, data: { sortOrder } })
      )
    );
  },

  // ── Custom Field Options ──────────────────────────────────────────────
  createCustomFieldOption: async (
    data: Prisma.CustomFieldOptionCreateInput
  ) => {
    return prisma.customFieldOption.create({ data });
  },

  updateCustomFieldOption: async (
    optionId: string,
    data: Prisma.CustomFieldOptionUpdateInput
  ) => {
    return prisma.customFieldOption.update({
      where: { id: optionId },
      data,
    });
  },

  deleteCustomFieldOption: async (optionId: string) => {
    return prisma.customFieldOption.delete({ where: { id: optionId } });
  },

  findCustomFieldOptionById: async (optionId: string) => {
    return prisma.customFieldOption.findUnique({ where: { id: optionId } });
  },

  // ── Category Existence ────────────────────────────────────────────────
  findCategoryById: async (categoryId: string) => {
    return prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null, isActive: true },
    });
  },

  // ── SKU Uniqueness ────────────────────────────────────────────────────
  findVariantBySku: async (sku: string): Promise<{ id: string } | null> => {
    return prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });
  },
};