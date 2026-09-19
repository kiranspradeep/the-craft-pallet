-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "additionalUnitIncrement" DECIMAL(10,2),
ADD COLUMN     "deliveryIncrement" DECIMAL(10,2),
ADD COLUMN     "shippingCategory" "ShippingCategory";
