/*
  Warnings:

  - You are about to drop the column `defaultProcessingDays` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultShippingCharge` on the `shipping_settings` table. All the data in the column will be lost.
  - You are about to drop the column `freeShippingThreshold` on the `shipping_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shipping_settings" DROP COLUMN "defaultProcessingDays",
DROP COLUMN "defaultShippingCharge",
DROP COLUMN "freeShippingThreshold",
ADD COLUMN     "keralaProcessingDays" INTEGER,
ADD COLUMN     "keralaShippingCharge" DECIMAL(10,2),
ADD COLUMN     "outsideKeralaProcessingDays" INTEGER,
ADD COLUMN     "outsideKeralaShippingCharge" DECIMAL(10,2);
