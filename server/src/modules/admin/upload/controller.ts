import { Request, Response } from "express";
import { uploadToCloudinary } from "../../../shared/utils/cloudinary.js";
import { sendSuccess } from "../../../shared/helpers/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { BadRequestError } from "../../../shared/errors/AppError.js";

export const adminUploadController = {
  // POST /api/admin/upload
  // Accepts one or more image files, uploads each to Cloudinary
  // Returns array of secure URLs
  uploadImages: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new BadRequestError("No files provided");
      }

      const folder = (req.body?.folder as string) || "craft-pallet/admin";

      const results = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, folder))
      );

      const urls = results.map((r) => r.secureUrl);

      sendSuccess({
        res,
        message: "Images uploaded to Cloudinary",
        data: { urls },
        statusCode: 201,
      });
    }
  ),
};