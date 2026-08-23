import {
  PrismaClient,
  AssetSourceType,
  PricingStrategy,
  CustomFieldType,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────

const photoSources: AssetSourceType[] = [
  AssetSourceType.DIRECT_UPLOAD,
  AssetSourceType.ZIP_UPLOAD,
  AssetSourceType.GOOGLE_DRIVE,
  AssetSourceType.WHATSAPP,
];

const defaultExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
];

async function ensureCustomField(
  productId: string,
  name: string,
  data: {
    label: string;
    type: CustomFieldType;
    placeholder?: string;
    helpText?: string;
    isRequired?: boolean;
    sortOrder?: number;
    validationJson?: object;
  }
) {
  const existing = await prisma.customField.findFirst({
    where: { productId, name },
  });
  if (!existing) {
    return prisma.customField.create({
      data: { productId, name, ...data },
    });
  }
  return existing;
}

async function ensureVariant(
  productId: string,
  sku: string,
  data: {
    name: string;
    price: number;
    sortOrder: number;
    processingDays?: number;
  }
) {
  const existing = await prisma.productVariant.findUnique({ where: { sku } });
  if (!existing) {
    await prisma.productVariant.create({
      data: {
        productId,
        sku,
        name: data.name,
        price: new Decimal(data.price),
        isActive: true,
        sortOrder: data.sortOrder,
        processingDays: data.processingDays ?? 10,
      },
    });
  }
}

async function ensureTier(
  pricingConfigId: string,
  quantity: number,
  price: number,
  label: string,
  isSpecialOffer: boolean,
  sortOrder: number
) {
  const existing = await prisma.pricingTier.findFirst({
    where: { pricingConfigId, quantity },
  });
  if (!existing) {
    await prisma.pricingTier.create({
      data: {
        pricingConfigId,
        quantity,
        price: new Decimal(price),
        label,
        isSpecialOffer,
        sortOrder,
      },
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding The Craft Pallet...\n");

  // ── Business Settings ──────────────────────────────────────────────────
  if (!(await prisma.businessSetting.findFirst())) {
    await prisma.businessSetting.create({
      data: {
        businessName: "The Craft Pallet",
        tagline: "Personalised Gifts & Printing",
        currency: "INR",
      },
    });
    console.log("✅ Business settings created");
  }

  // ── Shipping Settings ──────────────────────────────────────────────────
  if (!(await prisma.shippingSetting.findFirst())) {
    await prisma.shippingSetting.create({
      data: {
        keralaShippingCharge: new Decimal(55),
        outsideKeralaShippingCharge: new Decimal(60),
        keralaProcessingDays: 10,
        outsideKeralaProcessingDays: 10,
      },
    });
    console.log("✅ Shipping settings created (Kerala: ₹55, Outside: ₹60)");
  }

  // ── Categories ─────────────────────────────────────────────────────────

  const catPolaroids = await prisma.category.upsert({
    where: { slug: "polaroids" },
    create: {
      name: "Polaroids",
      slug: "polaroids",
      description:
        "High-quality personalised polaroid prints for room decor, gifting, and memories.",
      isActive: true,
      sortOrder: 0,
    },
    update: { name: "Polaroids", isActive: true },
  });

  const catFrames = await prisma.category.upsert({
    where: { slug: "photo-frames" },
    create: {
      name: "Photo Frames",
      slug: "photo-frames",
      description:
        "Personalised photo frames in multiple sizes for every occasion.",
      isActive: true,
      sortOrder: 1,
    },
    update: { name: "Photo Frames", isActive: true },
  });

  const catGifts = await prisma.category.upsert({
    where: { slug: "personalised-gifts" },
    create: {
      name: "Personalised Gifts",
      slug: "personalised-gifts",
      description: "Unique personalised gifts for every occasion.",
      isActive: true,
      sortOrder: 2,
    },
    update: { name: "Personalised Gifts", isActive: true },
  });

  console.log("✅ Categories seeded\n");

  // ══════════════════════════════════════════════════════════════════════
  // POLAROIDS
  // ══════════════════════════════════════════════════════════════════════

  // ── 1. Mini Polaroids – Set of 36 ─────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "mini-polaroids-36" },
      create: {
        categoryId: catPolaroids.id,
        name: "Mini Polaroids – Set of 36",
        slug: "mini-polaroids-36",
        description:
          "Capture your favourite memories in a cute and aesthetic way with our Mini Polaroids. These compact photo prints are perfect for decorating your room, journals, scrapbooks, photo walls, gift boxes, and memory albums. Printed with high-quality photo paper and vibrant colours, they make your special moments last forever.\n\nSize: 5 × 7 cm | Quantity: 36 Mini Polaroids",
        shortDescription:
          "36 mini polaroid prints (5×7cm) — perfect for room decor, journals, and gifting.",
        isActive: true,
        isFeatured: true,
        sortOrder: 0,
        metaTitle: "Mini Polaroids Set of 36 | The Craft Pallet",
        metaDescription:
          "Order personalised mini polaroid prints. 36 photos for ₹99. Perfect for room decoration, scrapbooks and gifting.",
        metaKeywords: "mini polaroids, photo prints, personalised polaroids, room decor",
      },
      update: { isActive: true, isFeatured: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.INCREMENTAL_QUANTITY,
        minimumOrderQuantity: 36,
        incrementQuantity: 36,
        incrementPrice: new Decimal(99),
      },
      update: {
        strategy: PricingStrategy.INCREMENTAL_QUANTITY,
        minimumOrderQuantity: 36,
        incrementQuantity: 36,
        incrementPrice: new Decimal(99),
      },
    });

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 36,
        maxImages: 108,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Please upload clear, high-quality images for the best print result.",
          warning: "Make sure photos are selected correctly before placing the order.",
        },
      },
      update: { uploadRequired: true, minImages: 36, maxImages: 108 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText:
        "Upload 36, 72, or 108 clear high-quality photos. Supported: JPG, PNG, WEBP, HEIC.",
      isRequired: true,
      sortOrder: 0,
    });

    console.log("✅ Mini Polaroids 36 seeded");
  }

  // ── 2. Mini Polaroids – Set of 30 ─────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "mini-polaroids-30" },
      create: {
        categoryId: catPolaroids.id,
        name: "Mini Polaroids – Set of 30",
        slug: "mini-polaroids-30",
        description:
          "High-quality personalised mini polaroid prints with vibrant colours and a premium finish. Perfect for room decoration, scrapbooks, journals, gifting, and preserving your favourite memories.\n\nSize: 6 × 7 cm | Quantity: 30 Mini Polaroids",
        shortDescription:
          "30 mini polaroid prints (6×7cm) — vibrant colours, premium finish.",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
        metaTitle: "Mini Polaroids Set of 30 | The Craft Pallet",
        metaDescription:
          "Order personalised mini polaroid prints. 30 photos for ₹99. Premium finish.",
        metaKeywords: "mini polaroids, photo prints, personalised polaroids",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.INCREMENTAL_QUANTITY,
        minimumOrderQuantity: 30,
        incrementQuantity: 30,
        incrementPrice: new Decimal(99),
      },
      update: {
        strategy: PricingStrategy.INCREMENTAL_QUANTITY,
        minimumOrderQuantity: 30,
        incrementQuantity: 30,
        incrementPrice: new Decimal(99),
      },
    });

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 30,
        maxImages: 30,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Upload clear, high-quality photos for the best printing result.",
          colourNote: "Colour may slightly vary due to screen and printing differences.",
        },
      },
      update: { uploadRequired: true, minImages: 30, maxImages: 30 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload exactly 30 clear, high-quality photos.",
      isRequired: true,
      sortOrder: 0,
    });

    console.log("✅ Mini Polaroids 30 seeded");
  }

  // ── 3. Medium Polaroids ────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "medium-polaroids" },
      create: {
        categoryId: catPolaroids.id,
        name: "Medium Polaroids",
        slug: "medium-polaroids",
        description:
          "Capture your favourite moments in a larger, more detailed format with our premium Medium Polaroids. Printed on high-quality photo paper with rich colours and a classic white border, these prints are perfect for displaying cherished memories, decorating your room, creating photo walls, or gifting to someone special.\n\nSize: 7 × 10 cm",
        shortDescription:
          "Premium medium polaroid prints (7×10cm) — rich colours, classic white border.",
        isActive: true,
        isFeatured: true,
        sortOrder: 2,
        metaTitle: "Medium Polaroids | The Craft Pallet",
        metaDescription:
          "Order personalised medium polaroid prints (7×10cm). 18 prints ₹149, 36 prints ₹259. Premium quality.",
        metaKeywords: "medium polaroids, photo prints, personalised polaroids, 7x10",
      },
      update: { isActive: true, isFeatured: true },
    });

    const pricingConfig = await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.TIERED_PRICING,
        baseUnitPrice: new Decimal(9),
      },
      update: {
        strategy: PricingStrategy.TIERED_PRICING,
        baseUnitPrice: new Decimal(9),
      },
    });

    await ensureTier(pricingConfig.id, 18, 149, "Starter Set", false, 0);
    await ensureTier(pricingConfig.id, 36, 259, "Best Value 🔥", true, 1);

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 36,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Upload clear, high-quality photos for the best printing result.",
          bulkNote: "Need more prints? Contact us for custom quantities and bulk pricing.",
        },
      },
      update: { uploadRequired: true, maxImages: 36 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload your photos. Select a pricing tier to determine quantity.",
      isRequired: true,
      sortOrder: 0,
    });

    console.log("✅ Medium Polaroids seeded");
  }

  // ── 4. Large Polaroids ─────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "large-polaroids" },
      create: {
        categoryId: catPolaroids.id,
        name: "Large Polaroids",
        slug: "large-polaroids",
        description:
          "Capture your most cherished moments in stunning detail with our premium Large Polaroids. Designed to make every memory stand out, these larger prints feature vibrant colours, crisp quality, and a timeless white border. Perfect for room décor, memory walls, gifts, albums, and special occasions.\n\nSize: 10 × 10.5 cm",
        shortDescription:
          "Premium large polaroid prints (10×10.5cm) — vibrant colours, crisp quality, timeless white border.",
        isActive: true,
        isFeatured: false,
        sortOrder: 3,
        metaTitle: "Large Polaroids | The Craft Pallet",
        metaDescription:
          "Order personalised large polaroid prints. 12 prints ₹120, 24 prints ₹259. Premium quality.",
        metaKeywords: "large polaroids, photo prints, personalised polaroids, 10x10",
      },
      update: { isActive: true },
    });

    const pricingConfig = await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.TIERED_PRICING,
        baseUnitPrice: new Decimal(12),
      },
      update: {
        strategy: PricingStrategy.TIERED_PRICING,
        baseUnitPrice: new Decimal(12),
      },
    });

    await ensureTier(pricingConfig.id, 12, 120, "Starter Set", false, 0);
    await ensureTier(pricingConfig.id, 24, 259, "Best Value 🔥", true, 1);

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 24,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Upload clear, high-quality photos for the best printing result.",
          warning: "Customised orders cannot be changed after printing begins.",
          colourNote: "Colour may slightly vary due to screen and printing differences.",
          bulkNote: "Need more Polaroids? Custom quantities and bulk orders are available.",
        },
      },
      update: { uploadRequired: true, maxImages: 24 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload up to 24 clear, high-quality photos.",
      isRequired: true,
      sortOrder: 0,
    });

    console.log("✅ Large Polaroids seeded");
  }

  // ── 5. Sticker Polaroids ───────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "sticker-polaroids" },
      create: {
        categoryId: catPolaroids.id,
        name: "Sticker Polaroids",
        slug: "sticker-polaroids",
        description:
          "Turn your favourite memories into fun, peel-and-stick keepsakes! Our premium Sticker Polaroids are printed with vibrant colours on high-quality self-adhesive photo paper, making them perfect for decorating laptops, journals, phone cases, scrapbooks, gift boxes, water bottles, and more.",
        shortDescription:
          "Peel-and-stick personalised polaroid stickers — vibrant colours, premium self-adhesive paper.",
        isActive: true,
        isFeatured: true,
        sortOrder: 4,
        metaTitle: "Sticker Polaroids | The Craft Pallet",
        metaDescription:
          "Personalised sticker polaroids in 3 sizes. Perfect for laptops, journals, phone cases and scrapbooks.",
        metaKeywords: "sticker polaroids, photo stickers, personalised stickers",
      },
      update: { isActive: true, isFeatured: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const stickerVariants = [
      { name: "5×7cm — 18 Stickers",  sku: "STICKER-5X7-18",   price: 108, sortOrder: 0 },
      { name: "5×7cm — 36 Stickers",  sku: "STICKER-5X7-36",   price: 216, sortOrder: 1 },
      { name: "5×7cm — 54 Stickers",  sku: "STICKER-5X7-54",   price: 324, sortOrder: 2 },
      { name: "5×7cm — 72 Stickers",  sku: "STICKER-5X7-72",   price: 432, sortOrder: 3 },
      { name: "6×7cm — 15 Stickers",  sku: "STICKER-6X7-15",   price: 90,  sortOrder: 4 },
      { name: "6×7cm — 30 Stickers",  sku: "STICKER-6X7-30",   price: 180, sortOrder: 5 },
      { name: "6×7cm — 45 Stickers",  sku: "STICKER-6X7-45",   price: 270, sortOrder: 6 },
      { name: "6×7cm — 60 Stickers",  sku: "STICKER-6X7-60",   price: 360, sortOrder: 7 },
      { name: "7×10cm — 18 Stickers", sku: "STICKER-7X10-18",  price: 162, sortOrder: 8 },
      { name: "7×10cm — 36 Stickers", sku: "STICKER-7X10-36",  price: 324, sortOrder: 9 },
      { name: "7×10cm — 54 Stickers", sku: "STICKER-7X10-54",  price: 486, sortOrder: 10 },
      { name: "7×10cm — 72 Stickers", sku: "STICKER-7X10-72",  price: 648, sortOrder: 11 },
    ];

    for (const v of stickerVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 72,
        maxFileSizeMb: 20,
        maxZipSizeMb: 500,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Upload photos matching your selected variant quantity.",
          bulkNote: "Need a different quantity? Contact us for custom and bulk orders.",
        },
      },
      update: { uploadRequired: true, maxImages: 72 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload photos matching your selected variant quantity.",
      isRequired: true,
      sortOrder: 0,
    });

    console.log("✅ Sticker Polaroids seeded");
  }

  // ── 6. Laminated Polaroids ─────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "laminated-polaroids" },
      create: {
        categoryId: catPolaroids.id,
        name: "Laminated Polaroids",
        slug: "laminated-polaroids",
        description:
          "Preserve your favourite memories with our premium Laminated Polaroids. Each photo is protected with a high-quality lamination layer, making them more durable, long-lasting, and perfect for decorating your space, creating memory walls, scrapbooks, journals, and gifting.",
        shortDescription:
          "Premium laminated polaroid prints — durable, long-lasting, glossy or matte finish.",
        isActive: true,
        isFeatured: false,
        sortOrder: 5,
        metaTitle: "Laminated Polaroids | The Craft Pallet",
        metaDescription:
          "Personalised laminated polaroid prints. Glossy or matte finish. Multiple sizes available.",
        metaKeywords: "laminated polaroids, photo prints, laminated photos",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const laminatedVariants = [
      { name: "5×7cm — 18 Laminated",   sku: "LAM-5X7-18",    price: 129, sortOrder: 0 },
      { name: "6×7cm — 15 Laminated",   sku: "LAM-6X7-15",    price: 129, sortOrder: 1 },
      { name: "7×9cm — 18 Laminated",   sku: "LAM-7X9-18",    price: 159, sortOrder: 2 },
      { name: "10×10.5cm — 15 Laminated", sku: "LAM-10X10-15", price: 169, sortOrder: 3 },
    ];

    for (const v of laminatedVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 18,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
      },
      update: { uploadRequired: true, maxImages: 18 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload photos matching your selected variant quantity.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "finish", {
      label: "Lamination Finish",
      type: CustomFieldType.SELECT,
      helpText: "Choose your preferred lamination finish.",
      isRequired: true,
      sortOrder: 1,
    });

    const finishField = await prisma.customField.findFirst({
      where: { productId: product.id, name: "finish" },
    });
    if (finishField) {
      const existingOptions = await prisma.customFieldOption.findMany({
        where: { customFieldId: finishField.id },
      });
      if (existingOptions.length === 0) {
        await prisma.customFieldOption.createMany({
          data: [
            { customFieldId: finishField.id, label: "Glossy", value: "glossy", sortOrder: 0 },
            { customFieldId: finishField.id, label: "Matte",  value: "matte",  sortOrder: 1 },
          ],
        });
      }
    }

    await ensureCustomField(product.id, "orientation", {
      label: "Orientation",
      type: CustomFieldType.SELECT,
      helpText: "Choose portrait or landscape.",
      isRequired: true,
      sortOrder: 2,
    });

    const orientField = await prisma.customField.findFirst({
      where: { productId: product.id, name: "orientation" },
    });
    if (orientField) {
      const existingOptions = await prisma.customFieldOption.findMany({
        where: { customFieldId: orientField.id },
      });
      if (existingOptions.length === 0) {
        await prisma.customFieldOption.createMany({
          data: [
            { customFieldId: orientField.id, label: "Portrait",  value: "portrait",  sortOrder: 0 },
            { customFieldId: orientField.id, label: "Landscape", value: "landscape", sortOrder: 1 },
          ],
        });
      }
    }

    await ensureCustomField(product.id, "custom_text", {
      label: "Custom Text / Date (optional)",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Always • 12.02.2024",
      helpText: "Optional text or date to print on your polaroids.",
      isRequired: false,
      sortOrder: 3,
      validationJson: { maxTextLength: 50 },
    });

    console.log("✅ Laminated Polaroids seeded");
  }

  // ── 7. Wall Posters ────────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "wall-posters" },
      create: {
        categoryId: catPolaroids.id,
        name: "Wall Posters",
        slug: "wall-posters",
        description:
          "Transform your walls into a beautiful memory space with our personalised Wall Posters. Designed with your favourite photos, these posters add a unique and aesthetic touch to bedrooms, study spaces, and personal corners. Perfect for creating a dreamy photo wall or gifting your loved ones.\n\nSize: 10 × 15 cm",
        shortDescription:
          "Personalised wall posters (10×15cm) — create a beautiful memory space.",
        isActive: true,
        isFeatured: false,
        sortOrder: 6,
        metaTitle: "Wall Posters | The Craft Pallet",
        metaDescription:
          "Order personalised wall posters (10×15cm). 9 posters for ₹99. Custom and bulk orders available.",
        metaKeywords: "wall posters, personalised posters, photo wall, room decor",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.INCREMENTAL_QUANTITY,
        minimumOrderQuantity: 9,
        incrementQuantity: 9,
        incrementPrice: new Decimal(99),
      },
      update: {
        strategy: PricingStrategy.INCREMENTAL_QUANTITY,
        minimumOrderQuantity: 9,
        incrementQuantity: 9,
        incrementPrice: new Decimal(99),
      },
    });

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 9,
        maxImages: 18,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Need more posters? Custom quantities and bulk orders are available.",
        },
      },
      update: { uploadRequired: true, minImages: 9, maxImages: 18 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload 9–18 clear, high-quality photos.",
      isRequired: true,
      sortOrder: 0,
    });

    console.log("✅ Wall Posters seeded");
  }

  // ══════════════════════════════════════════════════════════════════════
  // PHOTO FRAMES
  // ══════════════════════════════════════════════════════════════════════

  // ── 8. Custom Frames ───────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "custom-frames" },
      create: {
        categoryId: catFrames.id,
        name: "Custom Frames",
        slug: "custom-frames",
        description:
          "Turn your favorite memories into beautiful customized frames. Choose any theme, occasion, or design — we'll create a frame that's uniquely yours. Perfect for birthdays, anniversaries, weddings, baby memories, friendship, and more. 💖\n\nA preview can be shared on request before printing.",
        shortDescription:
          "Personalised photo frames in 7 sizes — perfect for every occasion.",
        isActive: true,
        isFeatured: true,
        sortOrder: 0,
        metaTitle: "Custom Photo Frames | The Craft Pallet",
        metaDescription:
          "Order personalised photo frames from ₹149. Available in 7 sizes. Perfect for birthdays, anniversaries and gifting.",
        metaKeywords: "custom frames, personalised frames, photo frames, gift frames",
      },
      update: { isActive: true, isFeatured: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const frameVariants = [
      { name: "4×4 Frame",  sku: "FRAME-4X4",  price: 149, sortOrder: 0 },
      { name: "5×5 Frame",  sku: "FRAME-5X5",  price: 189, sortOrder: 1 },
      { name: "6×6 Frame",  sku: "FRAME-6X6",  price: 249, sortOrder: 2 },
      { name: "6×4 Frame",  sku: "FRAME-6X4",  price: 219, sortOrder: 3 },
      { name: "5×7 Frame",  sku: "FRAME-5X7",  price: 299, sortOrder: 4 },
      { name: "A5 Frame",   sku: "FRAME-A5",   price: 399, sortOrder: 5 },
      { name: "A4 Frame",   sku: "FRAME-A4",   price: 499, sortOrder: 6 },
    ];

    for (const v of frameVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 9,
        maxImages: 12,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Please upload a clear, high-resolution photo for the best print quality.",
          preview: "A preview can be shared on request before printing.",
        },
      },
      update: { uploadRequired: true, minImages: 9, maxImages: 12 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload 9–12 clear, high-resolution photos.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "message", {
      label: "Short Message",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Happy Birthday! Love you always.",
      helpText: "A short message to include on the frame.",
      isRequired: false,
      sortOrder: 1,
      validationJson: { maxTextLength: 80 },
    });

    await ensureCustomField(product.id, "date", {
      label: "Special Date",
      type: CustomFieldType.DATE,
      helpText: "Optional date to print on the frame.",
      isRequired: false,
      sortOrder: 2,
    });

    console.log("✅ Custom Frames seeded");
  }

  // ── 9. Mini Eye Frame ──────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "mini-eye-frame" },
      create: {
        categoryId: catFrames.id,
        name: "Mini Eye Frame",
        slug: "mini-eye-frame",
        description:
          "A personalized frame that captures the most beautiful part of your love story — your eyes. Customized with your favorite eye photos, it's a timeless keepsake that celebrates your unique bond in the simplest, most meaningful way. Perfect for anniversaries, birthdays, and special moments. ❤️👀\n\nShare clear, straight-facing eye photos (like the sample).\nAvoid blurry or side-angle photos for the best result.",
        shortDescription:
          "Personalised eye photo frame — a timeless keepsake for special moments.",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
        metaTitle: "Mini Eye Frame | The Craft Pallet",
        metaDescription:
          "Personalised mini eye frame from ₹149. A unique keepsake for anniversaries and birthdays.",
        metaKeywords: "eye frame, personalised frame, couple frame, memory frame",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const eyeVariants = [
      { name: "4×4 Frame", sku: "EYEMINI-4X4", price: 149, sortOrder: 0 },
      { name: "5×5 Frame", sku: "EYEMINI-5X5", price: 189, sortOrder: 1 },
      { name: "6×6 Frame", sku: "EYEMINI-6X6", price: 249, sortOrder: 2 },
    ];

    for (const v of eyeVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 2,
        maxImages: 2,
        maxFileSizeMb: 20,
        maxZipSizeMb: 100,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Share clear, straight-facing eye photos. Avoid blurry or side-angle photos.",
        },
      },
      update: { uploadRequired: true, minImages: 2, maxImages: 2 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Eye Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText:
        "Upload exactly 2 clear, straight-facing eye photos for the best result.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "message", {
      label: "Short Message",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Always & Forever",
      helpText: "Optional short message to include on the frame.",
      isRequired: false,
      sortOrder: 1,
      validationJson: { maxTextLength: 50 },
    });

    await ensureCustomField(product.id, "date", {
      label: "Special Date",
      type: CustomFieldType.DATE,
      helpText: "Optional date to print on the frame.",
      isRequired: false,
      sortOrder: 2,
    });

    console.log("✅ Mini Eye Frame seeded");
  }

  // ── 10. Couple Eye Frame ───────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "couple-eye-frame" },
      create: {
        categoryId: catFrames.id,
        name: "Couple Eye Frame",
        slug: "couple-eye-frame",
        description:
          "A personalized frame that captures the most beautiful part of your love story — your eyes. Customized with your favorite eye photos, it's a timeless keepsake that celebrates your unique bond in the simplest, most meaningful way. Perfect for anniversaries, birthdays, and special moments. ❤️👀\n\nShare clear, straight-facing eye photos (like the sample).\nAvoid blurry or side-angle photos for the best result.",
        shortDescription:
          "Personalised couple eye frame — celebrate your unique bond.",
        isActive: true,
        isFeatured: false,
        sortOrder: 2,
        metaTitle: "Couple Eye Frame | The Craft Pallet",
        metaDescription:
          "Personalised couple eye frame from ₹299. Perfect for anniversaries and birthdays.",
        metaKeywords: "couple eye frame, personalised frame, couple gift, memory frame",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const coupleEyeVariants = [
      { name: "5×7 Frame", sku: "EYECOUPLE-5X7", price: 299, sortOrder: 0 },
      { name: "A5 Frame",  sku: "EYECOUPLE-A5",  price: 399, sortOrder: 1 },
    ];

    for (const v of coupleEyeVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 2,
        maxImages: 2,
        maxFileSizeMb: 20,
        maxZipSizeMb: 100,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Share clear, straight-facing eye photos. Avoid blurry or side-angle photos.",
        },
      },
      update: { uploadRequired: true, minImages: 2, maxImages: 2 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Eye Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText:
        "Upload exactly 2 clear, straight-facing eye photos — one per person.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "message", {
      label: "Short Message",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Always & Forever",
      helpText: "Optional short message to include on the frame.",
      isRequired: false,
      sortOrder: 1,
      validationJson: { maxTextLength: 50 },
    });

    await ensureCustomField(product.id, "date", {
      label: "Special Date",
      type: CustomFieldType.DATE,
      helpText: "Optional date to print on the frame.",
      isRequired: false,
      sortOrder: 2,
    });

    console.log("✅ Couple Eye Frame seeded");
  }

  // ── 11. Pop Up Frame ───────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "pop-up-frame" },
      create: {
        categoryId: catFrames.id,
        name: "Pop Up Frame",
        slug: "pop-up-frame",
        description:
          "A unique frame featuring a black & white photo collage with a vibrant colored cutout photo in the center, creating a beautiful and eye-catching memory keepsake. Personalized with your photos & message.\n\nA preview can be shared on request before printing.",
        shortDescription:
          "Black & white collage frame with vibrant colour centre cutout — a stunning memory keepsake.",
        isActive: true,
        isFeatured: false,
        sortOrder: 3,
        metaTitle: "Pop Up Frame | The Craft Pallet",
        metaDescription:
          "Personalised pop up frame from ₹219. B&W collage with vibrant colour centre photo.",
        metaKeywords: "pop up frame, photo frame, collage frame, personalised frame",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const popUpVariants = [
      { name: "6×4 Frame", sku: "POPUP-6X4", price: 219, sortOrder: 0 },
      { name: "5×7 Frame", sku: "POPUP-5X7", price: 299, sortOrder: 1 },
      { name: "A5 Frame",  sku: "POPUP-A5",  price: 399, sortOrder: 2 },
      { name: "A4 Frame",  sku: "POPUP-A4",  price: 499, sortOrder: 3 },
    ];

    for (const v of popUpVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 10,
        maxFileSizeMb: 20,
        maxZipSizeMb: 200,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Please upload clear, high-resolution photos for the best print quality.",
          preview: "A preview can be shared on request before printing.",
        },
      },
      update: { uploadRequired: true, maxImages: 10 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload up to 10 clear, high-resolution photos.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "message", {
      label: "Short Message",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Happy Birthday! Love you always.",
      helpText: "A short message to include on the frame.",
      isRequired: false,
      sortOrder: 1,
      validationJson: { maxTextLength: 80 },
    });

    await ensureCustomField(product.id, "date", {
      label: "Special Date",
      type: CustomFieldType.DATE,
      helpText: "Optional date to print on the frame.",
      isRequired: false,
      sortOrder: 2,
    });

    console.log("✅ Pop Up Frame seeded");
  }

  // ══════════════════════════════════════════════════════════════════════
  // PERSONALISED GIFTS
  // ══════════════════════════════════════════════════════════════════════

  // ── 12. Customised Imported Wallet ─────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "customised-imported-wallet" },
      create: {
        categoryId: catGifts.id,
        name: "Customised Imported Wallet",
        slug: "customised-imported-wallet",
        description:
          "A premium imported faux leather wallet personalized with your name tag and a charm of your choice. Available only in Rust and Brown. Supports customization in any language and offers 50+ charm designs.",
        shortDescription:
          "Premium faux leather wallet with personalised name tag and charm. Available in Rust and Brown.",
        isActive: true,
        isFeatured: true,
        sortOrder: 0,
        metaTitle: "Customised Imported Wallet | The Craft Pallet",
        metaDescription:
          "Premium personalised faux leather wallet with name tag and charm. ₹449. Available in Rust and Brown.",
        metaKeywords:
          "personalised wallet, custom wallet, faux leather wallet, name wallet, gift wallet",
      },
      update: { isActive: true, isFeatured: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.PER_UNIT,
        unitPrice: new Decimal(449),
      },
      update: { strategy: PricingStrategy.PER_UNIT, unitPrice: new Decimal(449) },
    });

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: false,
        allowedExtensions: [],
        allowedSources: [],
        allowDuplicateImages: false,
        allowImageReordering: false,
        estimatedProductionDays: 10,
      },
      update: { uploadRequired: false },
    });

    const colorField = await ensureCustomField(product.id, "color", {
      label: "Wallet Color",
      type: CustomFieldType.SELECT,
      helpText: "Choose your preferred wallet color.",
      isRequired: true,
      sortOrder: 0,
    });

    const existingColorOptions = await prisma.customFieldOption.findMany({
      where: { customFieldId: colorField.id },
    });
    if (existingColorOptions.length === 0) {
      await prisma.customFieldOption.createMany({
        data: [
          { customFieldId: colorField.id, label: "Rust",  value: "rust",  sortOrder: 0 },
          { customFieldId: colorField.id, label: "Brown", value: "brown", sortOrder: 1 },
        ],
      });
    }

    const charmField = await ensureCustomField(product.id, "charm_number", {
      label: "Charm Design Number",
      type: CustomFieldType.SELECT,
      helpText: "Select your charm design number (refer to the charm chart image).",
      isRequired: true,
      sortOrder: 1,
    });

    const existingCharmOptions = await prisma.customFieldOption.findMany({
      where: { customFieldId: charmField.id },
    });
    if (existingCharmOptions.length === 0) {
      await prisma.customFieldOption.createMany({
        data: Array.from({ length: 50 }, (_, i) => ({
          customFieldId: charmField.id,
          label: `Charm ${i + 1}`,
          value: `${i + 1}`,
          sortOrder: i,
        })),
      });
    }

    await ensureCustomField(product.id, "name_text", {
      label: "Name / Text",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Priya, Love, Mom",
      helpText:
        "Enter the name or text to be printed on the wallet. Supports any language.",
      isRequired: true,
      sortOrder: 2,
      validationJson: { maxTextLength: 20 },
    });

    console.log("✅ Customised Imported Wallet seeded");
  }

  // ── 13. Customised Name Wallet ─────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "customised-name-wallet" },
      create: {
        categoryId: catGifts.id,
        name: "Customised Name Wallet",
        slug: "customised-name-wallet",
        description:
          "A premium faux leather wallet personalized with your name and a charm of your choice. Available in Red, Tan, Black, Green, Blue, and Brown. Features 2 cash slots, 3 card slots, and 1 hidden slot, making it both stylish and practical for everyday use.",
        shortDescription:
          "Faux leather wallet with name and charm. 2 cash slots, 3 card slots, 1 hidden slot. 6 colours.",
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
        metaTitle: "Customised Name Wallet | The Craft Pallet",
        metaDescription:
          "Premium personalised name wallet with charm. ₹399. Available in 6 colours.",
        metaKeywords:
          "personalised wallet, name wallet, custom wallet, faux leather wallet, gift wallet",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.PER_UNIT,
        unitPrice: new Decimal(399),
      },
      update: { strategy: PricingStrategy.PER_UNIT, unitPrice: new Decimal(399) },
    });

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: false,
        allowedExtensions: [],
        allowedSources: [],
        allowDuplicateImages: false,
        allowImageReordering: false,
        estimatedProductionDays: 10,
      },
      update: { uploadRequired: false },
    });

    const colorField = await ensureCustomField(product.id, "color", {
      label: "Wallet Color",
      type: CustomFieldType.SELECT,
      helpText: "Choose your preferred wallet color.",
      isRequired: true,
      sortOrder: 0,
    });

    const existingColorOptions = await prisma.customFieldOption.findMany({
      where: { customFieldId: colorField.id },
    });
    if (existingColorOptions.length === 0) {
      await prisma.customFieldOption.createMany({
        data: [
          { customFieldId: colorField.id, label: "Brown", value: "brown", sortOrder: 0 },
          { customFieldId: colorField.id, label: "Tan",   value: "tan",   sortOrder: 1 },
          { customFieldId: colorField.id, label: "Black", value: "black", sortOrder: 2 },
          { customFieldId: colorField.id, label: "Green", value: "green", sortOrder: 3 },
          { customFieldId: colorField.id, label: "Blue",  value: "blue",  sortOrder: 4 },
          { customFieldId: colorField.id, label: "Red",   value: "red",   sortOrder: 5 },
        ],
      });
    }

    const charmField = await ensureCustomField(product.id, "charm_number", {
      label: "Charm Design Number",
      type: CustomFieldType.SELECT,
      helpText: "Select your charm design number (refer to the charm chart image).",
      isRequired: true,
      sortOrder: 1,
    });

    const existingCharmOptions = await prisma.customFieldOption.findMany({
      where: { customFieldId: charmField.id },
    });
    if (existingCharmOptions.length === 0) {
      await prisma.customFieldOption.createMany({
        data: Array.from({ length: 50 }, (_, i) => ({
          customFieldId: charmField.id,
          label: `Charm ${i + 1}`,
          value: `${i + 1}`,
          sortOrder: i,
        })),
      });
    }

    await ensureCustomField(product.id, "name_text", {
      label: "Name / Text",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Rahul, Mom, Love",
      helpText:
        "Enter the name or text to be printed on the wallet. Supports any language.",
      isRequired: true,
      sortOrder: 2,
      validationJson: { maxTextLength: 20 },
    });

    console.log("✅ Customised Name Wallet seeded");
  }

  // ── 14. Customised Mug ─────────────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "customised-mug" },
      create: {
        categoryId: catGifts.id,
        name: "Customised Mug",
        slug: "customised-mug",
        description:
          "Turn your favorite memories into a gift you'll use every day! Personalize your mug with photos, names, quotes, dates, or special messages to make it truly one of a kind. Perfect for birthdays, anniversaries, couples, friends, and every special occasion.\n\nPlease upload a clear, high-resolution photo for the best print quality.",
        shortDescription:
          "Personalised photo mug — perfect for birthdays, anniversaries, and every special occasion.",
        isActive: true,
        isFeatured: false,
        sortOrder: 2,
        metaTitle: "Customised Mug | The Craft Pallet",
        metaDescription:
          "Order a personalised photo mug. ₹399. Upload up to 3 photos with a message.",
        metaKeywords:
          "personalised mug, custom mug, photo mug, gift mug, custom coffee mug",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        strategy: PricingStrategy.PER_UNIT,
        unitPrice: new Decimal(399),
      },
      update: { strategy: PricingStrategy.PER_UNIT, unitPrice: new Decimal(399) },
    });

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 3,
        maxFileSizeMb: 20,
        maxZipSizeMb: 100,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Please upload a clear, high-resolution photo for the best print quality.",
        },
      },
      update: { uploadRequired: true, minImages: 1, maxImages: 3 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photos",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload up to 3 clear, high-resolution photos.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "message", {
      label: "Short Message",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. Always in my heart ☕",
      helpText: "A short message or quote to print on the mug.",
      isRequired: false,
      sortOrder: 1,
      validationJson: { maxTextLength: 80 },
    });

    await ensureCustomField(product.id, "date", {
      label: "Special Date",
      type: CustomFieldType.DATE,
      helpText: "Optional date to print on the mug.",
      isRequired: false,
      sortOrder: 2,
    });

    console.log("✅ Customised Mug seeded");
  }

  // ── 15. Polaroid Fridge Magnet ─────────────────────────────────────────
  {
    const product = await prisma.product.upsert({
      where: { slug: "polaroid-fridge-magnet" },
      create: {
        categoryId: catGifts.id,
        name: "Polaroid Fridge Magnet",
        slug: "polaroid-fridge-magnet",
        description:
          "Turn your favorite memories into a personalized fridge magnet. Printed in a classic Polaroid style, it's a perfect way to display your special moments on any magnetic surface. A unique keepsake and thoughtful gift for any occasion. 🧲✨\n\nPlease upload a clear, high-resolution photo for the best print quality.",
        shortDescription:
          "Personalised polaroid-style fridge magnet — a unique keepsake for any occasion.",
        isActive: true,
        isFeatured: false,
        sortOrder: 3,
        metaTitle: "Polaroid Fridge Magnet | The Craft Pallet",
        metaDescription:
          "Personalised polaroid fridge magnets. 7×7cm ₹149 or 6×9cm ₹179. Unique gift for any occasion.",
        metaKeywords:
          "fridge magnet, polaroid magnet, personalised magnet, photo magnet, custom magnet",
      },
      update: { isActive: true },
    });

    await prisma.pricingConfiguration.upsert({
      where: { productId: product.id },
      create: { productId: product.id, strategy: PricingStrategy.FIXED_VARIANTS },
      update: { strategy: PricingStrategy.FIXED_VARIANTS },
    });

    const magnetVariants = [
      { name: "7×7 cm", sku: "MAGNET-7X7", price: 149, sortOrder: 0 },
      { name: "6×9 cm", sku: "MAGNET-6X9", price: 179, sortOrder: 1 },
    ];

    for (const v of magnetVariants) {
      await ensureVariant(product.id, v.sku, v);
    }

    await prisma.productConfiguration.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        uploadRequired: true,
        minImages: 1,
        maxImages: 2,
        maxFileSizeMb: 20,
        maxZipSizeMb: 100,
        allowedExtensions: defaultExtensions,
        allowedSources: photoSources,
        allowDuplicateImages: false,
        allowImageReordering: true,
        estimatedProductionDays: 10,
        extraRules: {
          note: "Please upload a clear, high-resolution photo for the best print quality.",
        },
      },
      update: { uploadRequired: true, minImages: 1, maxImages: 2 },
    });

    await ensureCustomField(product.id, "photos", {
      label: "Your Photo",
      type: CustomFieldType.PHOTO_UPLOAD,
      helpText: "Upload up to 2 clear, high-resolution photos.",
      isRequired: true,
      sortOrder: 0,
    });

    await ensureCustomField(product.id, "message", {
      label: "Short Message",
      type: CustomFieldType.TEXT,
      placeholder: "e.g. My Happy Place ✨",
      helpText: "A short message to print below the photo.",
      isRequired: false,
      sortOrder: 1,
      validationJson: { maxTextLength: 50 },
    });

    await ensureCustomField(product.id, "date", {
      label: "Special Date",
      type: CustomFieldType.DATE,
      helpText: "Optional date to print on the magnet.",
      isRequired: false,
      sortOrder: 2,
    });

    console.log("✅ Polaroid Fridge Magnet seeded");
  }

  console.log("\n🎉 All products seeded successfully!");
  console.log("\nSummary:");
  console.log("  📁 Categories: Polaroids, Photo Frames, Personalised Gifts");
  console.log("  📸 Polaroids:  Mini 36, Mini 30, Medium, Large, Sticker, Laminated, Wall Posters");
  console.log("  🖼️  Frames:    Custom Frames, Mini Eye Frame, Couple Eye Frame, Pop Up Frame");
  console.log("  🎁 Gifts:     Imported Wallet, Name Wallet, Mug, Fridge Magnet");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });