import { PrismaClient, AssetSourceType, PricingStrategy, CustomFieldType, ProductImageType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding products...");

  // ── Business Settings ──────────────────────────────────────────────────
  await prisma.businessSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      businessName: "The Craft Pallet",
      tagline: "Personalised Gifts & Printing",
      currency: "INR",
    },
    update: {
      businessName: "The Craft Pallet",
      tagline: "Personalised Gifts & Printing",
    },
  });

  // ── Shipping Settings ──────────────────────────────────────────────────
  await prisma.shippingSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      freeShippingThreshold: new Decimal(999),
      defaultShippingCharge: new Decimal(60),
      defaultProcessingDays: 10,
    },
    update: {
      freeShippingThreshold: new Decimal(999),
      defaultShippingCharge: new Decimal(60),
      defaultProcessingDays: 10,
    },
  });

  // ── Categories ─────────────────────────────────────────────────────────
  const polaroidsCategory = await prisma.category.upsert({
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

  const giftsCategory = await prisma.category.upsert({
    where: { slug: "personalised-gifts" },
    create: {
      name: "Personalised Gifts",
      slug: "personalised-gifts",
      description:
        "Unique personalised gifts for every occasion.",
      isActive: true,
      sortOrder: 1,
    },
    update: { name: "Personalised Gifts", isActive: true },
  });

  console.log("✅ Categories seeded");

  // ── Allowed sources for photo products ────────────────────────────────
  const photoSources: AssetSourceType[] = [
    AssetSourceType.DIRECT_UPLOAD,
    AssetSourceType.ZIP_UPLOAD,
    AssetSourceType.GOOGLE_DRIVE,
    AssetSourceType.WHATSAPP,
  ];

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT 1: Mini Polaroids (36 set)
  // Strategy: INCREMENTAL_QUANTITY — every 36 = ₹99
  // ────────────────────────────────────────────────────────────────────────
  const miniPolaroids36 = await prisma.product.upsert({
    where: { slug: "mini-polaroids-36" },
    create: {
      categoryId: polaroidsCategory.id,
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
    where: { productId: miniPolaroids36.id },
    create: {
      productId: miniPolaroids36.id,
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
    where: { productId: miniPolaroids36.id },
    create: {
      productId: miniPolaroids36.id,
      uploadRequired: true,
      minImages: 36,
      maxImages: 36,
      maxFileSizeMb: 20,
      maxZipSizeMb: 200,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
      allowedSources: photoSources,
      allowDuplicateImages: false,
      allowImageReordering: true,
      estimatedProductionDays: 10,
      extraRules: {
        note: "Please upload clear, high-quality images for the best print result.",
        warning: "Make sure photos are selected correctly before placing the order.",
      },
    },
    update: {
      uploadRequired: true,
      minImages: 36,
      maxImages: 36,
      allowedSources: photoSources,
    },
  });

  // Custom field — Photo Upload
  const existingMiniField = await prisma.customField.findFirst({
    where: { productId: miniPolaroids36.id, name: "photos" },
  });
  if (!existingMiniField) {
    await prisma.customField.create({
      data: {
        productId: miniPolaroids36.id,
        name: "photos",
        label: "Your Photos",
        type: CustomFieldType.PHOTO_UPLOAD,
        helpText:
          "Upload exactly 36 clear, high-quality photos. Supported formats: JPG, PNG, WEBP, HEIC.",
        isRequired: true,
        sortOrder: 0,
      },
    });
  }

  console.log("✅ Mini Polaroids 36 seeded");

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT 2: Mini Polaroids (30 set)
  // Strategy: INCREMENTAL_QUANTITY — every 30 = ₹99
  // ────────────────────────────────────────────────────────────────────────
  const miniPolaroids30 = await prisma.product.upsert({
    where: { slug: "mini-polaroids-30" },
    create: {
      categoryId: polaroidsCategory.id,
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
    where: { productId: miniPolaroids30.id },
    create: {
      productId: miniPolaroids30.id,
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
    where: { productId: miniPolaroids30.id },
    create: {
      productId: miniPolaroids30.id,
      uploadRequired: true,
      minImages: 30,
      maxImages: 30,
      maxFileSizeMb: 20,
      maxZipSizeMb: 200,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
      allowedSources: photoSources,
      allowDuplicateImages: false,
      allowImageReordering: true,
      estimatedProductionDays: 10,
      extraRules: {
        note: "Upload clear, high-quality photos for the best printing result.",
        warning: "Customised orders cannot be changed after printing begins.",
        colourNote: "Colour may slightly vary due to screen and printing differences.",
      },
    },
    update: {
      uploadRequired: true,
      minImages: 30,
      maxImages: 30,
      allowedSources: photoSources,
    },
  });

  const existingMini30Field = await prisma.customField.findFirst({
    where: { productId: miniPolaroids30.id, name: "photos" },
  });
  if (!existingMini30Field) {
    await prisma.customField.create({
      data: {
        productId: miniPolaroids30.id,
        name: "photos",
        label: "Your Photos",
        type: CustomFieldType.PHOTO_UPLOAD,
        helpText:
          "Upload exactly 30 clear, high-quality photos.",
        isRequired: true,
        sortOrder: 0,
      },
    });
  }

  console.log("✅ Mini Polaroids 30 seeded");

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT 3: Medium Polaroids
  // Strategy: TIERED_PRICING
  // Base: ₹9 per polaroid
  // Tiers: 18 = ₹149, 36 = ₹259
  // Variants: 7×10 cm size
  // ────────────────────────────────────────────────────────────────────────
  const mediumPolaroids = await prisma.product.upsert({
    where: { slug: "medium-polaroids" },
    create: {
      categoryId: polaroidsCategory.id,
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
        "Order personalised medium polaroid prints (7×10cm). ₹9 per print or special offer sets. Premium quality.",
      metaKeywords: "medium polaroids, photo prints, personalised polaroids, 7x10",
    },
    update: { isActive: true, isFeatured: true },
  });

  // Variant: size
  const existingMedVariant = await prisma.productVariant.findFirst({
    where: { productId: mediumPolaroids.id, name: "7 × 10 cm" },
  });
  if (!existingMedVariant) {
    await prisma.productVariant.create({
      data: {
        productId: mediumPolaroids.id,
        name: "7 × 10 cm",
        price: new Decimal(9), // base per-print price shown on variant
        isActive: true,
        sortOrder: 0,
      },
    });
  }

  const medPricingConfig = await prisma.pricingConfiguration.upsert({
    where: { productId: mediumPolaroids.id },
    create: {
      productId: mediumPolaroids.id,
      strategy: PricingStrategy.TIERED_PRICING,
      baseUnitPrice: new Decimal(9),
    },
    update: {
      strategy: PricingStrategy.TIERED_PRICING,
      baseUnitPrice: new Decimal(9),
    },
  });

  // Seed tiers — check before creating
  const tier18Exists = await prisma.pricingTier.findFirst({
    where: { pricingConfigId: medPricingConfig.id, quantity: 18 },
  });
  if (!tier18Exists) {
    await prisma.pricingTier.create({
      data: {
        pricingConfigId: medPricingConfig.id,
        quantity: 18,
        price: new Decimal(149),
        label: "Starter Set",
        isSpecialOffer: false,
        sortOrder: 0,
      },
    });
  }

  const tier36Exists = await prisma.pricingTier.findFirst({
    where: { pricingConfigId: medPricingConfig.id, quantity: 36 },
  });
  if (!tier36Exists) {
    await prisma.pricingTier.create({
      data: {
        pricingConfigId: medPricingConfig.id,
        quantity: 36,
        price: new Decimal(259),
        label: "Best Value 🔥",
        isSpecialOffer: true,
        sortOrder: 1,
      },
    });
  }

  await prisma.productConfiguration.upsert({
    where: { productId: mediumPolaroids.id },
    create: {
      productId: mediumPolaroids.id,
      uploadRequired: true,
      minImages: 1,
      maxImages: 36,
      maxFileSizeMb: 20,
      maxZipSizeMb: 200,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
      allowedSources: photoSources,
      allowDuplicateImages: false,
      allowImageReordering: true,
      estimatedProductionDays: 10,
      extraRules: {
        note: "Upload clear, high-quality photos for the best printing result.",
        warning: "Customised orders cannot be changed after printing begins.",
        bulkNote: "Need more prints? Contact us for custom quantities and bulk pricing.",
      },
    },
    update: {
      uploadRequired: true,
      maxImages: 36,
      allowedSources: photoSources,
    },
  });

  const existingMedField = await prisma.customField.findFirst({
    where: { productId: mediumPolaroids.id, name: "photos" },
  });
  if (!existingMedField) {
    await prisma.customField.create({
      data: {
        productId: mediumPolaroids.id,
        name: "photos",
        label: "Your Photos",
        type: CustomFieldType.PHOTO_UPLOAD,
        helpText:
          "Upload your photos. Select a pricing tier to determine quantity.",
        isRequired: true,
        sortOrder: 0,
      },
    });
  }

  console.log("✅ Medium Polaroids seeded");

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT 4: Sticker Polaroids
  // Strategy: FIXED_VARIANTS — each size+quantity combo is a variant
  // ────────────────────────────────────────────────────────────────────────
  const stickerPolaroids = await prisma.product.upsert({
    where: { slug: "sticker-polaroids" },
    create: {
      categoryId: polaroidsCategory.id,
      name: "Sticker Polaroids",
      slug: "sticker-polaroids",
      description:
        "Turn your favourite memories into fun, peel-and-stick keepsakes! Our premium Sticker Polaroids are printed with vibrant colours on high-quality self-adhesive photo paper, making them perfect for decorating laptops, journals, phone cases, scrapbooks, gift boxes, water bottles, and more.",
      shortDescription:
        "Peel-and-stick personalised polaroid stickers — vibrant colours, premium self-adhesive paper.",
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
      metaTitle: "Sticker Polaroids | The Craft Pallet",
      metaDescription:
        "Personalised sticker polaroids in 3 sizes. Perfect for laptops, journals, phone cases and scrapbooks.",
      metaKeywords: "sticker polaroids, photo stickers, personalised stickers, polaroid stickers",
    },
    update: { isActive: true, isFeatured: true },
  });

  await prisma.pricingConfiguration.upsert({
    where: { productId: stickerPolaroids.id },
    create: {
      productId: stickerPolaroids.id,
      strategy: PricingStrategy.FIXED_VARIANTS,
    },
    update: { strategy: PricingStrategy.FIXED_VARIANTS },
  });

  // Create variants — size + quantity combos
  const stickerVariants = [
    // 5 × 7 cm
    { name: "5×7cm — 18 Stickers", sku: "STICKER-5X7-18", price: 108, sortOrder: 0 },
    { name: "5×7cm — 36 Stickers", sku: "STICKER-5X7-36", price: 216, sortOrder: 1 },
    { name: "5×7cm — 54 Stickers", sku: "STICKER-5X7-54", price: 324, sortOrder: 2 },
    { name: "5×7cm — 72 Stickers", sku: "STICKER-5X7-72", price: 432, sortOrder: 3 },
    // 6 × 7 cm
    { name: "6×7cm — 15 Stickers", sku: "STICKER-6X7-15", price: 90, sortOrder: 4 },
    { name: "6×7cm — 30 Stickers", sku: "STICKER-6X7-30", price: 180, sortOrder: 5 },
    { name: "6×7cm — 45 Stickers", sku: "STICKER-6X7-45", price: 270, sortOrder: 6 },
    { name: "6×7cm — 60 Stickers", sku: "STICKER-6X7-60", price: 360, sortOrder: 7 },
    // 7 × 10 cm
    { name: "7×10cm — 18 Stickers", sku: "STICKER-7X10-18", price: 162, sortOrder: 8 },
    { name: "7×10cm — 36 Stickers", sku: "STICKER-7X10-36", price: 324, sortOrder: 9 },
    { name: "7×10cm — 54 Stickers", sku: "STICKER-7X10-54", price: 486, sortOrder: 10 },
    { name: "7×10cm — 72 Stickers", sku: "STICKER-7X10-72", price: 648, sortOrder: 11 },
  ];

  for (const v of stickerVariants) {
    const existing = await prisma.productVariant.findUnique({
      where: { sku: v.sku },
    });
    if (!existing) {
      await prisma.productVariant.create({
        data: {
          productId: stickerPolaroids.id,
          name: v.name,
          sku: v.sku,
          price: new Decimal(v.price),
          isActive: true,
          sortOrder: v.sortOrder,
        },
      });
    }
  }

  await prisma.productConfiguration.upsert({
    where: { productId: stickerPolaroids.id },
    create: {
      productId: stickerPolaroids.id,
      uploadRequired: true,
      minImages: 1,
      maxImages: 72,
      maxFileSizeMb: 20,
      maxZipSizeMb: 500,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
      allowedSources: photoSources,
      allowDuplicateImages: false,
      allowImageReordering: true,
      estimatedProductionDays: 10,
      extraRules: {
        note: "Upload photos matching your selected variant quantity.",
        bulkNote: "Need a different quantity? Contact us for custom and bulk orders.",
      },
    },
    update: {
      uploadRequired: true,
      maxImages: 72,
      allowedSources: photoSources,
    },
  });

  const existingStickerField = await prisma.customField.findFirst({
    where: { productId: stickerPolaroids.id, name: "photos" },
  });
  if (!existingStickerField) {
    await prisma.customField.create({
      data: {
        productId: stickerPolaroids.id,
        name: "photos",
        label: "Your Photos",
        type: CustomFieldType.PHOTO_UPLOAD,
        helpText:
          "Upload photos matching your selected variant quantity.",
        isRequired: true,
        sortOrder: 0,
      },
    });
  }

  console.log("✅ Sticker Polaroids seeded");

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT 5: Wall Posters
  // Strategy: INCREMENTAL_QUANTITY — every 9 = ₹99
  // ────────────────────────────────────────────────────────────────────────
  const wallPosters = await prisma.product.upsert({
    where: { slug: "wall-posters" },
    create: {
      categoryId: polaroidsCategory.id,
      name: "Wall Posters",
      slug: "wall-posters",
      description:
        "Transform your walls into a beautiful memory space with our personalised Wall Posters. Designed with your favourite photos, these posters add a unique and aesthetic touch to bedrooms, study spaces, and personal corners. Perfect for creating a dreamy photo wall or gifting your loved ones.\n\nSize: 10 × 15 cm",
      shortDescription:
        "Personalised wall posters (10×15cm) — create a beautiful memory space.",
      isActive: true,
      isFeatured: false,
      sortOrder: 4,
      metaTitle: "Wall Posters | The Craft Pallet",
      metaDescription:
        "Order personalised wall posters (10×15cm). 9 posters for ₹99. Custom and bulk orders available.",
      metaKeywords: "wall posters, personalised posters, photo wall, room decor",
    },
    update: { isActive: true },
  });

  await prisma.pricingConfiguration.upsert({
    where: { productId: wallPosters.id },
    create: {
      productId: wallPosters.id,
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
    where: { productId: wallPosters.id },
    create: {
      productId: wallPosters.id,
      uploadRequired: true,
      minImages: 9,
      maxImages: 18,
      maxFileSizeMb: 20,
      maxZipSizeMb: 200,
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
      allowedSources: photoSources,
      allowDuplicateImages: false,
      allowImageReordering: true,
      estimatedProductionDays: 10,
      extraRules: {
        note: "Need more posters? Custom quantities and bulk orders are available.",
      },
    },
    update: {
      uploadRequired: true,
      minImages: 9,
      maxImages: 18,
      allowedSources: photoSources,
    },
  });

  const existingWallField = await prisma.customField.findFirst({
    where: { productId: wallPosters.id, name: "photos" },
  });
  if (!existingWallField) {
    await prisma.customField.create({
      data: {
        productId: wallPosters.id,
        name: "photos",
        label: "Your Photos",
        type: CustomFieldType.PHOTO_UPLOAD,
        helpText: "Upload 9–18 clear, high-quality photos.",
        isRequired: true,
        sortOrder: 0,
      },
    });
  }

  console.log("✅ Wall Posters seeded");

  // ────────────────────────────────────────────────────────────────────────
  // PRODUCT 6: Customised Imported Wallet
  // Strategy: PER_UNIT — ₹449 flat
  // Custom fields: Color (SELECT), Charm Number (SELECT 1-50), Name (TEXT)
  // ────────────────────────────────────────────────────────────────────────
  const wallet = await prisma.product.upsert({
    where: { slug: "customised-imported-wallet" },
    create: {
      categoryId: giftsCategory.id,
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
    where: { productId: wallet.id },
    create: {
      productId: wallet.id,
      strategy: PricingStrategy.PER_UNIT,
      unitPrice: new Decimal(449),
    },
    update: {
      strategy: PricingStrategy.PER_UNIT,
      unitPrice: new Decimal(449),
    },
  });

  await prisma.productConfiguration.upsert({
    where: { productId: wallet.id },
    create: {
      productId: wallet.id,
      uploadRequired: false,
      maxFileSizeMb: 10,
      allowedExtensions: [],
      allowedSources: [],
      allowDuplicateImages: false,
      allowImageReordering: false,
      estimatedProductionDays: 10,
    },
    update: { uploadRequired: false },
  });

  // Custom fields
  const existingColorField = await prisma.customField.findFirst({
    where: { productId: wallet.id, name: "color" },
  });

  if (!existingColorField) {
    // Field 1: Color
    const colorField = await prisma.customField.create({
      data: {
        productId: wallet.id,
        name: "color",
        label: "Wallet Color",
        type: CustomFieldType.SELECT,
        helpText: "Choose your preferred wallet color.",
        isRequired: true,
        sortOrder: 0,
      },
    });

    await prisma.customFieldOption.createMany({
      data: [
        { customFieldId: colorField.id, label: "Rust", value: "rust", sortOrder: 0 },
        { customFieldId: colorField.id, label: "Brown", value: "brown", sortOrder: 1 },
      ],
    });

    // Field 2: Charm selection (1–50)
    const charmField = await prisma.customField.create({
      data: {
        productId: wallet.id,
        name: "charm_number",
        label: "Charm Design Number",
        type: CustomFieldType.SELECT,
        helpText:
          "Select your charm design number (refer to the charm chart image above).",
        isRequired: true,
        sortOrder: 1,
      },
    });

    // Seed charms 1–50
    const charmOptions = Array.from({ length: 50 }, (_, i) => ({
      customFieldId: charmField.id,
      label: `Charm ${i + 1}`,
      value: `${i + 1}`,
      sortOrder: i,
    }));
    await prisma.customFieldOption.createMany({ data: charmOptions });

    // Field 3: Name
    await prisma.customField.create({
      data: {
        productId: wallet.id,
        name: "name_text",
        label: "Name / Text",
        type: CustomFieldType.TEXT,
        placeholder: "e.g. Priya, Love, Mom",
        helpText:
          "Enter the name or text to be printed on the wallet. Supports any language.",
        isRequired: true,
        sortOrder: 2,
        validationJson: { maxLength: 20 },
      },
    });
  }

  console.log("✅ Customised Wallet seeded");

  console.log("\n✅ All products seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });