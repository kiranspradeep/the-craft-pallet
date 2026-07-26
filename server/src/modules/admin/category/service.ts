import { Category } from "@prisma/client";
import { categoryRepository, FindAllCategoriesOptions, FindAllCategoriesResult } from "./repository.js";
import { generateSlug, generateUniqueSlug } from "../../../shared/utils/slug.js";
import { ConflictError, NotFoundError } from "../../../shared/errors/AppError.js";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const categoryService = {
  // ── Create ────────────────────────────────────────────────────────────
  create: async (
    input: CreateCategoryInput
  ): Promise<Category> => {
    // Resolve slug
    let slug: string;

    if (input.slug) {
      // Admin provided a slug — check uniqueness
      const existing = await categoryRepository.findBySlug(input.slug);
      if (existing) {
        throw new ConflictError(
          `Slug "${input.slug}" is already in use`
        );
      }
      slug = input.slug;
    } else {
      // Auto-generate from name
      slug = await generateUniqueSlug(input.name, async (candidate) => {
        const found = await categoryRepository.findBySlug(candidate);
        return !!found;
      });
    }

    return categoryRepository.create({
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl || null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    });
  },

  // ── List ──────────────────────────────────────────────────────────────
  findAll: async (
    options: FindAllCategoriesOptions
  ): Promise<FindAllCategoriesResult> => {
    return categoryRepository.findAll(options);
  },

  // ── Get One ───────────────────────────────────────────────────────────
  findById: async (id: string) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  },

  // ── Update ────────────────────────────────────────────────────────────
  update: async (
    id: string,
    input: UpdateCategoryInput
  ): Promise<Category> => {
    // Verify category exists
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    let slug = input.slug;

    if (slug) {
      // Check slug not taken by another category
      const conflict = await categoryRepository.findBySlugExcludingId(slug, id);
      if (conflict) {
        throw new ConflictError(`Slug "${slug}" is already in use`);
      }
    } else if (input.name && input.name !== existing.name) {
      // Name changed and no slug provided — regenerate slug
      slug = await generateUniqueSlug(input.name, async (candidate) => {
        const found = await categoryRepository.findBySlugExcludingId(
          candidate,
          id
        );
        return !!found;
      });
    }

    return categoryRepository.update(id, {
      ...(input.name && { name: input.name }),
      ...(slug && { slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.imageUrl !== undefined && {
        imageUrl: input.imageUrl || null,
      }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });
  },

  // ── Soft Delete ───────────────────────────────────────────────────────
  softDelete: async (id: string): Promise<void> => {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }
    await categoryRepository.softDelete(id);
  },

  // ── Restore ───────────────────────────────────────────────────────────
  restore: async (id: string): Promise<Category> => {
    // For restore we query including deleted rows
    const existing = await prismaFindDeleted(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }
    return categoryRepository.restore(id);
  },
};

// Helper — find a category even if soft-deleted (for restore)
import { prisma } from "../../../prisma/client.js";

const prismaFindDeleted = async (id: string) => {
  return prisma.category.findFirst({ where: { id } });
};