import { prisma } from "../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const publicRepository = {
  // ── Categories ────────────────────────────────────────────────────────

  findAllCategories: async () => {
    return prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, deletedAt: null },
            },
          },
        },
      },
    });
  },

  findCategoryBySlug: async (slug: string) => {
    return prisma.category.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true, deletedAt: null },
            },
          },
        },
      },
    });
  },

  // ── Products ──────────────────────────────────────────────────────────

  findAllProducts: async (options: {
    page: number;
    limit: number;
    search?: string;
    categorySlug?: string;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const {
      page,
      limit,
      search,
      categorySlug,
      isFeatured,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = options;

    const skip = (page - 1) * limit;

    let categoryId: string | undefined;
    if (categorySlug) {
      const category = await prisma.category.findFirst({
        where: { slug: categorySlug, isActive: true, deletedAt: null },
        select: { id: true },
      });
      if (!category) {
        return { products: [], total: 0, page, limit, totalPages: 0 };
      }
      categoryId = category.id;
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              price: true,
              processingDays: true,
              sortOrder: true,
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
          pricingConfig: {
            include: {
              tiers: { orderBy: { sortOrder: "asc" } },
            },
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

  findProductBySlug: async (slugOrId: string) => {
    return prisma.product.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
        pricingConfig: {
          include: {
            tiers: { orderBy: { sortOrder: "asc" } },
          },
        },
        configuration: true,
        customFields: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });
  },

  // ── Related Products ──────────────────────────────────────────────────

  findRelatedProducts: async (
    categoryId: string,
    excludeProductId: string
  ) => {
    return prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
        deletedAt: null,
        NOT: { id: excludeProductId },
      },
      take: 4,
      orderBy: { sortOrder: "asc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        pricingConfig: {
          include: {
            tiers: { orderBy: { sortOrder: "asc" } },
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            price: true,
            sortOrder: true,
          },
        },
      },
    });
  },

  // ── Settings ──────────────────────────────────────────────────────────

  getBusinessSettings: async () => {
    return prisma.businessSetting.findFirst();
  },

  getShippingSettings: async () => {
    return prisma.shippingSetting.findFirst();
  },

  getWhatsAppSettings: async () => {
    return prisma.whatsAppSetting.findFirst({
      select: {
        phoneNumber: true,
        isEnabled: true,
        orderMessageTemplate: true,
      },
    });
  },
};
// import { prisma } from "../../prisma/client.js";
// import { Prisma } from "@prisma/client";

// export const publicRepository = {
//   // ── Categories ────────────────────────────────────────────────────────

//   findAllCategories: async () => {
//     return prisma.category.findMany({
//       where: { isActive: true, deletedAt: null },
//       orderBy: { sortOrder: "asc" },
//       include: {
//         _count: {
//           select: {
//             products: {
//               where: { isActive: true, deletedAt: null },
//             },
//           },
//         },
//       },
//     });
//   },

//   findCategoryBySlug: async (slug: string) => {
//     return prisma.category.findFirst({
//       where: { slug, isActive: true, deletedAt: null },
//       include: {
//         _count: {
//           select: {
//             products: {
//               where: { isActive: true, deletedAt: null },
//             },
//           },
//         },
//       },
//     });
//   },

//   // ── Products ──────────────────────────────────────────────────────────

//   findAllProducts: async (options: {
//     page: number;
//     limit: number;
//     search?: string;
//     categorySlug?: string;
//     isFeatured?: boolean;
//     sortBy?: string;
//     sortOrder?: string;
//   }) => {
//     const {
//       page,
//       limit,
//       search,
//       categorySlug,
//       isFeatured,
//       sortBy = "sortOrder",
//       sortOrder = "asc",
//     } = options;

//     const skip = (page - 1) * limit;

//     let categoryId: string | undefined;
//     if (categorySlug) {
//       const category = await prisma.category.findFirst({
//         where: { slug: categorySlug, isActive: true, deletedAt: null },
//         select: { id: true },
//       });
//       if (!category) {
//         return { products: [], total: 0, page, limit, totalPages: 0 };
//       }
//       categoryId = category.id;
//     }

//     const where: Prisma.ProductWhereInput = {
//       isActive: true,
//       deletedAt: null,
//       ...(categoryId && { categoryId }),
//       ...(isFeatured !== undefined && { isFeatured }),
//       ...(search && {
//         OR: [
//           { name: { contains: search, mode: "insensitive" } },
//           { shortDescription: { contains: search, mode: "insensitive" } },
//         ],
//       }),
//     };

//     const [products, total] = await prisma.$transaction([
//       prisma.product.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { [sortBy]: sortOrder },
//         include: {
//           category: {
//             select: { id: true, name: true, slug: true },
//           },
//           images: {
//             orderBy: { sortOrder: "asc" },
//             take: 1,
//           },
//           variants: {
//             where: { isActive: true },
//             orderBy: { sortOrder: "asc" },
//             select: {
//               id: true,
//               name: true,
//               price: true,
//               processingDays: true,
//               sortOrder: true,
//               images: {
//                 orderBy: { sortOrder: "asc" },
//               },
//             },
//           },
//           pricingConfig: {
//             include: {
//               tiers: { orderBy: { sortOrder: "asc" } },
//             },
//           },
//           _count: { select: { variants: true } },
//         },
//       }),
//       prisma.product.count({ where }),
//     ]);

//     return {
//       products,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   },

//   findProductBySlug: async (slugOrId: string) => {
//     return prisma.product.findFirst({
//       where: {
//         isActive: true,
//         deletedAt: null,
//         OR: [
//           { slug: slugOrId },
//           { id: slugOrId },
//         ],
//       },
//       include: {
//         category: {
//           select: { id: true, name: true, slug: true },
//         },
//         images: {
//           orderBy: { sortOrder: "asc" },
//         },
//         variants: {
//           where: { isActive: true },
//           orderBy: { sortOrder: "asc" },
//           include: {
//             images: { orderBy: { sortOrder: "asc" } },
//           },
//         },
//         pricingConfig: {
//           include: {
//             tiers: { orderBy: { sortOrder: "asc" } },
//           },
//         },
//         configuration: true,
//         customFields: {
//           orderBy: { sortOrder: "asc" },
//           include: {
//             options: { orderBy: { sortOrder: "asc" } },
//           },
//         },
//       },
//     });
//   },

//   // ── Related Products ──────────────────────────────────────────────────

//   findRelatedProducts: async (
//     categoryId: string,
//     excludeProductId: string
//   ) => {
//     return prisma.product.findMany({
//       where: {
//         categoryId,
//         isActive: true,
//         deletedAt: null,
//         NOT: { id: excludeProductId },
//       },
//       take: 4,
//       orderBy: { sortOrder: "asc" },
//       include: {
//         images: {
//           orderBy: { sortOrder: "asc" },
//           take: 1,
//         },
//         pricingConfig: {
//           include: {
//             tiers: { orderBy: { sortOrder: "asc" } },
//           },
//         },
//         variants: {
//           where: { isActive: true },
//           orderBy: { sortOrder: "asc" },
//           select: {
//             id: true,
//             name: true,
//             price: true,
//             sortOrder: true,
//           },
//         },
//       },
//     });
//   },

//   // ── Settings ──────────────────────────────────────────────────────────

//   getBusinessSettings: async () => {
//     return prisma.businessSetting.findFirst();
//   },

//   getShippingSettings: async () => {
//     return prisma.shippingSetting.findFirst();
//   },

//   getWhatsAppSettings: async () => {
//     return prisma.whatsAppSetting.findFirst({
//       select: {
//         phoneNumber: true,
//         isEnabled: true,
//         orderMessageTemplate: true,
//       },
//     });
//   },
// };

