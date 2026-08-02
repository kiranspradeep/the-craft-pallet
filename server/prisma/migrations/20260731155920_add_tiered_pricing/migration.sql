-- AlterEnum
ALTER TYPE "PricingStrategy" ADD VALUE 'TIERED_PRICING';

-- AlterTable
ALTER TABLE "pricing_configurations" ADD COLUMN     "baseUnitPrice" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "pricing_tiers" (
    "id" TEXT NOT NULL,
    "pricingConfigId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "label" TEXT,
    "isSpecialOffer" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_tiers_pricingConfigId_idx" ON "pricing_tiers"("pricingConfigId");

-- AddForeignKey
ALTER TABLE "pricing_tiers" ADD CONSTRAINT "pricing_tiers_pricingConfigId_fkey" FOREIGN KEY ("pricingConfigId") REFERENCES "pricing_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
