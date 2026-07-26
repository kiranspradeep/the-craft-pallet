import { prisma } from "../../../prisma/client.js";
import { Category, Prisma } from "@prisma/client";

export interface FindAllCategoriesOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: "sortOrder" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export interface FindAllCategoriesResult {
  categories: (Category & { _count: { products: number } })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const categoryRepository = {
  // ── Create ────────────────────────────────────────────────────────────
  create: async (
    data: Prisma.CategoryCreateInput
  ): Promise<Category> => {
    return prisma.category.create({ data });
  },

  // ── Find All ──────────────────────────────────────────────────────────
  findAll: async (
    options: FindAllCategoriesOptions
  ): Promise<FindAllCategoriesResult> => {
    const {
      page,
      limit,
      search,
      sortBy = "sortOrder",
      sortOrder = "asc",
      isActive,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Find One ──────────────────────────────────────────────────────────
  findById: async (
    id: string
  ): Promise<(Category & { _count: { products: number } }) | null> => {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { products: true } },
      },
    });
  },

  // ── Find by Slug ──────────────────────────────────────────────────────
  findBySlug: async (slug: string): Promise<Category | null> => {
    return prisma.category.findFirst({
      where: { slug, deletedAt: null },
    });
  },

  // ── Find by Slug Excluding ID (for update uniqueness check) ───────────
  findBySlugExcludingId: async (
    slug: string,
    excludeId: string
  ): Promise<Category | null> => {
    return prisma.category.findFirst({
      where: { slug, deletedAt: null, NOT: { id: excludeId } },
    });
  },

  // ── Update ────────────────────────────────────────────────────────────
  update: async (
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> => {
    return prisma.category.update({ where: { id }, data });
  },

  // ── Soft Delete ───────────────────────────────────────────────────────
  softDelete: async (id: string): Promise<Category> => {
    return prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  },

  // ── Restore ───────────────────────────────────────────────────────────
  restore: async (id: string): Promise<Category> => {
    return prisma.category.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  },
};