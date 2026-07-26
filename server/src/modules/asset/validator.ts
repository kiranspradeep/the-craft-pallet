import { z } from "zod";

export const uploadDriveLinkSchema = z.object({
  body: z.object({
    driveUrl: z
      .string({ required_error: "Google Drive URL is required" })
      .url("Must be a valid URL"),
  }),
});

export const assetIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Asset ID is required"),
  }),
});

export const reorderFilesSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    files: z
      .array(
        z.object({
          id: z.string().min(1),
          sortOrder: z.number().int().min(0),
        })
      )
      .min(1, "At least one file required"),
  }),
});

export const uploadDirectSchema = z.object({
  body: z
    .object({
      productId: z.string().optional(),
    })
    .optional(),
});