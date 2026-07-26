import { z } from "zod";

// ── Business Settings ─────────────────────────────────────────────────────

export const updateBusinessSettingsSchema = z.object({
  body: z.object({
    businessName: z.string().min(1).max(200).optional(),
    tagline: z.string().max(300).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    logoUrl: z.string().url().optional().or(z.literal("")),
    faviconUrl: z.string().url().optional().or(z.literal("")),
    instagramUrl: z.string().url().optional().or(z.literal("")),
    currency: z.string().max(10).optional(),
    minOrderAmount: z.number().positive().optional(),
  }),
});

// ── Payment Settings ──────────────────────────────────────────────────────

export const updatePaymentSettingsSchema = z.object({
  body: z.object({
    gatewayName: z.string().min(1).max(100).optional(),
    isLiveMode: z.boolean().optional(),
    apiKey: z.string().max(200).optional(),
    apiSecret: z.string().max(200).optional(),
    webhookSecret: z.string().max(200).optional(),
    upiId: z.string().max(100).optional(),
    codEnabled: z.boolean().optional(),
    codMaxOrderAmount: z.number().positive().optional(),
  }),
});

// ── Shipping Settings ─────────────────────────────────────────────────────

export const updateShippingSettingsSchema = z.object({
  body: z.object({
    freeShippingThreshold: z.number().min(0).optional(),
    defaultShippingCharge: z.number().min(0).optional(),
    defaultProcessingDays: z.number().int().positive().optional(),
  }),
});

// ── WhatsApp Settings ─────────────────────────────────────────────────────

export const updateWhatsAppSettingsSchema = z.object({
  body: z.object({
    phoneNumber: z.string().max(20).optional(),
    isEnabled: z.boolean().optional(),
    orderMessageTemplate: z.string().max(1000).optional(),
  }),
});

// ── Image Retention Settings ──────────────────────────────────────────────

export const updateImageRetentionSettingsSchema = z.object({
  body: z.object({
    retentionDays: z.number().int().min(0).optional(),
    maxUploadSizeMb: z.number().int().positive().optional(),
    allowedMimeTypes: z.array(z.string()).optional(),
    storageProvider: z.string().max(50).optional(),
    storageBucket: z.string().max(200).optional(),
    storageRegion: z.string().max(100).optional(),
  }),
});