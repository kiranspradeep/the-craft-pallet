import { Decimal } from "@prisma/client/runtime/library.js";
import { settingsRepository } from "./repository.js";

export const settingsService = {
  // ── Business ───────────────────────────────────────────────────────────

  getBusinessSettings: async () => {
    return settingsRepository.getBusinessSettings();
  },

  updateBusinessSettings: async (input: {
    businessName?: string;
    tagline?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    faviconUrl?: string;
    instagramUrl?: string;
    currency?: string;
    minOrderAmount?: number;
  }) => {
    return settingsRepository.upsertBusinessSettings({
      ...(input.businessName && { businessName: input.businessName }),
      ...(input.tagline !== undefined && { tagline: input.tagline }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.address !== undefined && { address: input.address || null }),
      ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl || null }),
      ...(input.faviconUrl !== undefined && {
        faviconUrl: input.faviconUrl || null,
      }),
      ...(input.instagramUrl !== undefined && {
        instagramUrl: input.instagramUrl || null,
      }),
      ...(input.currency && { currency: input.currency }),
      ...(input.minOrderAmount !== undefined && {
        minOrderAmount: new Decimal(input.minOrderAmount),
      }),
    });
  },

  // ── Payment ────────────────────────────────────────────────────────────

  getPaymentSettings: async () => {
    const settings = await settingsRepository.getPaymentSettings();
    if (!settings) return null;
    return {
      ...settings,
      apiSecret: settings.apiSecret ? "••••••••" : null,
      webhookSecret: settings.webhookSecret ? "••••••••" : null,
    };
  },

  updatePaymentSettings: async (input: {
    gatewayName?: string;
    isLiveMode?: boolean;
    apiKey?: string;
    apiSecret?: string;
    webhookSecret?: string;
    upiId?: string;
    codEnabled?: boolean;
    codMaxOrderAmount?: number;
  }) => {
    return settingsRepository.upsertPaymentSettings({
      ...(input.gatewayName && { gatewayName: input.gatewayName }),
      ...(input.isLiveMode !== undefined && { isLiveMode: input.isLiveMode }),
      ...(input.apiKey !== undefined && { apiKey: input.apiKey || null }),
      ...(input.apiSecret !== undefined && {
        apiSecret: input.apiSecret || null,
      }),
      ...(input.webhookSecret !== undefined && {
        webhookSecret: input.webhookSecret || null,
      }),
      ...(input.upiId !== undefined && { upiId: input.upiId || null }),
      ...(input.codEnabled !== undefined && { codEnabled: input.codEnabled }),
      ...(input.codMaxOrderAmount !== undefined && {
        codMaxOrderAmount: new Decimal(input.codMaxOrderAmount),
      }),
    });
  },

  // ── Shipping ───────────────────────────────────────────────────────────

  getShippingSettings: async () => {
    return settingsRepository.getShippingSettings();
  },

  updateShippingSettings: async (input: {
    keralaShippingCharge?: number;
    outsideKeralaShippingCharge?: number;
    keralaProcessingDays?: number;
    outsideKeralaProcessingDays?: number;
  }) => {
    return settingsRepository.upsertShippingSettings({
      ...(input.keralaShippingCharge !== undefined && {
        keralaShippingCharge: new Decimal(input.keralaShippingCharge),
      }),
      ...(input.outsideKeralaShippingCharge !== undefined && {
        outsideKeralaShippingCharge: new Decimal(
          input.outsideKeralaShippingCharge
        ),
      }),
      ...(input.keralaProcessingDays !== undefined && {
        keralaProcessingDays: input.keralaProcessingDays,
      }),
      ...(input.outsideKeralaProcessingDays !== undefined && {
        outsideKeralaProcessingDays: input.outsideKeralaProcessingDays,
      }),
    });
  },

  // ── WhatsApp ───────────────────────────────────────────────────────────

  getWhatsAppSettings: async () => {
    return settingsRepository.getWhatsAppSettings();
  },

  updateWhatsAppSettings: async (input: {
    phoneNumber?: string;
    isEnabled?: boolean;
    orderMessageTemplate?: string;
  }) => {
    return settingsRepository.upsertWhatsAppSettings({
      ...(input.phoneNumber !== undefined && {
        phoneNumber: input.phoneNumber || null,
      }),
      ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
      ...(input.orderMessageTemplate !== undefined && {
        orderMessageTemplate: input.orderMessageTemplate || null,
      }),
    });
  },

  // ── Image Retention ────────────────────────────────────────────────────

  getImageRetentionSettings: async () => {
    return settingsRepository.getImageRetentionSettings();
  },

  updateImageRetentionSettings: async (input: {
    retentionDays?: number;
    maxUploadSizeMb?: number;
    allowedMimeTypes?: string[];
    storageProvider?: string;
    storageBucket?: string;
    storageRegion?: string;
  }) => {
    return settingsRepository.upsertImageRetentionSettings({
      ...(input.retentionDays !== undefined && {
        retentionDays: input.retentionDays,
      }),
      ...(input.maxUploadSizeMb !== undefined && {
        maxUploadSizeMb: input.maxUploadSizeMb,
      }),
      ...(input.allowedMimeTypes !== undefined && {
        allowedMimeTypes: input.allowedMimeTypes,
      }),
      ...(input.storageProvider !== undefined && {
        storageProvider: input.storageProvider,
      }),
      ...(input.storageBucket !== undefined && {
        storageBucket: input.storageBucket || null,
      }),
      ...(input.storageRegion !== undefined && {
        storageRegion: input.storageRegion || null,
      }),
    });
  },
};