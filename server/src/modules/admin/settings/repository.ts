import { prisma } from "../../../prisma/client.js";
import { Prisma } from "@prisma/client";

export const settingsRepository = {
  // ── Business ───────────────────────────────────────────────────────────

  getBusinessSettings: async () => {
    return prisma.businessSetting.findFirst();
  },

  upsertBusinessSettings: async (
    data: Prisma.BusinessSettingUpdateInput
  ) => {
    const existing = await prisma.businessSetting.findFirst();
    if (existing) {
      return prisma.businessSetting.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.businessSetting.create({
      data: {
        businessName:
          (data.businessName as string) ?? "The Craft Pallet",
        ...(data as Prisma.BusinessSettingCreateInput),
      },
    });
  },

  // ── Payment ────────────────────────────────────────────────────────────

  getPaymentSettings: async () => {
    return prisma.paymentSetting.findFirst();
  },

  upsertPaymentSettings: async (
    data: Prisma.PaymentSettingUpdateInput
  ) => {
    const existing = await prisma.paymentSetting.findFirst();
    if (existing) {
      return prisma.paymentSetting.update({
        where: { id: existing.id },
        data,
      });
    }
    const createData = data as Prisma.PaymentSettingCreateInput;
    return prisma.paymentSetting.create({
      data: {
        ...createData,
        gatewayName: createData.gatewayName ?? "manual",
      },
    });
  },

  // ── Shipping ───────────────────────────────────────────────────────────

  getShippingSettings: async () => {
    return prisma.shippingSetting.findFirst();
  },

  upsertShippingSettings: async (
    data: Prisma.ShippingSettingUpdateInput
  ) => {
    const existing = await prisma.shippingSetting.findFirst();
    if (existing) {
      return prisma.shippingSetting.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.shippingSetting.create({
      data: data as Prisma.ShippingSettingCreateInput,
    });
  },

  // ── WhatsApp ───────────────────────────────────────────────────────────

  getWhatsAppSettings: async () => {
    return prisma.whatsAppSetting.findFirst();
  },

  upsertWhatsAppSettings: async (
    data: Prisma.WhatsAppSettingUpdateInput
  ) => {
    const existing = await prisma.whatsAppSetting.findFirst();
    if (existing) {
      return prisma.whatsAppSetting.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.whatsAppSetting.create({
      data: data as Prisma.WhatsAppSettingCreateInput,
    });
  },

  // ── Image Retention ────────────────────────────────────────────────────

  getImageRetentionSettings: async () => {
    return prisma.imageRetentionSetting.findFirst();
  },

  upsertImageRetentionSettings: async (
    data: Prisma.ImageRetentionSettingUpdateInput
  ) => {
    const existing = await prisma.imageRetentionSetting.findFirst();
    if (existing) {
      return prisma.imageRetentionSetting.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.imageRetentionSetting.create({
      data: data as Prisma.ImageRetentionSettingCreateInput,
    });
  },
};