import { prisma } from "../../prisma/client.js";
import {
  Asset,
  AssetFile,
  AssetSourceType,
  AssetStatus,
  FileProcessingJob,
  JobStatus,
  JobType,
  Prisma,
} from "@prisma/client";

export type AssetWithFiles = Prisma.AssetGetPayload<{
  include: { files: true; processingJobs: true };
}>;

export const assetRepository = {
  // ── Asset ────────────────────────────────────────────────────────────

  create: async (data: {
    sourceType: AssetSourceType;
    status?: AssetStatus;
    externalUrl?: string;
    externalRef?: string;
    notes?: string;
  }): Promise<Asset> => {
    return prisma.asset.create({
      data: {
        sourceType: data.sourceType,
        status: data.status ?? AssetStatus.WAITING,
        externalUrl: data.externalUrl,
        externalRef: data.externalRef,
        notes: data.notes,
      },
    });
  },

  findById: async (id: string): Promise<AssetWithFiles | null> => {
    return prisma.asset.findUnique({
      where: { id },
      include: { files: { orderBy: { sortOrder: "asc" } }, processingJobs: true },
    });
  },

  updateStatus: async (
    id: string,
    status: AssetStatus,
    extra?: {
      uploadProgress?: number;
      processingProgress?: number;
      notes?: string;
      reviewedAt?: Date;
    }
  ): Promise<Asset> => {
    return prisma.asset.update({
      where: { id },
      data: {
        status,
        ...(extra?.uploadProgress !== undefined && {
          uploadProgress: extra.uploadProgress,
        }),
        ...(extra?.processingProgress !== undefined && {
          processingProgress: extra.processingProgress,
        }),
        ...(extra?.notes !== undefined && { notes: extra.notes }),
        ...(extra?.reviewedAt && { reviewedAt: extra.reviewedAt }),
      },
    });
  },

  delete: async (id: string): Promise<void> => {
    await prisma.asset.delete({ where: { id } });
  },

  // ── Asset Files ──────────────────────────────────────────────────────

  createFile: async (data: {
    assetId: string;
    originalName: string;
    storedName: string;
    storagePath: string;
    previewPath?: string;
    mimeType?: string;
    fileSize?: number;
    checksum?: string;
    width?: number;
    height?: number;
    sortOrder?: number;
  }): Promise<AssetFile> => {
    return prisma.assetFile.create({
      data: {
        assetId: data.assetId,
        originalName: data.originalName,
        storedName: data.storedName,
        storagePath: data.storagePath,
        previewPath: data.previewPath,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        checksum: data.checksum,
        width: data.width,
        height: data.height,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  },

  findFilesByAssetId: async (assetId: string): Promise<AssetFile[]> => {
    return prisma.assetFile.findMany({
      where: { assetId },
      orderBy: { sortOrder: "asc" },
    });
  },

  findFileByChecksum: async (
    assetId: string,
    checksum: string
  ): Promise<AssetFile | null> => {
    return prisma.assetFile.findFirst({
      where: { assetId, checksum },
    });
  },

  updateFileSortOrders: async (
    updates: { id: string; sortOrder: number }[]
  ): Promise<void> => {
    await prisma.$transaction(
      updates.map(({ id, sortOrder }) =>
        prisma.assetFile.update({ where: { id }, data: { sortOrder } })
      )
    );
  },

  updateFilePreviewPath: async (
    fileId: string,
    previewPath: string
  ): Promise<AssetFile> => {
    return prisma.assetFile.update({
      where: { id: fileId },
      data: { previewPath },
    });
  },

  // ── Processing Jobs ──────────────────────────────────────────────────

  createJob: async (data: {
    assetId: string;
    type: JobType;
    maxAttempts?: number;
  }): Promise<FileProcessingJob> => {
    return prisma.fileProcessingJob.create({
      data: {
        assetId: data.assetId,
        type: data.type,
        status: JobStatus.QUEUED,
        maxAttempts: data.maxAttempts ?? 3,
      },
    });
  },

  updateJob: async (
    jobId: string,
    data: {
      status?: JobStatus;
      progress?: number;
      errorMessage?: string;
      startedAt?: Date;
      completedAt?: Date;
      nextRetryAt?: Date;
      attempts?: number;
    }
  ): Promise<FileProcessingJob> => {
    return prisma.fileProcessingJob.update({
      where: { id: jobId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.errorMessage !== undefined && {
          errorMessage: data.errorMessage,
        }),
        ...(data.startedAt && { startedAt: data.startedAt }),
        ...(data.completedAt && { completedAt: data.completedAt }),
        ...(data.nextRetryAt && { nextRetryAt: data.nextRetryAt }),
        ...(data.attempts !== undefined && { attempts: data.attempts }),
      },
    });
  },

  findPendingJobs: async (): Promise<FileProcessingJob[]> => {
    return prisma.fileProcessingJob.findMany({
      where: {
        status: { in: [JobStatus.QUEUED, JobStatus.RETRYING] },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: "asc" },
    });
  },
};