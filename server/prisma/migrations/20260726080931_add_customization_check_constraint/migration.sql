ALTER TABLE "customizations"
ADD CONSTRAINT "chk_customization_owner"
CHECK (
    ("cartItemId" IS NOT NULL AND "orderItemId" IS NULL)
    OR
    ("cartItemId" IS NULL AND "orderItemId" IS NOT NULL)
);