-- CreateEnum
CREATE TYPE "ShippingCategory" AS ENUM ('SMALL', 'MINI_FRAME', 'REGULAR_FRAME', 'LARGE_HEAVY');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "additionalUnitIncrement" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryIncrement" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shippingCategory" "ShippingCategory" NOT NULL DEFAULT 'SMALL';
